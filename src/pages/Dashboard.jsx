import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import EditItemModal from '../components/EditItemModal';
import MatchBadge from '../components/MatchBadge';
import confetti from 'canvas-confetti';
import {
  PlusCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  Inbox,
  Send,
  Radio,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  Check,
  X
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast, refreshClaimCount } = useNotification();

  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'claims_received' | 'claims_sent' | 'matches'
  const [myItems, setMyItems] = useState([]);
  const [claims, setClaims] = useState({ received: [], sent: [] });
  const [matchAlerts, setMatchAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedItemToEdit, setSelectedItemToEdit] = useState(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [itemsRes, claimsRes] = await Promise.all([
        api.getItems({ reportedBy: user._id }),
        api.getMyClaims()
      ]);

      if (itemsRes.success) {
        setMyItems(itemsRes.items);

        // Fetch smart match suggestions for all user's active lost items
        const lostItems = itemsRes.items.filter(i => i.type === 'lost' && i.status === 'ACTIVE');
        const matchPromises = lostItems.map(item => api.getItemById(item._id));
        const matchResults = await Promise.all(matchPromises);

        const allMatches = [];
        matchResults.forEach((res, idx) => {
          if (res.success && res.potentialMatches?.length > 0) {
            allMatches.push({
              sourceItem: lostItems[idx],
              matches: res.potentialMatches
            });
          }
        });
        setMatchAlerts(allMatches);
      }

      if (claimsRes.success) {
        setClaims(claimsRes.claims);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleClaimStatus = async (claimId, status) => {
    try {
      const res = await api.updateClaimStatus(claimId, status);
      if (res.success) {
        addToast(res.message, 'success');
        fetchDashboardData();
        refreshClaimCount();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update claim', 'error');
    }
  };

  const handleQuickStatusChange = async (itemId, newStatus) => {
    try {
      const res = await api.updateItemStatus(itemId, newStatus);
      if (res.success) {
        addToast(`Item marked as ${newStatus}`, 'success');
        if (newStatus === 'RETURNED') {
          confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
        }
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const pendingReceived = claims.received.filter(c => c.status === 'PENDING').length;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* User Welcome Banner */}
      <div className="card" style={{
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, #FFF5F2 0%, #FFFFFF 100%)',
        marginBottom: '2rem',
        border: '1px solid #FFE0D6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
            alt={user?.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: 'var(--shadow-md)' }}
          />
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
              Welcome, {user?.name} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {user?.email} • Campus Member
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/report" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Report Lost / Found</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('reports')}
          className={`chip ${activeTab === 'reports' ? 'active' : ''}`}
        >
          <span>My Reported Items ({myItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims_received')}
          className={`chip ${activeTab === 'claims_received' ? 'active' : ''}`}
        >
          <Inbox size={15} />
          <span>Claims Received ({claims.received.length})</span>
          {pendingReceived > 0 && (
            <span style={{
              background: 'var(--google-red)',
              color: 'white',
              borderRadius: '9999px',
              padding: '0.1rem 0.45rem',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {pendingReceived} NEW
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('claims_sent')}
          className={`chip ${activeTab === 'claims_sent' ? 'active' : ''}`}
        >
          <Send size={15} />
          <span>Claims Sent ({claims.sent.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`chip ${activeTab === 'matches' ? 'active' : ''}`}
        >
          <Radio size={15} />
          <span>Smart Match Radar ({matchAlerts.reduce((acc, m) => acc + m.matches.length, 0)})</span>
        </button>
      </div>

      {/* Tab 1: My Reported Items */}
      {activeTab === 'reports' && (
        <div>
          {myItems.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <PlusCircle size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Items Reported Yet</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                Have you lost or found something on campus? File a quick report to get started.
              </p>
              <Link to="/report" className="btn btn-primary">
                Create First Report
              </Link>
            </div>
          ) : (
            <div className="items-grid">
              {myItems.map(item => (
                <div key={item._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="item-card-image-wrap">
                    <img src={item.imageUrl} alt={item.title} className="item-card-image" />
                    <div className="item-card-badge-layer">
                      <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                        {item.type === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                      </span>
                    </div>
                    <div className="item-card-status-layer">
                      <span className={`badge badge-status-${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="item-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="item-card-title">{item.title}</h3>
                    <p className="item-card-desc">{item.description}</p>

                    <div className="item-card-meta" style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                      <div className="item-card-meta-item">
                        <MapPin size={14} color="var(--primary)" />
                        <span>{item.location}</span>
                      </div>
                      <div className="item-card-meta-item">
                        <Calendar size={14} />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      paddingTop: '0.85rem',
                      marginTop: '0.85rem',
                      borderTop: '1px solid var(--border-light)'
                    }}>
                      <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        <Eye size={14} /> View
                      </Link>
                      <button
                        onClick={() => setSelectedItemToEdit(item)}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      {item.status !== 'RETURNED' && (
                        <button
                          onClick={() => handleQuickStatusChange(item._id, 'RETURNED')}
                          className="btn btn-success btn-sm"
                          title="Mark as Reunited & Returned"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Claims Received */}
      {activeTab === 'claims_received' && (
        <div>
          {claims.received.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <Inbox size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Claims Received Yet</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                When someone claims ownership or contacts you regarding your reports, they will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {claims.received.map(claim => (
                <div key={claim._id} className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img
                        src={claim.claimantAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                        alt={claim.claimantName}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{claim.claimantName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Claimed: <Link to={`/items/${claim.itemId}`} style={{ fontWeight: 700 }}>{claim.itemTitle}</Link>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className={`badge badge-status-${claim.status.toLowerCase()}`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>

                  {/* Message box */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    fontSize: '0.92rem',
                    border: '1px solid var(--border-light)'
                  }}>
                    <strong>Verification Message:</strong>
                    <p style={{ marginTop: '0.35rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                      "{claim.message}"
                    </p>
                  </div>

                  {/* Claimant Contact Details (if accepted) */}
                  {claim.status === 'ACCEPTED' && (
                    <div style={{
                      background: '#E6F4EA',
                      border: '1px solid #CEEAD6',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem',
                      fontSize: '0.9rem',
                      color: '#137333'
                    }}>
                      <strong>✅ Claim Accepted — Contact Details Unlocked:</strong>
                      <div style={{ marginTop: '0.4rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span>📧 Email: {claim.claimantEmail}</span>
                        {claim.claimantPhone && <span>📞 Phone: {claim.claimantPhone}</span>}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {claim.status === 'PENDING' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleClaimStatus(claim._id, 'REJECTED')}
                        className="btn btn-danger btn-sm"
                      >
                        <X size={15} /> Reject Claim
                      </button>
                      <button
                        onClick={() => handleClaimStatus(claim._id, 'ACCEPTED')}
                        className="btn btn-success btn-sm"
                      >
                        <Check size={15} /> Accept Claim & Reveal Contact
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Claims Sent */}
      {activeTab === 'claims_sent' && (
        <div>
          {claims.sent.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <Send size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Claims Sent</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                You haven't claimed any items yet. Browse items to connect with finders.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {claims.sent.map(claim => (
                <div key={claim._id} className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      Item: <Link to={`/items/${claim.itemId}`}>{claim.itemTitle}</Link>
                    </div>
                    <span className={`badge badge-status-${claim.status.toLowerCase()}`}>
                      {claim.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    Your verification note: "{claim.message}"
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Sent on {new Date(claim.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Match Radar */}
      {activeTab === 'matches' && (
        <div>
          {matchAlerts.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <Sparkles size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Match Radar is Scanning</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Whenever someone posts an item matching any of your active lost reports, smart match alerts will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {matchAlerts.map(({ sourceItem, matches }) => (
                <div key={sourceItem._id} className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <Sparkles size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.2rem' }}>
                      Matches for your report: <Link to={`/items/${sourceItem._id}`}>{sourceItem.title}</Link>
                    </h3>
                  </div>

                  <div className="items-grid">
                    {matches.map(({ item: matchItem, matchScore, reasons }) => (
                      <div key={matchItem._id} className="card" style={{ padding: '1rem', border: '1.5px solid #FFD0C2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span className="badge badge-found">🟢 FOUND CANDIDATE</span>
                          <MatchBadge score={matchScore} />
                        </div>
                        <img
                          src={matchItem.imageUrl}
                          alt={matchItem.title}
                          style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.6rem' }}
                        />
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{matchItem.title}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                          📍 {matchItem.location}
                        </div>
                        <Link to={`/items/${matchItem._id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                          Inspect & Claim Item
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {selectedItemToEdit && (
        <EditItemModal
          item={selectedItemToEdit}
          onClose={() => setSelectedItemToEdit(null)}
          onUpdated={() => {
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
