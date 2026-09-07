import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, HelpCircle, MapPin, ChevronDown } from 'lucide-react';

export default function Footer() {
  // Mobile accordion collapse/expand state for each category/section
  const [openSections, setOpenSections] = useState({
    nav: false,
    categories: false,
    safety: false
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <footer className="footer-root">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
                <Compass size={18} />
              </div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>
                Reconnect<span style={{ color: 'var(--primary)' }}>.</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              The modern, community-driven platform to report lost items, list found possessions, and safely reunite them.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <MapPin size={15} color="var(--primary)" />
              <span>Campus & City Wide Network</span>
            </div>
          </div>

          {/* Quick Navigation Accordion Dropdown */}
          <div className={`footer-accordion-col ${openSections.nav ? 'open' : ''}`}>
            <button
              type="button"
              className="footer-accordion-header"
              onClick={() => toggleSection('nav')}
              aria-expanded={openSections.nav}
            >
              <span className="footer-accordion-title">Quick Navigation</span>
              <ChevronDown className="footer-accordion-icon" size={18} />
            </button>
            <div className="footer-accordion-content">
              <ul className="footer-links-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/browse">Browse Lost & Found</Link></li>
                <li><Link to="/report?type=lost">Report Lost Item</Link></li>
                <li><Link to="/report?type=found">Report Found Item</Link></li>
                <li><Link to="/dashboard">User Dashboard</Link></li>
              </ul>
            </div>
          </div>

          {/* Popular Categories Accordion Dropdown */}
          <div className={`footer-accordion-col ${openSections.categories ? 'open' : ''}`}>
            <button
              type="button"
              className="footer-accordion-header"
              onClick={() => toggleSection('categories')}
              aria-expanded={openSections.categories}
            >
              <span className="footer-accordion-title">Popular Categories</span>
              <ChevronDown className="footer-accordion-icon" size={18} />
            </button>
            <div className="footer-accordion-content">
              <ul className="footer-links-list">
                <li><Link to="/browse?category=Electronics">Electronics & Gadgets</Link></li>
                <li><Link to="/browse?category=Accessories">Wallets & Accessories</Link></li>
                <li><Link to="/browse?category=Keys">Keys & Fobs</Link></li>
                <li><Link to="/browse?category=Documents">IDs & Documents</Link></li>
                <li><Link to="/browse?category=Bags">Backpacks & Luggage</Link></li>
              </ul>
            </div>
          </div>

          {/* Safety & Guidelines Accordion Dropdown */}
          <div className={`footer-accordion-col ${openSections.safety ? 'open' : ''}`}>
            <button
              type="button"
              className="footer-accordion-header"
              onClick={() => toggleSection('safety')}
              aria-expanded={openSections.safety}
            >
              <span className="footer-accordion-title">Safety & Guidelines</span>
              <ChevronDown className="footer-accordion-icon" size={18} />
            </button>
            <div className="footer-accordion-content">
              <div className="footer-safety-list">
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
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
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
