import React from 'react';
import { Filter as FilterIcon, RotateCcw, MapPin, Tag, ListFilter } from 'lucide-react';

export const CATEGORIES = [
  'Electronics',
  'Accessories',
  'Documents',
  'Bags',
  'Keys',
  'Wallets',
  'Others'
];

export default function Filter({
  filters,
  onFilterChange,
  onReset
}) {
  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
          <ListFilter size={18} color="var(--primary)" />
          <span>Filters & Discovery</span>
        </div>
        <button
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', gap: '0.35rem' }}
        >
          <RotateCcw size={13} />
          <span>Reset All</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'center'
      }}>
        {/* Type Toggle */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Report Type</label>
          <div style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)'
          }}>
            <button
              type="button"
              onClick={() => onFilterChange('type', 'all')}
              style={{
                flex: 1,
                padding: '0.45rem 0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: filters.type === 'all' ? 'white' : 'transparent',
                color: filters.type === 'all' ? 'var(--text-main)' : 'var(--text-secondary)',
                boxShadow: filters.type === 'all' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('type', 'lost')}
              style={{
                flex: 1,
                padding: '0.45rem 0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: filters.type === 'lost' ? '#FEECEB' : 'transparent',
                color: filters.type === 'lost' ? '#D93025' : 'var(--text-secondary)',
                boxShadow: filters.type === 'lost' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              🔴 Lost
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('type', 'found')}
              style={{
                flex: 1,
                padding: '0.45rem 0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: filters.type === 'found' ? '#E6F4EA' : 'transparent',
                color: filters.type === 'found' ? '#137333' : 'var(--text-secondary)',
                boxShadow: filters.type === 'found' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              🟢 Found
            </button>
          </div>
        </div>

        {/* Category Select */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Category</label>
          <select
            className="form-select"
            value={filters.category || 'all'}
            onChange={(e) => onFilterChange('category', e.target.value)}
            style={{ padding: '0.55rem 0.9rem', fontSize: '0.9rem' }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Location Input */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Location / Landmark</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Library, Cafeteria"
              value={filters.location || ''}
              onChange={(e) => onFilterChange('location', e.target.value)}
              style={{ padding: '0.55rem 0.9rem 0.55rem 2.2rem', fontSize: '0.9rem' }}
            />
            <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Status</label>
          <select
            className="form-select"
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            style={{ padding: '0.55rem 0.9rem', fontSize: '0.9rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="CLAIMED">In Claim</option>
            <option value="RETURNED">Reunited / Returned</option>
          </select>
        </div>
      </div>
    </div>
  );
}
