import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { X, ShieldAlert, Send, Sparkles, CheckCircle2, Phone } from 'lucide-react';

export default function ClaimModal({ item, onClose, onSuccess }) {
  const { user } = useAuth();
  const { addToast, refreshClaimCount } = useNotification();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);

  const isLostItem = item?.type === 'lost';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      addToast('Please provide identifying details or a message', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createClaim({
        itemId: item._id,
        message: message.trim(),
        contactPhone: phone.trim()
      });

      if (res.success) {
        addToast(res.message, 'success');
        refreshClaimCount();
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit claim request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon-box" style={{ width: '36px', height: '36px' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isLostItem ? 'I Found This Item' : 'Claim This Item (It is Mine)'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Connecting with {item.reportedBy?.name || 'the reporter'}
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
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-light)'
        }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Reported in {item.location} • {item.category}
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          background: '#FEF7E0',
          border: '1px solid #FEEFC3',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontSize: '0.83rem',
          color: '#8A5300'
        }}>
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Proof of Ownership / Verification:</strong> Describe specific details (e.g. stickers, contents, background wallpaper, card numbers) so the owner can verify before handing over.
          </div>
        </div>

        {/* Claim Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {isLostItem
                ? 'Where did you find it & how can they collect it?'
                : 'Explain how you can identify this is yours:'}
            </label>
            <textarea
              className="form-textarea"
              placeholder={
                isLostItem
                  ? "e.g., 'I found this wallet near the reference section. It has an ID card with name Saurabh. You can collect it from the CSE department office.'"
                  : "e.g., 'This is my wallet! It contains my college ID #20240182, a metro card, and a family photo in the inner flap.'"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your Phone / Contact Number (Shared once accepted):</label>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
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
              disabled={submitting}
            >
              {submitting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Claim Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
