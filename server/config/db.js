import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');

const INITIAL_DATA = {
  users: [],
  items: [],
  claims: []
};

class Database {
  constructor() {
    this.ensureDbExists();
  }

  ensureDbExists() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    }
  }

  read() {
    try {
      this.ensureDbExists();
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Database read error, reinitializing:', err);
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
  }

  write(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Users
  findUserByEmail(email) {
    const db = this.read();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    const db = this.read();
    return db.users.find(u => u._id === id);
  }

  createUser(user) {
    const db = this.read();
    db.users.push(user);
    this.write(db);
    return user;
  }

  getAllUsers() {
    return this.read().users;
  }

  // Items
  getItems({ search, type, category, status, location, reportedBy } = {}) {
    const db = this.read();
    let items = db.items.filter(i => !i.isDeleted);

    if (reportedBy) {
      items = items.filter(i => i.reportedBy._id === reportedBy);
    }

    if (type && type !== 'all') {
      items = items.filter(i => i.type.toLowerCase() === type.toLowerCase());
    }

    if (category && category !== 'all') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== 'all') {
      items = items.filter(i => i.status.toUpperCase() === status.toUpperCase());
    }

    if (location && location.trim() !== '') {
      const loc = location.toLowerCase().trim();
      items = items.filter(i => i.location.toLowerCase().includes(loc));
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }

    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getItemById(id) {
    const db = this.read();
    return db.items.find(i => i._id === id && !i.isDeleted);
  }

  createItem(item) {
    const db = this.read();
    db.items.unshift(item);
    this.write(db);
    return item;
  }

  updateItem(id, updates) {
    const db = this.read();
    const idx = db.items.findIndex(i => i._id === id);
    if (idx === -1) return null;
    db.items[idx] = {
      ...db.items[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.write(db);
    return db.items[idx];
  }

  softDeleteItem(id) {
    const db = this.read();
    const idx = db.items.findIndex(i => i._id === id);
    if (idx === -1) return false;
    db.items[idx].isDeleted = true;
    db.items[idx].status = "CANCELLED";
    db.items[idx].updatedAt = new Date().toISOString();
    this.write(db);
    return true;
  }

  // Claims
  createClaim(claim) {
    const db = this.read();
    db.claims.unshift(claim);
    this.write(db);
    return claim;
  }

  getClaimsForUser(userId) {
    const db = this.read();
    const received = db.claims.filter(c => c.ownerId === userId);
    const sent = db.claims.filter(c => c.claimantId === userId);
    return { received, sent };
  }

  getClaimById(id) {
    const db = this.read();
    return db.claims.find(c => c._id === id);
  }

  updateClaimStatus(id, status) {
    const db = this.read();
    const idx = db.claims.findIndex(c => c._id === id);
    if (idx === -1) return null;
    db.claims[idx].status = status;
    db.claims[idx].updatedAt = new Date().toISOString();
    this.write(db);
    return db.claims[idx];
  }

  // Helper to sanitize item (hide private verification secrets from non-owners)
  sanitizeItem(item, requestingUserId = null) {
    if (!item) return null;
    const isOwner = requestingUserId && item.reportedBy && item.reportedBy._id === requestingUserId;
    if (isOwner) return item;

    // Redact secretAnswer from verification questions for non-owners
    const sanitized = { ...item };
    if (Array.isArray(sanitized.verificationQuestions)) {
      sanitized.verificationQuestions = sanitized.verificationQuestions.map(q => ({
        id: q.id || q._id,
        question: q.question,
        hint: q.hint || ''
      }));
    }
    return sanitized;
  }

  // Smart Matching Engine
  findMatchesForItem(item) {
    const db = this.read();
    const oppositeType = item.type === 'lost' ? 'found' : 'lost';
    const candidates = db.items.filter(i => !i.isDeleted && i.type === oppositeType && i._id !== item._id);

    const matches = candidates.map(candidate => {
      let score = 0;
      const reasons = [];

      // 1. Category match (+40)
      if (candidate.category.toLowerCase() === item.category.toLowerCase()) {
        score += 40;
        reasons.push("Exact category match (" + item.category + ")");
      }

      // 2. Keyword overlap (+35)
      const itemWords = `${item.title} ${item.description}`.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const candWords = `${candidate.title} ${candidate.description}`.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const commonWords = itemWords.filter(w => candWords.includes(w));
      const uniqueCommon = [...new Set(commonWords)];
      if (uniqueCommon.length > 0) {
        const wordScore = Math.min(35, uniqueCommon.length * 10);
        score += wordScore;
        reasons.push(`Keywords matched: ${uniqueCommon.slice(0, 3).join(', ')}`);
      }

      // 3. Location proximity (+15)
      const loc1 = item.location.toLowerCase();
      const loc2 = candidate.location.toLowerCase();
      if (loc1 && loc2 && (loc1.includes(loc2) || loc2.includes(loc1) || loc1.split(' ').some(w => w.length > 3 && loc2.includes(w)))) {
        score += 15;
        reasons.push("Similar location reported");
      }

      // 4. Date proximity (+10)
      if (item.date && candidate.date) {
        const d1 = new Date(item.date).getTime();
        const d2 = new Date(candidate.date).getTime();
        const diffDays = Math.abs(d1 - d2) / (1000 * 3600 * 24);
        if (diffDays <= 3) {
          score += 10;
          reasons.push("Reported within 3 days");
        } else if (diffDays <= 7) {
          score += 5;
          reasons.push("Reported within 7 days");
        }
      }

      return {
        item: candidate,
        matchScore: Math.min(100, score),
        reasons
      };
    }).filter(m => m.matchScore >= 30)
      .sort((a, b) => b.matchScore - a.matchScore);

    return matches;
  }
}

export const db = new Database();

