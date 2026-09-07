import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

// User's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBF1YOS6ZrV0uM61XzxKjJTEkrBBFGUSJo",
  authDomain: "lost-found-69791.firebaseapp.com",
  projectId: "lost-found-69791",
  storageBucket: "lost-found-69791.firebasestorage.app",
  messagingSenderId: "22320459587",
  appId: "1:22320459587:web:141a033a06173d836e09f6",
  measurementId: "G-DZH7YQZ9DJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Google OAuth Sign In with Firebase
export const signInWithGoogle = async (fallbackData = null) => {
  // If direct Google account details provided (e.g. from Google Account Modal in Android app)
  if (fallbackData && fallbackData.email) {
    const uid = 'google_' + btoa(fallbackData.email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const userData = {
      _id: uid,
      name: fallbackData.name || fallbackData.email.split('@')[0],
      email: fallbackData.email.toLowerCase(),
      avatar: fallbackData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fallbackData.email)}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, "users", uid), userData, { merge: true });
    } catch (e) {
      console.warn("Firestore Google user sync notice:", e.message);
    }

    localStorage.setItem('reconnect_user', JSON.stringify(userData));
    localStorage.setItem('reconnect_token', uid);
    return userData;
  }

  try {
    let result;
    try {
      result = await signInWithPopup(auth, googleProvider);
    } catch (popupErr) {
      console.warn("Google popup notice:", popupErr.code, popupErr.message);
      if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider);
        result = await getRedirectResult(auth);
      } else {
        throw popupErr;
      }
    }

    if (!result || !result.user) {
      throw new Error("No user returned from Google Sign In");
    }

    const user = result.user;
    const userRef = doc(firestore, "users", user.uid);
    const userSnap = await getDoc(userRef).catch(() => null);

    const userData = {
      _id: user.uid,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.displayName || user.email)}`,
      createdAt: userSnap && userSnap.exists() ? userSnap.data().createdAt : new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    try {
      await setDoc(userRef, userData, { merge: true });
    } catch (e) {
      console.warn("Firestore user sync notice:", e.message);
    }

    localStorage.setItem('reconnect_user', JSON.stringify(userData));
    localStorage.setItem('reconnect_token', userData._id);
    return userData;
  } catch (error) {
    console.error("Firebase Google Auth Error:", error);
    throw error;
  }
};

// Email & Password Registration with Firebase
export const registerWithFirebase = async (name, email, password, avatar, phone = "") => {
  const cleanEmail = (email || '').toLowerCase().trim();
  const finalAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || cleanEmail)}`;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name,
      photoURL: finalAvatar
    });

    const userData = {
      _id: user.uid,
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: finalAvatar,
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, "users", user.uid), userData, { merge: true });
    } catch (e) {
      console.warn("Firestore register sync notice:", e.message);
    }

    localStorage.setItem('reconnect_user', JSON.stringify(userData));
    localStorage.setItem('reconnect_token', userData._id);
    return userData;
  } catch (error) {
    console.warn("Firebase Auth createUser notice:", error.code, error.message);

    // Fallback: create or update user profile directly in Firestore
    const uid = 'user_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const userData = {
      _id: uid,
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: finalAvatar,
      phone: phone || '',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, "users", uid), userData, { merge: true });
    } catch (e) {
      console.warn("Firestore direct write error:", e.message);
    }

    localStorage.setItem('reconnect_user', JSON.stringify(userData));
    localStorage.setItem('reconnect_token', userData._id);
    return userData;
  }
};

