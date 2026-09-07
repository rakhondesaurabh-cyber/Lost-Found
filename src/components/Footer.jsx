import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, HelpCircle, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-light)',
      padding: '4rem 0 2rem 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
                <Compass size={18} />
              </div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>
                Reconnect<span style={{ color: 'var(--primary)' }}>.</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              The modern, community-driven platform to report lost items, list found possessions, and safely reunite them.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <MapPin size={15} color="var(--primary)" />
              <span>Campus & City Wide Network</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link></li>
              <li><Link to="/browse" style={{ color: 'var(--text-secondary)' }}>Browse Lost & Found</Link></li>
              <li><Link to="/report?type=lost" style={{ color: 'var(--text-secondary)' }}>Report Lost Item</Link></li>
              <li><Link to="/report?type=found" style={{ color: 'var(--text-secondary)' }}>Report Found Item</Link></li>
              <li><Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>User Dashboard</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Popular Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/browse?category=Electronics" style={{ color: 'var(--text-secondary)' }}>Electronics & Gadgets</Link></li>
              <li><Link to="/browse?category=Accessories" style={{ color: 'var(--text-secondary)' }}>Wallets & Accessories</Link></li>
              <li><Link to="/browse?category=Keys" style={{ color: 'var(--text-secondary)' }}>Keys & Fobs</Link></li>
              <li><Link to="/browse?category=Documents" style={{ color: 'var(--text-secondary)' }}>IDs & Documents</Link></li>
              <li><Link to="/browse?category=Bags" style={{ color: 'var(--text-secondary)' }}>Backpacks & Luggage</Link></li>
            </ul>
          </div>

          {/* Safety & Support */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Safety & Guidelines</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Shield size={18} color="var(--google-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Always verify specific hidden marks before returning high-value items.</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <HelpCircle size={18} color="var(--google-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Meet in well-lit public campus locations (e.g. Library Desk or Main Reception).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Reconnect Lost & Found. Built with Google-inspired Material Design.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Reconnecting communities with care <Heart size={14} color="#EA4335" fill="#EA4335" />
          </div>
        </div>
      </div>
    </footer>
  );
}
