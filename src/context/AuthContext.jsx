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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('reconnect_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('reconnect_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    // Try Firebase auth if available, otherwise backend auth
    try {
      const firebaseUser = await loginWithFirebase(email, password);
      // Also authenticate with backend session
      const backendRes = await api.googleAuth({
        email: firebaseUser.email,
        name: firebaseUser.name,
        avatar: firebaseUser.avatar,
        googleId: firebaseUser._id
      });

      if (backendRes.success) {
        localStorage.setItem('reconnect_token', backendRes.token);
        setToken(backendRes.token);
        setUser(backendRes.user);
        return backendRes;
      }
    } catch (fbErr) {
      console.log('Falling back to local backend login:', fbErr.message);
    }

    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('reconnect_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    // Register with Firebase
    try {
      const fbUser = await registerWithFirebase(
        userData.name,
        userData.email,
        userData.password,
        userData.avatar,
        userData.phone
      );

      const backendRes = await api.googleAuth({
        email: fbUser.email,
        name: fbUser.name,
        avatar: fbUser.avatar,
        phone: userData.phone,
        googleId: fbUser._id
      });

      if (backendRes.success) {
        localStorage.setItem('reconnect_token', backendRes.token);
        setToken(backendRes.token);
        setUser(backendRes.user);
        return backendRes;
      }
    } catch (fbErr) {
      console.log('Falling back to local backend registration:', fbErr.message);
    }

    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('reconnect_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const handleGoogleSignIn = async () => {
    try {
      const fbUser = await signInWithGoogle();
      const backendRes = await api.googleAuth({
        email: fbUser.email,
        name: fbUser.name,
        avatar: fbUser.avatar,
        googleId: fbUser._id
      });

      if (backendRes.success) {
        localStorage.setItem('reconnect_token', backendRes.token);
        setToken(backendRes.token);
        setUser(backendRes.user);
        return backendRes;
      }
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
