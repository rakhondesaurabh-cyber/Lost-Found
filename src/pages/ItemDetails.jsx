import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ClaimModal from '../components/ClaimModal';
import EditItemModal from '../components/EditItemModal';
import MatchBadge from '../components/MatchBadge';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Sparkles,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getItemById(id);
      if (res.success) {
        setItem(res.item);
        setPotentialMatches(res.potentialMatches || []);
      }
    } catch (err) {
      addToast(err.message || 'Item not found', 'error');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const isOwner = user && item && item.reportedBy?._id === user._id;
  const isLost = item?.type === 'lost';

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.updateItemStatus(item._id, newStatus);
      if (res.success) {
        setItem(res.item);
        addToast(`Item status updated to ${newStatus}`, 'success');
        if (newStatus === 'RETURNED') {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'info');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading item details...</p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="container page-container" style={{ maxWidth: '1100px' }}>
      {/* Back button & share */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/browse')}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Browse</span>
        </button>

        <button
          onClick={handleShare}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <Share2 size={16} />
          <span>Share Report</span>
        </button>
      </div>

      <div className="item-details-grid" style={{
        display: 'grid',
        gap: '2rem',
        marginBottom: '2.5rem'
      }}>
        {/* Left Col: Image & Status */}
        <div>
          <div className="card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-xl)', position: 'relative' }}>
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{ width: '100%', maxHeight: '440px', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
              }}
            />

            {/* Badges Overlay */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '0.5rem' }}>
              <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}>
                {isLost ? '🔴 LOST REPORT' : '🟢 FOUND REPORT'}
              </span>
            </div>

            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <span className={`badge badge-status-${item.status.toLowerCase()}`} style={{ fontSize: '0.85rem' }}>
                {item.status}
              </span>
            </div>
          </div>

          {/* Quick status management for owner */}
          {isOwner && (
            <div className="card" style={{ marginTop: '1.25rem', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.6rem' }}>
                Manage Your Report Lifecycle:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleStatusChange('ACTIVE')}
                  disabled={item.status === 'ACTIVE'}
                >
                  Set Active
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleStatusChange('RETURNED')}
                  disabled={item.status === 'RETURNED'}
                >
                  🎉 Reunited & Returned
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Details & Actions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <Tag size={15} color="var(--primary)" />
            <span style={{ fontWeight: 600 }}>{item.category}</span>
            <span>•</span>
            <span>Reported on {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: '1.25' }}>
            {item.title}
          </h1>

          {/* Key Facts Box */}
          <div style={{
            background: 'var(--bg-subtle)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={20} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location / Landmark</div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.location}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={20} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date {isLost ? 'Lost' : 'Found'}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Description & Distinctive Marks</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {item.description}
            </p>
          </div>

          {/* Reporter Profile Card */}
          <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              REPORTED BY
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={item.reportedBy?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                  alt={item.reportedBy?.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{item.reportedBy?.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Contact via: {item.contactPreference === 'in_app' ? 'In-App Claim Request' : item.contactPreference}
                  </div>
                </div>
              </div>

              {isOwner && (
                <span className="badge badge-status-active">Your Report</span>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div>
            {isOwner ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <Edit3 size={18} />
                  <span>Edit Report Details</span>
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    if (!user) {
                      addToast('Please login first to claim or connect', 'info');
                      navigate('/login');
                      return;
                    }
                    setShowClaimModal(true);
                  }}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', fontSize: '1.1rem' }}
                >
                  <Sparkles size={20} />
                  <span>
                    {isLost ? '🤝 I Found This Item — Connect with Owner' : '🙋 This is Mine — Send Claim Request'}
                  </span>
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.6rem' }}>
                  A verification message will be sent to {item.reportedBy?.name} to verify ownership safely.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Potential Matches Radar Section */}
      {potentialMatches.length > 0 && (
        <section style={{
          marginTop: '3.5rem',
          paddingTop: '2.5rem',
          borderTop: '2px dashed var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="brand-icon-box" style={{ width: '36px', height: '36px' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem' }}>Potential Matching Reports Detected</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Our discovery algorithm matched these {isLost ? 'found' : 'lost'} items based on category, location, and keywords.
              </p>
            </div>
          </div>

          <div className="items-grid">
            {potentialMatches.map(({ item: matchItem, matchScore, reasons }) => (
              <div key={matchItem._id} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '12px', zIndex: 10 }}>
                  <MatchBadge score={matchScore} />
                </div>
                <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <img
                    src={matchItem.imageUrl}
                    alt={matchItem.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span className={`badge ${matchItem.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                      {matchItem.type === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>{matchItem.title}</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    📍 {matchItem.location}
                  </div>

                  {/* Match Reasons */}
                  <div style={{
                    background: '#FFF5F2',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    color: 'var(--primary-hover)',
                    marginBottom: '1rem',
                    marginTop: 'auto'
                  }}>
                    {reasons.slice(0, 2).map((r, i) => (
                      <div key={i}>• {r}</div>
                    ))}
                  </div>

                  <Link to={`/items/${matchItem._id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    <span>Inspect Candidate Item</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      {showClaimModal && (
        <ClaimModal
          item={item}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => {
            fetchItemDetails();
          }}
        />
      )}

      {showEditModal && (
        <EditItemModal
          item={item}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updated) => {
            if (updated) {
              setItem(updated);
            } else {
              navigate('/dashboard');
            }
          }}
        />
      )}
    </div>
  );
}
