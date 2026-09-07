import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="navbar" style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
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
                  {/* Google sign-in removed from navbar per request */}
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
                    {/* Google sign-in removed from mobile menu per request */}
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
      <div className="mobile-bottom-bar" style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.8)'
      }}>
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
    </>
  );
}
