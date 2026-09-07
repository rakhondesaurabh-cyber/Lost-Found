import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BackgroundDecoration from '../components/BackgroundDecoration';
import GoogleAccountModal from '../components/GoogleAccountModal';
import { Compass, Mail, Lock, User, Phone, Sparkles, Check } from 'lucide-react';

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: AVATAR_OPTIONS[0]
  });
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, googleLogin } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleDirectGoogleSignIn = async () => {
    if (window?.Capacitor?.isNativePlatform?.() || window.location.protocol === 'capacitor:') {
      setShowGoogleModal(true);
      return;
    }

    setGoogleSigningIn(true);
    try {
      const res = await googleLogin();
      if (res && res.success) {
        addToast(`Welcome to Reconnect, ${res.user.name}!`, 'success');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        addToast('Google Sign-in popup was cancelled', 'info');
      } else {
        setShowGoogleModal(true);
      }
    } finally {
      setGoogleSigningIn(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password should be at least 6 characters', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        avatar: formData.avatar
      });

      if (res.success) {
        addToast(`Welcome to Reconnect, ${res.user.name}!`, 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrap" style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #FFF5F2 0%, #FAF9F6 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <BackgroundDecoration variant="auth" />

      <div className="card auth-card" style={{
        maxWidth: '520px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="brand-icon-box" style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem auto', padding: 0, overflow: 'hidden' }}>
            <img src="/logo.svg" alt="Reconnect Logo" style={{ width: '100%', height: '100%', borderRadius: '14px' }} />
          </div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Join the community to report items, receive alerts and reconnect
          </p>
        </div>

        {/* Google OAuth Direct Sign-Up Button */}
        <button
          type="button"
          onClick={handleDirectGoogleSignIn}
          disabled={googleSigningIn}
          className="btn btn-secondary"
          style={{
            width: '100%',
            marginBottom: '1.5rem',
            padding: '0.75rem',
            fontWeight: 600,
            fontSize: '0.92rem',
            display: 'flex',
            gap: '0.75rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            cursor: googleSigningIn ? 'wait' : 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{googleSigningIn ? 'Opening Google Account...' : 'Sign up directly with Google'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR REGISTER WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar selector */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.6rem' }}>Choose Profile Avatar</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
              {AVATAR_OPTIONS.map((av, idx) => (
                <div
                  key={idx}
                  onClick={() => setFormData(p => ({ ...p, avatar: av }))}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    padding: '2px',
                    border: formData.avatar === av ? '3px solid var(--primary)' : '2px solid transparent'
                  }}
                >
                  <img
                    src={av}
                    alt="avatar"
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  {formData.avatar === av && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      background: 'var(--primary)',
                      borderRadius: '50%',
                      color: 'white',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={10} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                name="name"
                placeholder="e.g. Saurabh Deshmukh"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: '2.4rem' }}
                required
              />
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Campus or Personal)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                name="email"
                placeholder="saurabh@college.edu"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '2.4rem' }}
                required
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="form-input"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.2rem' }}
                  required
                />
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '13px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.2rem' }}
                  required
                />
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '13px' }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            Sign in
          </Link>
        </div>
      </div>

      <GoogleAccountModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => navigate('/dashboard', { replace: true })}
      />
    </div>
  );
}
