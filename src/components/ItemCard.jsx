import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ArrowUpRight, Sparkles, CheckCircle, Clock } from 'lucide-react';

export default function ItemCard({ item, matchScore, onClaimClick }) {
  const isLost = item.type === 'lost';

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <span className="badge badge-status-active"><Clock size={12} /> Active</span>;
      case 'CLAIMED':
        return <span className="badge badge-status-claimed"><Sparkles size={12} /> In Claim</span>;
      case 'RETURNED':
        return <span className="badge badge-status-returned"><CheckCircle size={12} /> Reunited</span>;
      case 'CANCELLED':
        return <span className="badge badge-status-cancelled">Cancelled</span>;
      default:
        return <span className="badge badge-status-active">Active</span>;
    }
  };

  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Card Image Wrap */}
      <div className="item-card-image-wrap">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="item-card-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="item-card-badge-layer">
          <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
            {isLost ? '🔴 LOST' : '🟢 FOUND'}
          </span>
          {matchScore && (
            <span
              className="badge"
              style={{
                background: 'linear-gradient(135deg, #FF6F00 0%, #EA4335 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 8px rgba(234, 67, 53, 0.4)'
              }}
            >
              <Sparkles size={11} /> {matchScore}% Match
            </span>
          )}
        </div>

        <div className="item-card-status-layer">
          {getStatusBadge(item.status)}
        </div>
      </div>

      {/* Card Body */}
      <div className="item-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Tag size={13} color="var(--primary)" />
          <span style={{ fontWeight: 600 }}>{item.category}</span>
        </div>

        {/* Title */}
        <Link to={`/items/${item._id}`}>
          <h3 className="item-card-title" title={item.title}>
            {item.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="item-card-desc">
          {item.description}
        </p>

        {/* Meta info */}
        <div className="item-card-meta" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          <div className="item-card-meta-item">
            <MapPin size={14} color="var(--primary)" />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.location}
            </span>
          </div>
          <div className="item-card-meta-item">
            <Calendar size={14} color="var(--text-muted)" />
            <span>{new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="item-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={item.reportedBy?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
              alt={item.reportedBy?.name || 'Reporter'}
              className="reporter-avatar-small"
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {item.reportedBy?.name?.split(' ')[0] || 'Anonymous'}
            </span>
          </div>

          <Link
            to={`/items/${item._id}`}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}
          >
            <span>View</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
