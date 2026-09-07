import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search lost or found items (e.g. 'black wallet', 'keys', 'airpods')...",
  categories = [],
  selectedCategory = 'all',
  onSelectCategory
}) {
  return (
    <div className="google-search-container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSearch) onSearch(value);
        }}
        className="google-search-bar"
      >
        <Search size={22} color="var(--primary)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          className="google-search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        )}
      </form>

      {/* Optional Category Pills */}
      {categories.length > 0 && (
        <div className="category-chips" style={{ marginTop: '0.85rem', justifyContent: 'center' }}>
          <button
            type="button"
            className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onSelectCategory && onSelectCategory('all')}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onSelectCategory && onSelectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
