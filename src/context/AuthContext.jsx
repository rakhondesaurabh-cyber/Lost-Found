import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  signInWithGoogle,
  registerWithFirebase,
  loginWithFirebase,
  auth
} from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('reconnect_user') || 'null');
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('reconnect_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local session
    const storedUser = localStorage.getItem('reconnect_user');
    const storedToken = localStorage.getItem('reconnect_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    // 2. Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const u = {
          _id: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.email)}`
        };
        setUser(u);
        setToken(fbUser.uid);
        localStorage.setItem('reconnect_user', JSON.stringify(u));
        localStorage.setItem('reconnect_token', fbUser.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    // Try Firebase auth directly
    try {
      const fbUser = await loginWithFirebase(email, password);
      localStorage.setItem('reconnect_user', JSON.stringify(fbUser));
      localStorage.setItem('reconnect_token', fbUser._id);
      setUser(fbUser);
      setToken(fbUser._id);

      // Attempt optional backend sync in background without blocking
      api.googleAuth({
        email: fbUser.email,
        name: fbUser.name,
        avatar: fbUser.avatar,
        googleId: fbUser._id
      }).catch(() => {});

      return { success: true, user: fbUser };
    } catch (fbErr) {
      console.log('Firebase login fallback to backend API:', fbErr.message);
    }

    // Fallback to local server login
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('reconnect_token', res.token);
      localStorage.setItem('reconnect_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    // Try Firebase Registration directly
    try {
      const fbUser = await registerWithFirebase(
        userData.name,
        userData.email,
        userData.password,
        userData.avatar,
        userData.phone
      );

      localStorage.setItem('reconnect_user', JSON.stringify(fbUser));
      localStorage.setItem('reconnect_token', fbUser._id);
      setUser(fbUser);
      setToken(fbUser._id);

      // Attempt background backend sync
      api.googleAuth({
        email: fbUser.email,
        name: fbUser.name,
        avatar: fbUser.avatar,
        phone: userData.phone,
        googleId: fbUser._id
      }).catch(() => {});

      return { success: true, user: fbUser };
    } catch (fbErr) {
      console.log('Firebase register fallback to backend API:', fbErr.message);
    }

    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('reconnect_token', res.token);
      localStorage.setItem('reconnect_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const handleGoogleSignIn = async (fallbackData = null) => {
    try {
      const fbUser = await signInWithGoogle(fallbackData);
      localStorage.setItem('reconnect_user', JSON.stringify(fbUser));
      localStorage.setItem('reconnect_token', fbUser._id);
      setUser(fbUser);
      setToken(fbUser._id);

      // Attempt background backend sync
      api.googleAuth({
        email: fbUser.email,
        name: fbUser.name,
        avatar: fbUser.avatar,
        googleId: fbUser._id
      }).catch(() => {});

      return { success: true, user: fbUser };
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  const logout = () => {
    try {
      signOut(auth);
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('reconnect_token');
    localStorage.removeItem('reconnect_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin: handleGoogleSignIn,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
