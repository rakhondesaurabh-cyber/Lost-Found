import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import ItemCard from '../components/ItemCard';
import Filter from '../components/Filter';
import SearchBar from '../components/SearchBar';
import { Search, PlusCircle, LayoutGrid, List, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function BrowseItems() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('newest');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || 'all',
    category: searchParams.get('category') || 'all',
    status: searchParams.get('status') || 'all',
    location: searchParams.get('location') || ''
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.getItems(filters);
      if (res.success) {
        let fetched = res.items;
        if (sortBy === 'oldest') {
          fetched.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === 'alpha') {
          fetched.sort((a, b) => a.title.localeCompare(b.title));
        } else {
          fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setItems(fetched);
      }
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters, sortBy]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);

    const newParams = new URLSearchParams();
    Object.entries(updated).forEach(([k, v]) => {
      if (v && v !== 'all') newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const handleReset = () => {
    const reset = {
      search: '',
      type: 'all',
      category: 'all',
      status: 'all',
      location: ''
    };
    setFilters(reset);
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Browse Lost & Found</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Search, filter, and discover lost or found items reported across the community
          </p>
        </div>

        <Link to="/report" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Report New Item</span>
        </Link>
      </div>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar
          value={filters.search}
          onChange={(val) => handleFilterChange('search', val)}
          placeholder="Search by keywords, item name, contents, or location..."
        />
      </div>

      {/* Filter Toolbar */}
      <Filter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Results Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        padding: '0.5rem 0',
        borderBottom: '1px solid var(--border-light)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Found <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{items.length}</span> item reports
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'white' : 'transparent',
                border: 'none',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none'
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'white' : 'transparent',
                border: 'none',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none'
              }}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Items Rendering */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Searching database...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Search size={30} />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Matching Reports Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
            We couldn't find any items matching your active search filters. Try adjusting your keywords or post a new report!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button onClick={handleReset} className="btn btn-secondary">
              Clear All Filters
            </button>
            <Link to="/report" className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Report an Item</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'items-grid' : ''} style={viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '1rem' } : {}}>
          {items.map(item => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
