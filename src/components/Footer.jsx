import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, HelpCircle, MapPin, ChevronRight, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      background: '#FFFCFA', // Very light warm cream background matching the image
      padding: '5rem 0 2rem 0',
      marginTop: 'auto',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        left: '-100px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(ellipse at center, rgba(255,178,139,0.3) 0%, rgba(255,200,180,0) 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(ellipse at center, rgba(255,178,139,0.25) 0%, rgba(255,200,180,0) 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '1200px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          {/* Brand Col */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '42px', height: '42px', 
                background: '#FF6B35', 
                borderRadius: '12px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(255,107,53,0.3)'
              }}>
                <Compass size={24} strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#1A1A1A', letterSpacing: '-0.5px' }}>
                Reconnect<span style={{ color: '#FF6B35' }}>.</span>
              </span>
            </div>
            <p style={{ color: '#444', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: '1.6', fontWeight: 500, paddingRight: '1rem' }}>
              The modern, community-driven platform to report lost items, list found possessions, and safely reunite them.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#555', fontWeight: 500, marginTop: 'auto' }}>
              <MapPin size={18} color="#FF6B35" />
              <span>Campus & City Wide Network</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Quick Navigation
              </h4>
              <div style={{ height: '3px', width: '24px', background: '#FF6B35', marginTop: '0.5rem', borderRadius: '2px' }} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/browse', label: 'Browse Lost & Found' },
                { to: '/report?type=lost', label: 'Report Lost Item' },
                { to: '/report?type=found', label: 'Report Found Item' },
                { to: '/dashboard', label: 'User Dashboard' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} style={{ 
                    color: '#444', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.2s ease', fontWeight: 500 
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.color = '#FF6B35'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = '#444'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <ChevronRight size={14} style={{ opacity: 0.4 }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Popular Categories
              </h4>
              <div style={{ height: '3px', width: '24px', background: '#FF6B35', marginTop: '0.5rem', borderRadius: '2px' }} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              {[
                { to: '/browse?category=Electronics', label: 'Electronics & Gadgets' },
                { to: '/browse?category=Accessories', label: 'Wallets & Accessories' },
                { to: '/browse?category=Keys', label: 'Keys & Fobs' },
                { to: '/browse?category=Documents', label: 'IDs & Documents' },
                { to: '/browse?category=Bags', label: 'Backpacks & Luggage' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} style={{ 
                    color: '#444', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.2s ease', fontWeight: 500 
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.color = '#FF6B35'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = '#444'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <ChevronRight size={14} style={{ opacity: 0.4 }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety & Support */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Safety & Guidelines
              </h4>
              <div style={{ height: '3px', width: '24px', background: '#FF6B35', marginTop: '0.5rem', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', color: '#444' }}>
              <div style={{ display: 'flex', gap: '1rem', background: '#FFF7F2', padding: '1rem', borderRadius: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: '#FFF1E8', padding: '0.4rem', borderRadius: '50%', color: '#FF6B35', flexShrink: 0 }}>
                  <Shield size={18} />
                </div>
                <span style={{ lineHeight: '1.5', fontWeight: 500 }}>Always verify specific hidden marks before returning high-value items.</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', background: '#FFF7F2', padding: '1rem', borderRadius: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: '#FFF1E8', padding: '0.4rem', borderRadius: '50%', color: '#FF6B35', flexShrink: 0 }}>
                  <HelpCircle size={18} />
                </div>
                <span style={{ lineHeight: '1.5', fontWeight: 500 }}>Meet in well-lit public campus locations (e.g. Library Desk or Main Reception).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Glassmorphism Bottom Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
          borderRadius: '100px',
          padding: '1.25rem 2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.9rem',
          color: '#555',
          fontWeight: 500
        }}>
          <div>
            © {new Date().getFullYear()} Reconnect Lost & Found. <span style={{ color: '#aaa', margin: '0 0.5rem' }}>|</span> <span style={{ color: '#888' }}>Built with love and modern web standards.</span>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: 'rgba(255, 255, 255, 0.7)', 
            padding: '0.5rem 1rem', 
            borderRadius: '100px', 
            color: '#FF6B35', 
            fontWeight: 600,
            fontSize: '0.85rem'
          }}>
            <Users size={16} />
            <span style={{ marginLeft: '0.2rem' }}>Reconnecting communities</span>
            <Heart size={14} fill="#FF6B35" />
          </div>
        </div>
      </div>
    </footer>
  );
}
