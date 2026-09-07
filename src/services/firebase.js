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
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const finalAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    await updateProfile(user, {
      displayName: name,
      photoURL: finalAvatar
    });

    const userData = {
      _id: user.uid,
      name,
      email: email.toLowerCase(),
      avatar: finalAvatar,
      phone,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, "users", user.uid), userData);
    } catch (e) {
      console.warn("Firestore register sync notice:", e.message);
    }

    localStorage.setItem('reconnect_user', JSON.stringify(userData));
    localStorage.setItem('reconnect_token', userData._id);
    return userData;
  } catch (error) {
    console.error("Firebase Registration Error:", error);
    throw error;
  }
};

// Email & Password Login with Firebase
export const loginWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    try {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem('reconnect_user', JSON.stringify(userData));
        localStorage.setItem('reconnect_token', userData._id);
        return userData;
      }
    } catch (e) {}

    const userData = {
      _id: user.uid,
      name: user.displayName || email.split('@')[0],
      email: user.email,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('reconnect_user', JSON.stringify(userData));
    localStorage.setItem('reconnect_token', userData._id);
    return userData;
  } catch (error) {
    console.error("Firebase Login Error:", error);
    throw error;
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

// 2. Fetch Items from Firestore
export const getItemsFromFirestore = async (filters = {}) => {
  let items = [];
  try {
    const querySnapshot = await getDocs(collection(firestore, "items"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.isDeleted) {
        items.push({ _id: docSnap.id, ...data });
      }
    });
  } catch (err) {
    console.warn("Reading items from local cache due to Firestore offline:", err.message);
    items = JSON.parse(localStorage.getItem('reconnect_cached_items') || '[]');
  }

  // Apply filters in memory
  const { search, type, category, status, location, reportedBy } = filters;

  if (type && type !== 'all') {
    items = items.filter(i => i.type === type.toLowerCase());
  }
  if (category && category !== 'all') {
    items = items.filter(i => i.category === category);
  }
  if (status && status !== 'all') {
    items = items.filter(i => i.status === status.toUpperCase());
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

  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return items;
};

// 3. Get single item by ID from Firestore
export const getItemByIdFromFirestore = async (id) => {
  let item = null;
  try {
    const itemSnap = await getDoc(doc(firestore, "items", id));
    if (itemSnap.exists()) {
      item = { _id: itemSnap.id, ...itemSnap.data() };
    }
  } catch (err) {
    const cachedItems = JSON.parse(localStorage.getItem('reconnect_cached_items') || '[]');
    item = cachedItems.find(i => i._id === id);
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
    return { _id: updatedSnap.id, ...updatedSnap.data() };
  } catch (err) {
    console.warn("Firestore update error:", err);
    return { _id: id, ...updates };
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
    itemId: claimData.itemId,
    itemTitle: itemDetails?.title || 'Reported Item',
    itemType: itemDetails?.type || 'lost',
    itemReporterId: itemDetails?.reportedBy?._id || '',
    claimantId: currentUser._id || 'anonymous_user',
    claimantName: currentUser.name || 'Claimant',
    claimantEmail: currentUser.email || 'claimant@campus.edu',
    claimantAvatar: currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User',
    claimantPhone: claimData.contactPhone || currentUser.phone || '',
    message: claimData.message,
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
