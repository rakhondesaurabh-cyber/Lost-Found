import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { X, Send, Sparkles, CheckCircle2, Phone, Lock, HelpCircle, MapPin, ShieldCheck, Bot, RefreshCw, MessageSquare } from 'lucide-react';

export default function ClaimModal({ item, onClose, onSuccess }) {
  const { user } = useAuth();
  const { addToast, refreshClaimCount } = useNotification();
  
  // Is this an item reported by someone who LOST it, or someone who FOUND it?
  const isFoundItem = item?.type === 'found';
  const isLostItem = item?.type === 'lost';
  
  const hasItemQuestions = Array.isArray(item?.verificationQuestions) && item.verificationQuestions.length > 0;
  
  // Verification questions apply to both FOUND and LOST items
  const [questions, setQuestions] = useState(hasItemQuestions ? item.verificationQuestions : []);
  const [loadingAi, setLoadingAi] = useState(!hasItemQuestions);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [statedLocation, setStatedLocation] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);

  // Generate 1 smart question with AI if no questions were provided
  const loadAiQuestions = async () => {
    setLoadingAi(true);
    try {
      const generated = await api.generateAIQuestions({
        title: item.title,
        category: item.category,
        description: item.description,
        location: item.location,
        type: item.type
      });

      if (Array.isArray(generated) && generated.length > 0) {
        setQuestions(generated);
        const initAnswers = {};
        generated.forEach(q => {
          initAnswers[q.id || q._id] = '';
        });
        setAnswers(initAnswers);

        // Save generated questions to the database for this item
        try {
          await api.updateItem(item._id, { verificationQuestions: generated });
        } catch (err) {
          console.warn('Failed to save AI questions to item:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load AI questions:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (!hasItemQuestions) {
      loadAiQuestions();
    } else {
      const initAnswers = {};
      item.verificationQuestions.forEach(q => {
        initAnswers[q.id || q._id] = '';
      });
      setAnswers(initAnswers);
    }
  }, [item]);

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Require answering the verification question if present
    let structuredAnswers = [];
    structuredAnswers = questions.map((q, idx) => ({
      index: idx,
      questionId: q.id || q._id,
      question: q.question,
      answer: (answers[q.id || q._id] || '').trim(),
      isAiGenerated: Boolean(q.isAiGenerated)
    })).filter(a => a.answer !== '');

    if (structuredAnswers.length === 0 && questions.length > 0) {
      addToast(
        isFoundItem 
          ? "Please answer the finder's verification question to prove this item belongs to you"
          : "Please answer the verification question to prove you found this item", 
        'error'
      );
      return;
    }

    if (isLostItem && !message.trim() && !statedLocation.trim()) {
      addToast('Please provide details on where you found the item or handover instructions', 'error');
      return;
    }

    let finalMessage = message.trim();
    if (structuredAnswers.length > 0) {
      const qnaText = structuredAnswers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n');
      if (finalMessage) {
        finalMessage = `${finalMessage}\n\n--- Verification Answers ---\n${qnaText}`;
      } else {
        finalMessage = qnaText;
      }
    }

    setSubmitting(true);
    try {
      const res = await api.createClaim({
        itemId: item._id,
        message: finalMessage,
        answers: structuredAnswers,
        statedLocation: statedLocation.trim(),
        contactPhone: phone.trim()
      });

      if (res.success) {
        addToast(
          isFoundItem
            ? "Your verification answers have been sent to the finder for review!"
            : "Handover notification sent to the owner!",
          'success'
        );
        refreshClaimCount();
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: isFoundItem
                ? 'linear-gradient(135deg, #FF5722 0%, #EA4335 100%)'
                : 'linear-gradient(135deg, #137333 0%, #34A853 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}>
              {isFoundItem ? <Lock size={20} /> : <MessageSquare size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {isFoundItem ? '🔐 Claim Found Item (Answer Verification)' : '🤝 I Found This Item — Notify Owner'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Reported by {item.reportedBy?.name || 'Community Member'} ({isFoundItem ? 'Finder' : 'Owner'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Item Summary Box */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          background: 'var(--bg-subtle)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-light)'
        }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ width: '54px', height: '54px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>{item.title}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              📍 {item.location} • {item.category} • <span style={{ textTransform: 'uppercase', fontWeight: 700, color: isFoundItem ? '#137333' : '#D93025' }}>{item.type}</span>
            </div>
          </div>
          {isFoundItem && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#F3E8FF',
              color: '#7E22CE',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 800
            }}>
              <ShieldCheck size={13} />
              <span>Finder Question Active</span>
            </div>
          )}
        </div>

        {/* Informational Banner */}
        {isFoundItem ? (
          <div style={{
            background: '#FFF7ED',
            border: '1.5px solid #FFEDD5',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.86rem',
            color: '#C2410C'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, marginBottom: '0.2rem' }}>
              <Lock size={15} />
              <span>Finder's Ownership Verification:</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#9A3412', lineHeight: '1.45' }}>
              The person who found this item has set the verification question below. Answer it accurately to prove the item belongs to you before returning.
            </p>
          </div>
        ) : (
          <div style={{
            background: '#E6F4EA',
            border: '1.5px solid #CEEAD6',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.86rem',
            color: '#137333'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, marginBottom: '0.2rem' }}>
              <CheckCircle2 size={16} />
              <span>Return Item to Owner:</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#137333', lineHeight: '1.45' }}>
              You found this owner's lost item! Answer the verification question accurately to prove you found the correct item, and provide handover details.
            </p>
          </div>
        )}

        {/* Claim Form */}
        <form onSubmit={handleSubmit}>
          {/* Display the Verification Question(s) */}
          {loadingAi ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-hover)',
              marginBottom: '1.25rem'
            }}>
              <RefreshCw size={24} className="spin" color="var(--primary)" style={{ marginBottom: '0.65rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                Loading {isFoundItem ? "finder" : "owner"} verification questions...
              </div>
            </div>
          ) : questions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.25rem' }}>
              {questions.map((q, idx) => (
                <div
                  key={q.id || q._id || idx}
                  style={{
                    background: 'var(--bg-surface)',
                    padding: '1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #FED7AA',
                    boxShadow: '0 2px 6px rgba(255, 87, 34, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#FFEDE7',
                      color: '#C2410C',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.74rem',
                      fontWeight: 800
                    }}>
                      <HelpCircle size={12} />
                      {isFoundItem ? "Finder's Question" : "Owner's Question"} {questions.length > 1 ? idx + 1 : ''}
                    </span>
                  </div>

                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    {q.question}
                  </label>

                  {q.hint && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                      💡 Hint: {q.hint}
                    </div>
                  )}

                  <input
                    type="text"
                    className="form-input"
                    placeholder={isFoundItem ? "Type your answer to prove ownership..." : "Type your answer to prove you found it..."}
                    value={answers[q.id || q._id] || ''}
                    onChange={(e) => handleAnswerChange(q.id || q._id, e.target.value)}
                    required
                    style={{ borderColor: answers[q.id || q._id] ? 'var(--primary)' : undefined }}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {/* Location Where Owner Lost the Item */}
          {isFoundItem && (
              <div className="form-group">
                <label className="form-label">Where did you lose this item?</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PCCOE Cafeteria table 14 / Reading Hall"
                    value={statedLocation}
                    onChange={(e) => setStatedLocation(e.target.value)}
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <MapPin size={16} color="var(--primary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>
          )}

          {/* If LOST item, helper provides where they found it */}
          {isLostItem && (
            <>
              <div className="form-group">
                <label className="form-label">Where did you find this item / Where is it currently?</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Found on 3rd floor staircase / Left with campus security"
                    value={statedLocation}
                    onChange={(e) => setStatedLocation(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <MapPin size={16} color="var(--primary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Handover Message to Owner:</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe where and when the owner can collect the item from you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </>
          )}

          {/* Phone Contact */}
          <div className="form-group">
            <label className="form-label">Your Contact Phone Number (Shared once approved):</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
              <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || loadingAi}
              style={{ padding: '0.65rem 1.4rem' }}
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : isFoundItem ? (
                <>
                  <ShieldCheck size={17} />
                  <span>Submit Answer to Finder</span>
                </>
              ) : (
                <>
                  <Send size={17} />
                  <span>Notify Owner for Handover</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
