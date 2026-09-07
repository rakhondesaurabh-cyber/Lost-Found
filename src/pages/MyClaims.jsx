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
  ExternalLink
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
    <div className="container page-container" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2.1rem', marginBottom: '0.35rem' }}>Claims & Verification Hub</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review proof messages, verify rightful owners, and securely share meetup contacts.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-subtle)',
        padding: '0.35rem',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '2rem',
        border: '1px solid var(--border-light)',
        maxWidth: '500px'
      }}>
        <button
          onClick={() => setActiveTab('received')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'var(--transition)',
            background: activeTab === 'received' ? 'white' : 'transparent',
            color: activeTab === 'received' ? 'var(--primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'received' ? 'var(--shadow-sm)' : 'none'
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
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'var(--transition)',
            background: activeTab === 'sent' ? 'white' : 'transparent',
            color: activeTab === 'sent' ? 'var(--primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'sent' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <Send size={18} />
          <span>Sent Claims ({claims.sent.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p>Loading claims...</p>
        </div>
      ) : activeTab === 'received' ? (
        <div>
          {claims.received.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <Inbox size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Received Claims Yet</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                When users see your reported items and send an ownership verification or collection note, they will be listed here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {claims.received.map(claim => (
                <div key={claim._id} className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img
                        src={claim.claimantAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                        alt={claim.claimantName}
                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{claim.claimantName}</div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          Regarding Item:{' '}
                          <Link to={`/items/${claim.itemId}`} style={{ fontWeight: 700, color: 'var(--primary)' }}>
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
                    background: 'var(--bg-subtle)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      CLAIMANT'S VERIFICATION PROOF:
                    </div>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.98rem', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                      "{claim.message}"
                    </p>
                  </div>

                  {/* Contact Info (if accepted) */}
                  {claim.status === 'ACCEPTED' && (
                    <div style={{
                      background: '#E6F4EA',
                      border: '1px solid #CEEAD6',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      color: '#137333'
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={18} />
                        <span>Claim Accepted — Contact Info Unlocked for Return:</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.95rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Mail size={16} />
                          <span>{claim.claimantEmail}</span>
                        </div>
                        {claim.claimantPhone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Phone size={16} />
                            <span>{claim.claimantPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Accept / Reject actions */}
                  {claim.status === 'PENDING' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleUpdateStatus(claim._id, 'REJECTED')}
                        className="btn btn-danger btn-sm"
                      >
                        <X size={16} />
                        <span>Reject Claim</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(claim._id, 'ACCEPTED')}
                        className="btn btn-success btn-sm"
                      >
                        <Check size={16} />
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
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <Send size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Outgoing Claims</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                You haven't filed any claims yet. When you find an item or claim your lost belongings, track progress here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {claims.sent.map(claim => (
                <div key={claim._id} className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      Item:{' '}
                      <Link to={`/items/${claim.itemId}`} style={{ color: 'var(--primary)' }}>
                        {claim.itemTitle}
                      </Link>
                    </div>
                    <span className={`badge badge-status-${claim.status.toLowerCase()}`}>
                      {claim.status}
                    </span>
                  </div>

                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    fontSize: '0.95rem'
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.82rem', display: 'block', marginBottom: '0.25rem' }}>
                      YOUR PROOF MESSAGE:
                    </span>
                    "{claim.message}"
                  </div>

                  {claim.status === 'ACCEPTED' && (
                    <div style={{
                      background: '#E6F4EA',
                      border: '1px solid #CEEAD6',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      color: '#137333'
                    }}>
                      🎉 <strong>Claim Accepted!</strong> The reporter has verified your request. You may coordinate handover in person.
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
