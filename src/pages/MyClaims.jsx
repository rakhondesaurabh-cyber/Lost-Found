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
  MapPin,
  Bot,
  HelpCircle,
  MessageSquare
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
    <div className="container page-container" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2.1rem', marginBottom: '0.35rem' }}>Claims & Verification</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review claimant answers to AI-generated verification questions and coordinate safe item returns.
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
          <p>Loading claims and verification records...</p>
        </div>
      ) : activeTab === 'received' ? (
        <div>
          {claims.received.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <Inbox size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Received Claims Yet</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                When someone claims an item you found, their answers to your verification questions will appear here for your review.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {claims.received.map(claim => {
                const answersList = Array.isArray(claim.answers) && claim.answers.length > 0 ? claim.answers : [];

                return (
                  <div key={claim._id} className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-light)' }}>
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
                            Claiming Item:{' '}
                            <Link to={`/items/${claim.itemId}`} style={{ fontWeight: 700, color: 'var(--primary)' }}>
                              {claim.itemTitle}
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className={`badge badge-status-${claim.status.toLowerCase()}`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>

                    {/* Verification Q&A Box */}
                    <div style={{
                      background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                      border: '1.5px solid #FED7AA',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.92rem', color: '#9A3412', marginBottom: '0.85rem' }}>
                        <Lock size={18} color="#EA580C" />
                        <span>Verification Question & Claimant's Answer</span>
                      </div>

                      {answersList.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          {answersList.map((qa, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: '#FFFFFF',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.9rem 1rem',
                                border: '1px solid #FFEDD5'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.35rem' }}>
                                <HelpCircle size={15} color="#EA580C" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1E293B' }}>
                                  {qa.question}
                                </span>
                              </div>
                              <div style={{ paddingLeft: '1.35rem', fontSize: '0.92rem', color: '#334155' }}>
                                <strong style={{ color: '#0F172A' }}>Claimant's Answer: </strong>
                                <span>"{qa.answer}"</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600 }}>Message from claimant:</span>
                          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.95rem', color: '#1E293B' }}>"{claim.message}"</p>
                        </div>
                      )}

                      {/* Stated Location */}
                      {claim.statedLocation && (
                        <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#9A3412', fontWeight: 600 }}>
                          <MapPin size={15} color="#EA580C" />
                          <span>Stated Location: <strong>{claim.statedLocation}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Additional Note if separate */}
                    {answersList.length > 0 && claim.message && claim.message !== answersList[0]?.answer && (
                      <div style={{
                        background: 'var(--bg-subtle)',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.25rem',
                        fontSize: '0.88rem'
                      }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginBottom: '0.2rem' }}>
                          ADDITIONAL NOTE:
                        </span>
                        <span style={{ color: 'var(--text-main)' }}>"{claim.message}"</span>
                      </div>
                    )}

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
                          <span>Claim Accepted — Contact Info Unlocked for Handover:</span>
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
                          <span>Approve Claim & Share Contact</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
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
              {claims.sent.map(claim => {
                const answersList = Array.isArray(claim.answers) && claim.answers.length > 0 ? claim.answers : [];

                return (
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

                    {/* Q&A info */}
                    <div style={{
                      background: 'var(--bg-subtle)',
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>
                        YOUR SUBMITTED VERIFICATION ANSWERS:
                      </span>
                      {answersList.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {answersList.map((qa, idx) => (
                            <div key={idx} style={{ fontSize: '0.9rem' }}>
                              <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{qa.question}</div>
                              <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>"{qa.answer}"</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: '0.92rem' }}>"{claim.message}"</p>
                      )}
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
                        🎉 <strong>Claim Accepted & Approved!</strong> The finder verified your ownership answers. You can now coordinate handover in person.
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
