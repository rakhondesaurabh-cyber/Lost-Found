import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const { user } = useAuth();

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshClaimCount = useCallback(async () => {
    if (!user) {
      setPendingClaimsCount(0);
      return;
    }
    try {
      const res = await api.getMyClaims();
      if (res.success && res.claims) {
        const pending = res.claims.received.filter(c => c.status === 'PENDING').length;
        setPendingClaimsCount(pending);
      }
    } catch (err) {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    refreshClaimCount();
    const interval = setInterval(refreshClaimCount, 15000);
    return () => clearInterval(interval);
  }, [refreshClaimCount]);

  return (
    <NotificationContext.Provider value={{ addToast, pendingClaimsCount, refreshClaimCount }}>
      {children}
      {/* Toast Render View */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={20} color="#34A853" />}
            {toast.type === 'error' && <AlertCircle size={20} color="#EA4335" />}
            {toast.type === 'info' && <Info size={20} color="#FF5722" />}
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: '#AAA', cursor: 'pointer', marginLeft: 'auto' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
