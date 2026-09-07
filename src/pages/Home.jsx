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
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  HeartHandshake
} from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({ totalReports: 0, activeLost: 0, activeFound: 0, reunited: 18 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          api.getStats(),
          api.getItems()
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (itemsRes.success) setRecentItems(itemsRes.items);
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
  }).slice(0, 6);

  return (
    <div>
      {/* Hero Section with Animated Background SVGs */}
      <section className="hero-section-relative hero-section">
        {/* Background SVG Layer */}
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

      {/* Live Platform Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid-mobile stats-grid-desktop">
            <div className="stats-item-box">
              <div className="stats-item-number" style={{ color: 'var(--primary)' }}>
                {stats.totalReports}
              </div>
              <div className="stats-item-label">
                Total Reports Filed
              </div>
            </div>

            <div className="stats-item-box">
              <div className="stats-item-number" style={{ color: '#D93025' }}>
                {stats.activeLost}
              </div>
              <div className="stats-item-label">
                Active Lost Items
              </div>
            </div>

            <div className="stats-item-box">
              <div className="stats-item-number" style={{ color: '#137333' }}>
                {stats.activeFound}
              </div>
              <div className="stats-item-label">
                Active Found Items
              </div>
            </div>

            <div className="stats-item-box">
              <div className="stats-item-number" style={{ color: '#1A73E8' }}>
                {stats.reunited} 🎉
              </div>
              <div className="stats-item-label">
                Belongings Reunited
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Lost & Found Reports Feed */}
      <section className="section-pad">
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.9rem', marginBottom: '0.25rem' }}>Recent Reports</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Latest items reported on campus and nearby locations
              </p>
            </div>

            {/* Tab switch */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-subtle)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)'
            }}>
              <button
                className={`chip ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                All Reports
              </button>
              <button
                className={`chip ${activeTab === 'lost' ? 'active' : ''}`}
                onClick={() => setActiveTab('lost')}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                🔴 Lost Only
              </button>
              <button
                className={`chip ${activeTab === 'found' ? 'active' : ''}`}
                onClick={() => setActiveTab('found')}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                🟢 Found Only
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading items...</p>
            </div>
          ) : (
            <>
              <div className="items-grid">
                {filteredItems.map(item => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <Link to="/browse" className="btn btn-primary btn-lg">
                  <span>Browse All Items & Filter</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How it Works Section */}
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
