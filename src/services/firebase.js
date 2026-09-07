import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save or update user in Firestore 'users' collection
    const userRef = doc(firestore, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
      _id: user.uid,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.displayName || user.email)}`,
      createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await setDoc(userRef, userData, { merge: true });
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

    await setDoc(doc(firestore, "users", user.uid), userData);
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

    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }

    return {
      _id: user.uid,
      name: user.displayName || email.split('@')[0],
      email: user.email,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString()
    };
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
    console.warn("Firebase Storage upload fallback (rules/offline):", error);
    return null;
  }
};

// Firestore Sync for Items
export const saveItemToFirestore = async (itemData) => {
  try {
    const itemRef = doc(firestore, "items", itemData._id);
    await setDoc(itemRef, {
      ...itemData,
      firestoreTimestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.warn("Firestore saveItem notice:", error.message);
    return false;
  }
};

// Firestore Sync for Claims
export const saveClaimToFirestore = async (claimData) => {
  try {
    const claimRef = doc(firestore, "claims", claimData._id);
    await setDoc(claimRef, {
      ...claimData,
      firestoreTimestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.warn("Firestore saveClaim notice:", error.message);
    return false;
  }
};

export default app;