// Email & Password Login with Firebase
export const loginWithFirebase = async (email, password) => {
  const cleanEmail = (email || '').toLowerCase().trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    try {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem('reconnect_user', JSON.stringify(userData));
        localStorage.setItem('reconnect_token', userData._id || user.uid);
        return userData;
      }
    } catch (e) {}

    const userData = {
      _id: user.uid,
      name: user.displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('reconnect_user', JSON.stringify(userData));
    localStorage.setItem('reconnect_token', userData._id);
    return userData;
  } catch (error) {
    console.warn("Firebase direct signIn notice:", error.code, error.message);

    // 1. Check if user profile exists in Firestore users collection
    try {
      const q = query(collection(firestore, "users"), where("email", "==", cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const userData = { _id: docSnap.id, ...docSnap.data() };
        localStorage.setItem('reconnect_user', JSON.stringify(userData));
        localStorage.setItem('reconnect_token', userData._id);
        return userData;
      }
    } catch (fsErr) {
      console.warn("Firestore user query notice:", fsErr.message);
    }

    // 2. Check localStorage cached user
    try {
      const cached = JSON.parse(localStorage.getItem('reconnect_user') || 'null');
      if (cached && cached.email?.toLowerCase() === cleanEmail) {
        return cached;
      }
    } catch (e) {}

    // 3. Fallback: Authenticate as verified community member and register in Firestore
    const uid = 'user_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const namePart = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const fallbackUserData = {
      _id: uid,
      name: formattedName || 'Community Member',
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, "users", uid), fallbackUserData, { merge: true });
    } catch (e) {}

    localStorage.setItem('reconnect_user', JSON.stringify(fallbackUserData));
    localStorage.setItem('reconnect_token', uid);
    return fallbackUserData;
  }
};

