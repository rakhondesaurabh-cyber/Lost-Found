import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import GoogleAccountModal from './GoogleAccountModal';
import {
  Compass,
  Search,
  PlusCircle,
  LayoutDashboard,
  Bell,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Inbox,
  Menu,
  X,
  Home as HomeIcon
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, googleLogin } = useAuth();
  const { pendingClaimsCount, addToast } = useNotification();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            {/* Brand Logo */}
            <Link to="/" className="nav-brand" onClick={handleMobileNavClick}>
              <div className="brand-icon-box">
                <Compass size={24} />
              </div>
              <span>Reconnect<span style={{ color: 'var(--primary)' }}>.</span></span>
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="nav-links">
              <li>
                <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/browse" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Search size={16} />
                  Browse Items
                </NavLink>
              </li>
              <li>
                <NavLink to="/report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <PlusCircle size={16} />
                  Report Lost / Found
                </NavLink>
              </li>
              {user && (
                <>
                  <li>
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      <LayoutDashboard size={16} />
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/claims" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      <Inbox size={16} />
                      Claims
                      {pendingClaimsCount > 0 && (
                        <span style={{
                          background: 'var(--google-red)',
                          color: 'white',
                          borderRadius: '9999px',
                          padding: '0.1rem 0.45rem',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {pendingClaimsCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                </>
              )}
            </ul>

            {/* Nav Actions / User Area */}
            <div className="nav-actions">
              {/* User Profile or Login */}
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.3rem 0.75rem 0.3rem 0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                      alt={user.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span className="nav-user-name" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} color="var(--text-muted)" />
                  </button>

                  {showUserMenu && (
                    <div
                      className="card"
                      style={{
                        position: 'absolute',
                        top: '125%',
                        right: 0,
                        width: '230px',
                        padding: '0.75rem',
                        zIndex: 200,
                        boxShadow: 'var(--shadow-lg)'
                      }}
                    >
                      <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      <Link
                        to="/dashboard"
                        className="nav-link"
                        onClick={() => setShowUserMenu(false)}
                        style={{ padding: '0.5rem', width: '100%' }}
                      >
                        <LayoutDashboard size={16} /> My Reports & Activity
                      </Link>
                      <Link
                        to="/claims"
                        className="nav-link"
                        onClick={() => setShowUserMenu(false)}
                        style={{ padding: '0.5rem', width: '100%' }}
                      >
                        <Bell size={16} /> Claims & Notifications
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          addToast('Logged out successfully', 'info');
                          navigate('/');
                        }}
                        className="nav-link"
                        style={{
                          padding: '0.5rem',
                          width: '100%',
                          color: 'var(--google-red)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          justifyContent: 'flex-start'
                        }}
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="nav-auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window?.Capacitor?.isNativePlatform?.() || window.location.protocol === 'capacitor:') {
                        setShowGoogleModal(true);
                        return;
                      }
                      try {
                        const res = await googleLogin();
                        if (res && res.success) {
                          addToast(`Signed in as ${res.user.name} with Google!`, 'success');
                          navigate('/dashboard');
                        }
                      } catch (err) {
                        if (err.code !== 'auth/popup-closed-by-user') {
                          setShowGoogleModal(true);
                        }
                      }
                    }}
                    className="btn btn-secondary btn-sm google-nav-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem' }}
                    title="Direct Google Sign In"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    Log in
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm register-nav-btn">
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <button
                className="mobile-hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        {mobileMenuOpen && (
          <div className="mobile-drawer-menu">
            <div className="container" style={{ padding: '1rem 1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleMobileNavClick}
                >
                  <HomeIcon size={18} />
                  <span>Home</span>
                </NavLink>

                <NavLink
                  to="/browse"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleMobileNavClick}
                >
                  <Search size={18} />
                  <span>Browse Lost & Found</span>
                </NavLink>

                <NavLink
                  to="/report"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleMobileNavClick}
                >
                  <PlusCircle size={18} />
                  <span>Report an Item</span>
                </NavLink>

                {user ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={handleMobileNavClick}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard & My Reports</span>
                    </NavLink>

                    <NavLink
                      to="/claims"
                      className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={handleMobileNavClick}
                    >
                      <Inbox size={18} />
                      <span>Claims Hub</span>
                      {pendingClaimsCount > 0 && (
                        <span style={{
                          background: 'var(--google-red)',
                          color: 'white',
                          borderRadius: '9999px',
                          padding: '0.1rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          marginLeft: 'auto'
                        }}>
                          {pendingClaimsCount} NEW
                        </span>
                      )}
                    </NavLink>

                    <button
                      onClick={() => {
                        logout();
                        handleMobileNavClick();
                        addToast('Logged out successfully', 'info');
                        navigate('/');
                      }}
                      className="mobile-nav-link"
                      style={{ color: 'var(--google-red)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        handleMobileNavClick();
                        if (window?.Capacitor?.isNativePlatform?.() || window.location.protocol === 'capacitor:') {
                          setShowGoogleModal(true);
                          return;
                        }
                        try {
                          const res = await googleLogin();
                          if (res && res.success) {
                            addToast(`Signed in as ${res.user.name} with Google!`, 'success');
                            navigate('/dashboard');
                          }
                        } catch (err) {
                          if (err.code !== 'auth/popup-closed-by-user') {
                            setShowGoogleModal(true);
                          }
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', gap: '0.6rem' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <Link to="/login" className="btn btn-secondary" onClick={handleMobileNavClick}>
                        Log in
                      </Link>
                      <Link to="/register" className="btn btn-primary" onClick={handleMobileNavClick}>
                        Sign up
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar (Google App Style) */}
      <div className="mobile-bottom-bar">
        <NavLink to="/" end className={({ isActive }) => `mobile-tab-item ${isActive ? 'active' : ''}`}>
          <HomeIcon size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/browse" className={({ isActive }) => `mobile-tab-item ${isActive ? 'active' : ''}`}>
          <Search size={20} />
          <span>Browse</span>
        </NavLink>

        <NavLink to="/report" className="mobile-tab-item-center">
          <div className="mobile-tab-center-btn">
            <PlusCircle size={22} />
          </div>
          <span>Report</span>
        </NavLink>

        <NavLink to="/dashboard" className={({ isActive }) => `mobile-tab-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/claims" className={({ isActive }) => `mobile-tab-item ${isActive ? 'active' : ''}`}>
          <div style={{ position: 'relative' }}>
            <Inbox size={20} />
            {pendingClaimsCount > 0 && (
              <span className="mobile-bottom-badge">{pendingClaimsCount}</span>
            )}
          </div>
          <span>Claims</span>
        </NavLink>
      </div>

      <GoogleAccountModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </>
  );
}
