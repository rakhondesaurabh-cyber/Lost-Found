import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Tag,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

export default function MyClaims() {
  const { user } = useAuth();
  const { addToast, refreshClaimCount } = useNotification();
  const [claims, setClaims] = useState({ received: [], sent: [] });
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.getMyClaims();
      if (res.success) {
        setClaims(res.claims);
      }
    } catch (err) {
      console.error('Failed to load claims', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user]);

  const handleUpdateStatus = async (claimId, status) => {
    try {
      const res = await api.updateClaimStatus(claimId, status);
      if (res.success) {
        addToast(`Claim has been ${status.toLowerCase()}!`, 'success');
        if (status === 'ACCEPTED') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        fetchClaims();
        refreshClaimCount();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update claim status', 'error');
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', background: '#FFFCFA', paddingTop: '3rem' }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        right: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, rgba(255,107,53,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '50px',
        right: '-50px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        border: '1px solid rgba(255,107,53,0.2)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
       <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-150px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, rgba(255,107,53,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px', position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            <div style={{
              color: '#FF6B35',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}>
              Claims & Verification
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1A1A1A' }}>
              Claims & Verification Hub
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: 0 }}>
              Review proof messages, verify rightful owners, and securely share meetup contacts.
            </p>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <div style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.4' }}>
              Lost items<br />find their way back
            </div>
            <div style={{
              height: '3px',
              width: '32px',
              background: '#FF6B35',
              marginTop: '0.75rem',
              borderRadius: '2px'
            }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'inline-flex',
          background: '#F5F5F5',
          padding: '0.35rem',
          borderRadius: '100px',
          marginBottom: '2rem',
          border: '1px solid #EAEAEA',
          minWidth: '400px'
        }}>
          <button
            onClick={() => setActiveTab('received')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.5rem',
              borderRadius: '100px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'received' ? 'white' : 'transparent',
              color: activeTab === 'received' ? '#FF6B35' : '#666',
              boxShadow: activeTab === 'received' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <Inbox size={18} />
            <span>Received ({claims.received.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.5rem',
              borderRadius: '100px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'sent' ? 'white' : 'transparent',
              color: activeTab === 'sent' ? '#FF6B35' : '#666',
              boxShadow: activeTab === 'sent' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <Send size={18} />
            <span>Sent Claims ({claims.sent.length})</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#666' }}>Loading claims...</p>
          </div>
        ) : activeTab === 'received' ? (
          <div>
            {claims.received.length === 0 ? (
              <div style={{
                background: 'white',
                padding: '5rem 2rem',
                textAlign: 'center',
                borderRadius: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                border: '1px solid #F0F0F0'
              }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  {/* Custom Envelope SVG matching design */}
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="45" width="70" height="50" rx="4" fill="#FF8C5F"/>
                    <path d="M25 45L60 70L95 45" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="35" y="30" width="50" height="40" rx="3" fill="#FFF2EC"/>
                    <rect x="42" y="42" width="36" height="4" rx="2" fill="#FFCDB8"/>
                    <rect x="42" y="52" width="24" height="4" rx="2" fill="#FFCDB8"/>
                    <path d="M25 65L60 95L95 65" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#FF6B35"/>
                    <path d="M60 20V12" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M42 25L37 18" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M78 25L83 18" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1A1A1A' }}>
                  No Received Claims Yet
                </h3>
                <p style={{ color: '#666', maxWidth: '480px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                  When users see your reported items and send an<br/>ownership verification or collection note, they will be listed here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {claims.received.map(claim => (
                  <div key={claim._id} style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                    border: '1px solid #F0F0F0'
                  }}>
                    {/* Top Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <img
                          src={claim.claimantAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                          alt={claim.claimantName}
                          style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1A1A1A' }}>{claim.claimantName}</div>
                          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.2rem' }}>
                            Regarding Item:{' '}
                            <Link to={`/items/${claim.itemId}`} style={{ fontWeight: 700, color: '#FF6B35', textDecoration: 'none' }}>
                              {claim.itemTitle}
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className={`badge badge-status-${claim.status.toLowerCase()}`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>

                    {/* Verification Note */}
                    <div style={{
                      background: '#F9F9F9',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      marginBottom: '1.5rem',
                      border: '1px solid #EEEEEE'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#888', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                        CLAIMANT'S VERIFICATION PROOF:
                      </div>
                      <p style={{ color: '#333', fontSize: '1rem', whiteSpace: 'pre-line', lineHeight: '1.6', margin: 0 }}>
                        "{claim.message}"
                      </p>
                    </div>

                    {/* Contact Info (if accepted) */}
                    {claim.status === 'ACCEPTED' && (
                      <div style={{
                        background: '#F0FDF4',
                        border: '1px solid #DCFCE7',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        color: '#166534'
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ShieldCheck size={20} />
                          <span>Claim Accepted — Contact Info Unlocked for Return:</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={18} />
                            <span>{claim.claimantEmail}</span>
                          </div>
                          {claim.claimantPhone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Phone size={18} />
                              <span>{claim.claimantPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Accept / Reject actions */}
                    {claim.status === 'PENDING' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                          onClick={() => handleUpdateStatus(claim._id, 'REJECTED')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem', borderRadius: '8px',
                            background: '#FFF1F2', color: '#BE123C', border: '1px solid #FFE4E6',
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          <X size={18} />
                          <span>Reject Claim</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(claim._id, 'ACCEPTED')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem', borderRadius: '8px',
                            background: '#FF6B35', color: 'white', border: 'none',
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(255,107,53,0.2)'
                          }}
                        >
                          <Check size={18} />
                          <span>Accept Claim & Reveal Contact</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {claims.sent.length === 0 ? (
              <div style={{
                background: 'white',
                padding: '5rem 2rem',
                textAlign: 'center',
                borderRadius: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                border: '1px solid #F0F0F0'
              }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <Send size={64} color="#FFD5C2" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1A1A1A' }}>
                  No Outgoing Claims
                </h3>
                <p style={{ color: '#666', maxWidth: '480px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
                  You haven't filed any claims yet. When you find an item or claim your lost belongings, track progress here.
                </p>
              </div>
            ) : (
              <div className="items-grid">
                {claims.sent.map(claim => (
                  <div key={claim._id} className="card card-interactive" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    padding: '0',
                    overflow: 'hidden',
                    border: '1px solid #F0F0F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    borderRadius: 'var(--radius-xl)'
                  }}>
                    {/* Card Header (Image Area) */}
                    <div className="item-card-image-wrap" style={{ position: 'relative', height: '200px' }}>
                      <img
                        src={`https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80`}
                        alt={claim.itemTitle}
                        className="item-card-image"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="item-card-badge-layer" style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <span className={`badge badge-status-${claim.status.toLowerCase()}`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="item-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                      {/* Sub-label for context */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        <Tag size={13} color="var(--primary)" />
                        <span style={{ fontWeight: 600 }}>Claim Request</span>
                      </div>

                      {/* Title */}
                      <Link to={`/items/${claim.itemId}`} style={{ textDecoration: 'none' }}>
                        <h3 className="item-card-title" title={claim.itemTitle} style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#1A1A1A', fontWeight: 800 }}>
                          {claim.itemTitle}
                        </h3>
                      </Link>

                      {/* Proof Message snippet */}
                      <p className="item-card-desc" style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1rem', flex: 1 }}>
                        "{claim.message}"
                      </p>

                      {/* Meta info */}
                      <div className="item-card-meta" style={{ marginTop: 'auto', paddingTop: '0.5rem', marginBottom: '1rem' }}>
                        <div className="item-card-meta-item">
                           <Calendar size={14} color="var(--text-muted)" />
                           <span>{new Date(claim.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="item-card-footer" style={{ borderTop: '1px solid #F0F0F0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img
                            src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                            alt={user?.name || 'You'}
                            className="reporter-avatar-small"
                            style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                          />
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            You
                          </span>
                        </div>

                        <Link
                          to={`/items/${claim.itemId}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}
                        >
                          <span>View</span>
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