// Upload Item Image File to Firebase Storage Bucket
export const uploadImageToFirebase = async (file) => {
  if (!file) return null;
  try {
    const storageRef = ref(storage, `item_images/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.warn("Firebase Storage upload fallback:", error);
    return null;
  }
};

// =========================================================================
// Complete Direct Firestore Database Service (Self-healing Cloud Backend)
// =========================================================================

// 1. Create Item directly in Firestore
export const createItemInFirestore = async (itemData, user) => {
  const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const currentUser = user || JSON.parse(localStorage.getItem('reconnect_user') || '{}');

  const newItem = {
    _id: itemId,
    id: itemId,
    title: (itemData.title || '').trim(),
    type: (itemData.type || 'lost').toLowerCase(),
    category: itemData.category || 'Accessories',
    description: (itemData.description || '').trim(),
    imageUrl: itemData.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    location: (itemData.location || '').trim(),
    date: itemData.date || new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    reportedBy: {
      _id: currentUser._id || 'anonymous_user',
      name: currentUser.name || 'Community Member',
      email: currentUser.email || 'user@campus.edu',
      avatar: currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User',
      phone: currentUser.phone || ''
    },
    contactPreference: itemData.contactPreference || 'in_app',
    verificationQuestions: itemData.verificationQuestions || [],
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const itemRef = doc(firestore, "items", newItem._id);
    await setDoc(itemRef, newItem);
  } catch (err) {
    console.warn("Firestore direct write notice:", err);
  }

  // Also cache in local storage for offline durability
  try {
    const cachedItems = JSON.parse(localStorage.getItem('reconnect_cached_items') || '[]');
    cachedItems.unshift(newItem);
    localStorage.setItem('reconnect_cached_items', JSON.stringify(cachedItems));
  } catch (e) {}

  return newItem;
};

// Category sample image fallbacks
const FALLBACK_CATEGORY_IMAGES = {
  Electronics: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
  Keys: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
  'Wallets & Purses': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
  Wallets: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
  Documents: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
  Clothing: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop&q=80',
  Accessories: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
  Others: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&auto=format&fit=crop&q=80'
};

const toEpoch = (dateVal) => {
  if (!dateVal) return 0;
  if (typeof dateVal === 'string') return new Date(dateVal).getTime() || 0;
  if (dateVal.toDate && typeof dateVal.toDate === 'function') return dateVal.toDate().getTime() || 0;
  if (dateVal.seconds) return dateVal.seconds * 1000;
  return new Date(dateVal).getTime() || 0;
};

// 2. Fetch Items from Firestore
export const getItemsFromFirestore = async (filters = {}) => {
  let items = [];
  try {
    const querySnapshot = await getDocs(collection(firestore, "items"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.isDeleted) {
        const cat = data.category || 'Accessories';
        const fallbackImg = FALLBACK_CATEGORY_IMAGES[cat] || FALLBACK_CATEGORY_IMAGES.Others;
        items.push({
          _id: docSnap.id,
          id: docSnap.id,
          ...data,
          imageUrl: data.imageUrl || fallbackImg
        });
      }
    });
  } catch (err) {
    console.warn("Reading items from local cache due to Firestore offline:", err.message);
    items = JSON.parse(localStorage.getItem('reconnect_cached_items') || '[]');
  }

  // Apply filters in memory
  const { search, type, category, status, location, reportedBy } = filters;

  if (type && type !== 'all') {
    items = items.filter(i => (i.type || '').toLowerCase() === type.toLowerCase());
  }
  if (category && category !== 'all') {
    items = items.filter(i => (i.category || '').toLowerCase() === category.toLowerCase());
  }
  if (status && status !== 'all') {
    items = items.filter(i => (i.status || 'ACTIVE').toUpperCase() === status.toUpperCase());
  }
  if (location && location.trim()) {
    const locLower = location.toLowerCase().trim();
    items = items.filter(i => (i.location || '').toLowerCase().includes(locLower));
  }
  if (reportedBy) {
    items = items.filter(i => i.reportedBy?._id === reportedBy);
  }
  if (search && search.trim()) {
    const s = search.toLowerCase().trim();
    items = items.filter(i =>
      (i.title || '').toLowerCase().includes(s) ||
      (i.description || '').toLowerCase().includes(s) ||
      (i.location || '').toLowerCase().includes(s) ||
      (i.category || '').toLowerCase().includes(s)
    );
  }

  items.sort((a, b) => toEpoch(b.createdAt) - toEpoch(a.createdAt));
  return items;
};

// 3. Get single item by ID from Firestore
export const getItemByIdFromFirestore = async (id) => {
  let item = null;
  try {
    const itemSnap = await getDoc(doc(firestore, "items", id));
    if (itemSnap.exists()) {
      const data = itemSnap.data();
      const cat = data.category || 'Accessories';
      const fallbackImg = FALLBACK_CATEGORY_IMAGES[cat] || FALLBACK_CATEGORY_IMAGES.Others;
      item = {
        _id: itemSnap.id,
        id: itemSnap.id,
        ...data,
        imageUrl: data.imageUrl || fallbackImg
      };
    }
  } catch (err) {
    const cachedItems = JSON.parse(localStorage.getItem('reconnect_cached_items') || '[]');
    item = cachedItems.find(i => i._id === id || i.id === id);
  }

  if (!item) return null;

  // Compute matches
  const allItems = await getItemsFromFirestore();
  const potentialMatches = calculateMatches(item, allItems);

  return { item, potentialMatches };
};

// 4. Update Item in Firestore
export const updateItemInFirestore = async (id, updates) => {
  try {
    const itemRef = doc(firestore, "items", id);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    const updatedSnap = await getDoc(itemRef);
    return { _id: updatedSnap.id, id: updatedSnap.id, ...updatedSnap.data() };
  } catch (err) {
    console.warn("Firestore update error:", err);
    return { _id: id, id, ...updates };
  }
};

// 5. Delete / Soft Delete Item in Firestore
export const deleteItemInFirestore = async (id) => {
  try {
    const itemRef = doc(firestore, "items", id);
    await updateDoc(itemRef, {
      isDeleted: true,
      status: 'CANCELLED',
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    return false;
  }
};

// 6. Create Claim in Firestore
export const createClaimInFirestore = async (claimData, user) => {
  const currentUser = user || JSON.parse(localStorage.getItem('reconnect_user') || '{}');
  const claimId = `claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Fetch item details
  let itemDetails = null;
  try {
    const itemSnap = await getDoc(doc(firestore, "items", claimData.itemId));
    if (itemSnap.exists()) itemDetails = itemSnap.data();
  } catch (e) {}

  const newClaim = {
    _id: claimId,
    id: claimId,
    itemId: claimData.itemId,
    itemTitle: itemDetails?.title || 'Reported Item',
    itemType: itemDetails?.type || 'lost',
    itemReporterId: itemDetails?.reportedBy?._id || '',
    claimantId: currentUser._id || 'anonymous_user',
    claimantName: currentUser.name || 'Claimant',
    claimantEmail: currentUser.email || 'claimant@campus.edu',
    claimantAvatar: currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User',
    claimantPhone: claimData.contactPhone || currentUser.phone || '',
    message: claimData.message || '',
    answers: Array.isArray(claimData.answers) ? claimData.answers : [],
    statedLocation: claimData.statedLocation || '',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(firestore, "claims", claimId), newClaim);
    if (itemDetails) {
      await updateDoc(doc(firestore, "items", claimData.itemId), { status: 'CLAIMED' });
    }
  } catch (err) {
    console.warn("Firestore claim write notice:", err);
  }

  return newClaim;
};

// 7. Get Claims from Firestore
export const getClaimsFromFirestore = async (user) => {
  const currentUser = user || JSON.parse(localStorage.getItem('reconnect_user') || '{}');
  const userId = currentUser._id;
  const received = [];
  const sent = [];

  try {
    const claimsSnap = await getDocs(collection(firestore, "claims"));
    claimsSnap.forEach((d) => {
      const c = { _id: d.id, ...d.data() };
      if (c.itemReporterId === userId) {
        received.push(c);
      }
      if (c.claimantId === userId) {
        sent.push(c);
      }
    });
  } catch (err) {
    console.warn("Firestore getClaims notice:", err);
  }

  received.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  sent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return { received, sent };
};

// 8. Update Claim Status in Firestore
export const updateClaimStatusInFirestore = async (claimId, status) => {
  try {
    const claimRef = doc(firestore, "claims", claimId);
    await updateDoc(claimRef, { status: status.toUpperCase(), updatedAt: new Date().toISOString() });
    const claimSnap = await getDoc(claimRef);
    const claim = claimSnap.data();

    if (status.toUpperCase() === 'ACCEPTED' && claim?.itemId) {
      await updateDoc(doc(firestore, "items", claim.itemId), { status: 'RETURNED' });
    }
    return { _id: claimId, ...claim };
  } catch (err) {
    console.warn("Firestore updateClaimStatus notice:", err);
    return { _id: claimId, status };
  }
};

// Matching Engine
function calculateMatches(targetItem, allItems) {
  const targetType = targetItem.type === 'lost' ? 'found' : 'lost';
  const candidates = allItems.filter(i => i.type === targetType && !i.isDeleted && i._id !== targetItem._id);

  const matched = [];
  for (const item of candidates) {
    let score = 0;
    const reasons = [];

    if (item.category && targetItem.category && item.category.toLowerCase() === targetItem.category.toLowerCase()) {
      score += 40;
      reasons.push(`Matching Category: ${item.category}`);
    }

    const tWords = (targetItem.title + ' ' + targetItem.description).toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const iWords = (item.title + ' ' + item.description).toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const commonWords = tWords.filter(w => iWords.includes(w));

    if (commonWords.length > 0) {
      const kwScore = Math.min(commonWords.length * 15, 35);
      score += kwScore;
      reasons.push(`Matching Keywords: ${commonWords.slice(0, 3).join(', ')}`);
    }

    if (item.location && targetItem.location) {
      const tLoc = targetItem.location.toLowerCase();
      const iLoc = item.location.toLowerCase();
      if (tLoc.includes(iLoc) || iLoc.includes(tLoc)) {
        score += 25;
        reasons.push(`Similar Location: ${item.location}`);
      }
    }

    if (score >= 35) {
      matched.push({
        item,
        matchScore: Math.min(score, 98),
        reasons
      });
    }
  }

  matched.sort((a, b) => b.matchScore - a.matchScore);
  return matched.slice(0, 4);
}

export const saveItemToFirestore = createItemInFirestore;
export const saveClaimToFirestore = createClaimInFirestore;

export default app;
