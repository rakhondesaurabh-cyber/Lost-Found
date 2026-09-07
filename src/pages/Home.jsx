import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import BackgroundDecoration from '../components/BackgroundDecoration';
import { CATEGORIES } from '../components/Filter';
import {
  Compass,
  Search,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Tag,
  Clock,
  HeartHandshake,
  LayoutGrid
} from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({ totalReports: 40, activeLost: 12, activeFound: 28, reunited: 18 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'lost' | 'found'
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          api.getStats(),
          api.getItems()
        ]);
        if (statsRes.success && statsRes.stats) {
          setStats({
            totalReports: statsRes.stats.totalReports || 40,
            activeLost: statsRes.stats.activeLost || 12,
            activeFound: statsRes.stats.activeFound || 28,
            reunited: statsRes.stats.reunited || 18
          });
        }
        if (itemsRes.success && itemsRes.items) {
          setRecentItems(itemsRes.items);
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (query) => {
    if (query.trim()) {
      navigate(`/browse?search=${encodeURIComponent(query)}`);
    }
  };

  const handleCategoryClick = (category) => {
    if (category === 'all') {
      navigate('/browse');
    } else {
      navigate(`/browse?category=${encodeURIComponent(category)}`);
    }
  };

  const filteredItems = recentItems.filter(item => {
    if (activeTab === 'lost') return item.type === 'lost';
    if (activeTab === 'found') return item.type === 'found';
    return true;
  });

  // Spotlight items (up to 5 for the interactive featured carousel)
  const spotlightItems = filteredItems.length > 0 ? filteredItems.slice(0, 5) : [];
  const currentSpotlight = spotlightItems[spotlightIndex] || spotlightItems[0] || recentItems[0];

  const handlePrevSpotlight = () => {
    setSpotlightIndex(prev => (prev === 0 ? spotlightItems.length - 1 : prev - 1));
  };

  const handleNextSpotlight = () => {
    setSpotlightIndex(prev => (prev === spotlightItems.length - 1 ? 0 : prev + 1));
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'CLAIMED':
        return <span className="spotlight-badge-claim"><Sparkles size={13} /> IN CLAIM</span>;
      case 'RETURNED':
        return <span className="spotlight-badge-returned"><CheckCircle2 size={13} /> REUNITED</span>;
      case 'CANCELLED':
        return <span className="badge badge-status-cancelled">CANCELLED</span>;
      default:
        return <span className="spotlight-badge-active"><Clock size={13} /> ACTIVE</span>;
    }
  };

  return (
    <div>
      {/* 1. Hero Section with Beacon Pill, Dual Action Cards & Search */}
      <section className="hero-section-relative hero-section">
        <BackgroundDecoration variant="hero" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Beacon pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#FFEBE5',
            border: '1px solid #FFD0C2',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
            boxShadow: '0 2px 8px rgba(255, 87, 34, 0.15)'
          }}>
            <Sparkles size={16} />
            <span>Smart AI & Community Reconnect Hub</span>
          </div>

          <h1 className="hero-heading">
            Lost something? Found something? <br />
            <span style={{
              background: 'linear-gradient(135deg, #FF5722 0%, #EA4335 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Reconnect in minutes.
            </span>
          </h1>

          <p className="hero-subtitle">
            Search hundreds of lost & found reports across campus, upload pictures, and match items instantly with verified proof of ownership.
          </p>

          {/* Quick Dual Action Cards */}
          <div className="hero-action-grid">
            {/* I Lost Something Card */}
            <Link
              to="/report?type=lost"
              className="card card-interactive hero-action-card"
              style={{
                textAlign: 'left',
                border: '2px solid rgba(234, 67, 53, 0.2)',
                background: '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: '#FEECEB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D93025'
                }}>
                  <Search size={22} />
                </div>
                <span className="badge badge-lost">Report Lost</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>I Lost Something</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Post what you lost (wallet, key, laptop) and receive alerts when someone finds it.
              </p>
              <span className="btn btn-danger btn-sm" style={{ width: '100%' }}>
                Create Lost Report <ArrowRight size={14} />
              </span>
            </Link>

            {/* I Found Something Card */}
            <Link
              to="/report?type=found"
              className="card card-interactive hero-action-card"
              style={{
                textAlign: 'left',
                border: '2px solid rgba(52, 168, 83, 0.2)',
                background: '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: '#E6F4EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#137333'
                }}>
                  <PlusCircle size={22} />
                </div>
                <span className="badge badge-found">Report Found</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>I Found Something</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Found an item? Post details and safely reunite it with its rightful owner.
              </p>
              <span className="btn btn-success btn-sm" style={{ width: '100%' }}>
                Create Found Report <ArrowRight size={14} />
              </span>
            </Link>
          </div>

          {/* Google-Style Floating Search Bar */}
          <div style={{ maxWidth: '750px', margin: '0 auto', width: '100%' }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearchSubmit}
              categories={CATEGORIES.slice(0, 5)}
              onSelectCategory={handleCategoryClick}
            />
          </div>
        </div>
      </section>

      {/* 2. Recent Reports Section (Redesigned matching Reference Mockup) */}
      <section className="section-pad" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          
          {/* Section Header & Top Right Filter Pills */}
          <div className="recent-reports-header">
            <div>
              <h2 className="recent-reports-title">Recent Reports</h2>
              <p className="recent-reports-subtitle">
                Latest items reported on campus and nearby locations
              </p>
            </div>

            {/* Filter Pills on Top Right */}
            <div className="recent-filter-pills">
              <button
                type="button"
                className={`recent-filter-pill ${activeTab === 'all' ? 'active-all' : ''}`}
                onClick={() => {
                  setActiveTab('all');
                  setSpotlightIndex(0);
                }}
              >
                <LayoutGrid size={15} />
                <span>All Reports</span>
              </button>

              <button
                type="button"
                className={`recent-filter-pill ${activeTab === 'lost' ? 'active-lost' : ''}`}
                onClick={() => {
                  setActiveTab('lost');
                  setSpotlightIndex(0);
                }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#EA4335' }}></span>
                <span>Lost Only</span>
              </button>

              <button
                type="button"
                className={`recent-filter-pill ${activeTab === 'found' ? 'active-found' : ''}`}
                onClick={() => {
                  setActiveTab('found');
                  setSpotlightIndex(0);
                }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#34A853' }}></span>
                <span>Found Only</span>
              </button>
            </div>
          </div>

          {/* Featured / Spotlight Showcase Card (Screenshot Layout) */}
          {currentSpotlight && (
            <div className="spotlight-card">
              {/* Left Image Area */}
              <div className="spotlight-image-container">
                <img
                  src={currentSpotlight.imageUrl}
                  alt={currentSpotlight.title}
                  className="spotlight-image"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Top-Left Badge (Lost / Found) */}
                <div className="spotlight-badge-top-left">
                  {currentSpotlight.type === 'lost' ? (
                    <span className="spotlight-badge-lost">
                      <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#EA4335' }}></span>
                      LOST
                    </span>
                  ) : (
                    <span className="spotlight-badge-found">
                      <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#34A853' }}></span>
                      FOUND
                    </span>
                  )}
                </div>

                {/* Top-Right Status Badge (e.g. IN CLAIM, ACTIVE, REUNITED) */}
                <div className="spotlight-badge-top-right">
                  {getStatusBadge(currentSpotlight.status)}
                </div>

                {/* Carousel Previous / Next Nav Buttons (Hover Reveal) */}
                {spotlightItems.length > 1 && (
                  <>
                    <button
                      className="spotlight-nav-btn spotlight-nav-prev"
                      onClick={handlePrevSpotlight}
                      aria-label="Previous item"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className="spotlight-nav-btn spotlight-nav-next"
                      onClick={handleNextSpotlight}
                      aria-label="Next item"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Bottom-Left Pagination Indicator Pill (e.g. 1/2) */}
                <div className="spotlight-pagination-pill">
                  {spotlightIndex + 1}/{spotlightItems.length || 1}
                </div>

                {/* Bottom-Right Carousel Dots */}
                {spotlightItems.length > 1 && (
                  <div className="spotlight-carousel-dots">
                    {spotlightItems.map((_, idx) => (
                      <button
                        key={idx}
                        className={`spotlight-dot ${idx === spotlightIndex ? 'active' : ''}`}
                        onClick={() => setSpotlightIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Details Area */}
              <div className="spotlight-details">
                <div>
                  {/* Category Pill Tag */}
                  <div className="spotlight-category-tag">
                    <Tag size={15} color="var(--primary)" />
                    <span>{currentSpotlight.category || 'Accessories'}</span>
                  </div>

                  {/* Item Title */}
                  <h3 className="spotlight-title">
                    {currentSpotlight.title}
                  </h3>

                  {/* Description */}
                  <p className="spotlight-desc">
                    {currentSpotlight.description}
                  </p>

                  {/* Meta Row: Location & Date */}
                  <div className="spotlight-meta-row">
                    <div className="spotlight-meta-item">
                      <MapPin size={17} color="var(--primary)" />
                      <span>{currentSpotlight.location || 'Campus Center'}</span>
                    </div>
                    <div className="spotlight-meta-item">
                      <Calendar size={17} color="var(--text-secondary)" />
                      <span>
                        {new Date(currentSpotlight.date || currentSpotlight.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Reporter Profile & View Action Button */}
                <div className="spotlight-footer-row">
                  <div className="spotlight-reporter-box">
                    {currentSpotlight.reportedBy?.avatar && !currentSpotlight.reportedBy.avatar.includes('dicebear') ? (
                      <img
                        src={currentSpotlight.reportedBy.avatar}
                        alt={currentSpotlight.reportedBy?.name || 'Reporter'}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="spotlight-reporter-avatar">
                        {(currentSpotlight.reportedBy?.name || 'Saurabh').trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontWeight: 600, fontSize: '0.96rem', color: 'var(--text-main)' }}>
                      {currentSpotlight.reportedBy?.name?.split(' ')[0] || 'Saurabh'}
                    </span>
                  </div>

                  <Link
                    to={`/items/${currentSpotlight._id}`}
                    className="spotlight-view-btn"
                  >
                    <span>View</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 4 Stat Metric Cards (Row of 4 Cards from Screenshot) */}
          <div className="stats-grid-row">
            {/* Card 1: Lost Items */}
            <Link to="/browse?type=lost" className="stat-metric-card">
              <div className="stat-metric-content">
                <div className="stat-icon-circle lost">
                  <Search size={20} />
                </div>
                <div className="stat-metric-texts">
                  <span className="stat-metric-label">Lost Items</span>
                  <span className="stat-metric-value">{stats.activeLost}</span>
                </div>
              </div>
              <ArrowRight size={18} className="stat-metric-arrow" />
              <div className="stat-card-swoosh lost"></div>
            </Link>

            {/* Card 2: Found Items */}
            <Link to="/browse?type=found" className="stat-metric-card">
              <div className="stat-metric-content">
                <div className="stat-icon-circle found">
                  <PlusCircle size={20} />
                </div>
                <div className="stat-metric-texts">
                  <span className="stat-metric-label">Found Items</span>
                  <span className="stat-metric-value">{stats.activeFound}</span>
                </div>
              </div>
              <ArrowRight size={18} className="stat-metric-arrow" />
              <div className="stat-card-swoosh found"></div>
            </Link>

            {/* Card 3: Total Reports */}
            <Link to="/browse" className="stat-metric-card">
              <div className="stat-metric-content">
                <div className="stat-icon-circle total">
                  <MapPin size={20} />
                </div>
                <div className="stat-metric-texts">
                  <span className="stat-metric-label">Total Reports</span>
                  <span className="stat-metric-value">{stats.totalReports}</span>
                </div>
              </div>
              <ArrowRight size={18} className="stat-metric-arrow" />
              <div className="stat-card-swoosh total"></div>
            </Link>

            {/* Card 4: Resolved */}
            <Link to="/browse?status=RETURNED" className="stat-metric-card">
              <div className="stat-metric-content">
                <div className="stat-icon-circle resolved">
                  <ShieldCheck size={20} />
                </div>
                <div className="stat-metric-texts">
                  <span className="stat-metric-label">Resolved</span>
                  <span className="stat-metric-value">{stats.reunited}</span>
                </div>
              </div>
              <ArrowRight size={18} className="stat-metric-arrow" />
              <div className="stat-card-swoosh resolved"></div>
            </Link>
          </div>

          {/* Centered Glowing Primary CTA Button (Screenshot Center Bottom) */}
          <div className="cta-center-container">
            <Link to="/browse" className="cta-browse-btn">
              <Search size={18} />
              <span>Browse All Items & Filter</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Additional Grid of Items */}
          <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Explore More Reports</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Browse all recently reported items across campus</p>
              </div>
              <Link to="/browse" className="btn btn-secondary btn-sm">
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Loading items...</p>
              </div>
            ) : (
              <div className="items-grid">
                {filteredItems.slice(0, 6).map(item => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. How Reconnect Works Section */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>How Reconnect Works</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              A safe, 3-step verification loop ensuring items return to their genuine owners.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <PlusCircle size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>1. Post a Report</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Submit details, photos, date, and exact landmark where the item was lost or found.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#FEF7E0',
                color: '#B06000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>2. Smart Matching</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Our discovery engine cross-checks categories, timestamps, and locations to flag matching reports.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#E6F4EA',
                color: '#137333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <HeartHandshake size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>3. Verify & Reconnect</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                The claimant shares unique identifier details. Once accepted, contact is revealed for safe pickup!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
