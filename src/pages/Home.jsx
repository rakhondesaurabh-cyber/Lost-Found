import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
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
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF5F2 0%, #FAF9F6 100%)',
        padding: '4.5rem 0 3.5rem 0',
        borderBottom: '1px solid var(--border-light)',
        textAlign: 'center'
      }}>
        <div className="container">
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
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(255, 87, 34, 0.15)'
          }}>
            <Sparkles size={16} />
            <span>Smart AI & Community Reconnect Hub</span>
          </div>

          <h1 className="hero-heading" style={{
            fontSize: '3.4rem',
            maxWidth: '850px',
            margin: '0 auto 1.25rem auto',
            letterSpacing: '-0.02em'
          }}>
            Lost something? Found something? <br />
            <span style={{
              background: 'linear-gradient(135deg, #FF5722 0%, #EA4335 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Reconnect in minutes.
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '650px',
            margin: '0 auto 2.5rem auto'
          }}>
            Search hundreds of lost & found reports across campus, upload pictures, and match items instantly with verified proof of ownership.
          </p>

          {/* Quick Dual Action Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            maxWidth: '700px',
            margin: '0 auto 3rem auto'
          }}>
            {/* I Lost Something Card */}
            <Link
              to="/report?type=lost"
              className="card card-interactive"
              style={{
                padding: '1.75rem',
                textAlign: 'left',
                border: '2px solid rgba(234, 67, 53, 0.2)',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: '#FEECEB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D93025'
                }}>
                  <Search size={24} />
                </div>
                <span className="badge badge-lost">Report Lost</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>I Lost Something</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Post what you lost (wallet, key, laptop) and receive alerts when someone finds it.
              </p>
              <span className="btn btn-danger btn-sm" style={{ width: '100%' }}>
                Create Lost Report <ArrowRight size={14} />
              </span>
            </Link>

            {/* I Found Something Card */}
            <Link
              to="/report?type=found"
              className="card card-interactive"
              style={{
                padding: '1.75rem',
                textAlign: 'left',
                border: '2px solid rgba(52, 168, 83, 0.2)',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: '#E6F4EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#137333'
                }}>
                  <PlusCircle size={24} />
                </div>
                <span className="badge badge-found">Report Found</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>I Found Something</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Found an item? Post details and safely reunite it with its rightful owner.
              </p>
              <span className="btn btn-success btn-sm" style={{ width: '100%' }}>
                Create Found Report <ArrowRight size={14} />
              </span>
            </Link>
          </div>

          {/* Google-Style Floating Search Bar */}
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
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
      <section style={{ padding: '2.5rem 0', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>
                {stats.totalReports}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Total Reports Filed
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#D93025', fontFamily: 'Outfit' }}>
                {stats.activeLost}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Active Lost Items
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#137333', fontFamily: 'Outfit' }}>
                {stats.activeFound}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Active Found Items
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1A73E8', fontFamily: 'Outfit' }}>
                {stats.reunited} 🎉
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Belongings Reunited
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Lost & Found Reports Feed */}
      <section style={{ padding: '4rem 0' }}>
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
