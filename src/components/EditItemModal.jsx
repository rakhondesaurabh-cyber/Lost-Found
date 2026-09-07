import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { CATEGORIES } from './Filter';
import { X, Save, Trash2, CheckCircle2 } from 'lucide-react';

export default function EditItemModal({ item, onClose, onUpdated }) {
  const { addToast } = useNotification();
  const [formData, setFormData] = useState({
    title: item.title || '',
    category: item.category || 'Accessories',
    type: item.type || 'lost',
    description: item.description || '',
    location: item.location || '',
    date: item.date || '',
    imageUrl: item.imageUrl || '',
    status: item.status || 'ACTIVE',
    contactPreference: item.contactPreference || 'in_app'
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateItem(item._id, formData);
      if (res.success) {
        addToast('Report updated successfully', 'success');
        if (onUpdated) onUpdated(res.item);
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update report', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelReport = async () => {
    if (!window.confirm('Are you sure you want to cancel and remove this report?')) return;
    setSaving(true);
    try {
      const res = await api.deleteItem(item._id);
      if (res.success) {
        addToast('Report cancelled and removed', 'info');
        if (onUpdated) onUpdated(null);
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to remove report', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit Item Report</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Status Selector */}
          <div className="form-group">
            <label className="form-label">Current Status</label>
            <select
              className="form-select"
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{ fontWeight: 700 }}
            >
              <option value="ACTIVE">ACTIVE (Looking for item / Owner)</option>
              <option value="CLAIMED">CLAIMED (Claim in progress)</option>
              <option value="RETURNED">RETURNED (Safely Reunited! 🎉)</option>
              <option value="CANCELLED">CANCELLED (No longer relevant)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Item Title</label>
            <input
              type="text"
              className="form-input"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Landmark</label>
            <input
              type="text"
              className="form-input"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (or Unsplash photo URL)</label>
            <input
              type="url"
              className="form-input"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleCancelReport}
              disabled={saving}
              title="Soft-delete this report"
            >
              <Trash2 size={15} />
              <span>Cancel / Delete Report</span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
