import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { uploadImageToFirebase, saveItemToFirestore } from '../services/firebase';
import { CATEGORIES } from '../components/Filter';
import {
  Search,
  PlusCircle,
  Camera,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  FileText,
  Phone,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';

const PRESET_SAMPLE_IMAGES = {
  Accessories: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
  Wallets: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80",
  Electronics: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
  Keys: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
  Bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
  Documents: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80",
  Others: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80"
};

export default function ReportItem() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Accessories');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [contactPreference, setContactPreference] = useState('in_app');
  const [submitting, setSubmitting] = useState(false);

  // Live match radar state
  const [liveMatches, setLiveMatches] = useState([]);
  const [checkingMatches, setCheckingMatches] = useState(false);

  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  // Debounced live match detection
  useEffect(() => {
    if (title.length < 3) {
      setLiveMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingMatches(true);
      try {
        const res = await api.getLiveMatches({ title, category, type, location, date });
        if (res.success && res.matches) {
          setLiveMatches(res.matches);
        }
      } catch (err) {
        // ignore live match query error
      } finally {
        setCheckingMatches(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [title, category, type, location]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to Base64 instantly so it can be previewed and saved
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
      addToast('Photo attached successfully', 'success');
    };
    reader.readAsDataURL(file);

    // Also attempt Firebase Storage upload in background if online
    uploadImageToFirebase(file).then(fbUrl => {
      if (fbUrl) {
        setImageUrl(fbUrl);
      }
    }).catch(() => {});
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!user) {
      addToast('Please sign in first before publishing a report', 'error');
      navigate('/login');
      return;
    }

    if (!title.trim()) {
      addToast('Please enter an item title / name', 'error');
      return;
    }
    if (!location.trim()) {
      addToast('Please enter the location or campus landmark', 'error');
      return;
    }
    if (!description.trim()) {
      addToast('Please describe the item', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const finalImage = imageUrl.trim() || PRESET_SAMPLE_IMAGES[category] || PRESET_SAMPLE_IMAGES.Others;
      const res = await api.createItem({
        title: title.trim(),
        type,
        category,
        description: description.trim(),
        location: location.trim(),
        date: date || new Date().toISOString().split('T')[0],
        imageUrl: finalImage,
        contactPreference
      });

      if (res && res.success) {
        // Attempt Firestore sync in background
        saveItemToFirestore(res.item).catch(() => {});
        addToast(res.message || 'Report published successfully!', 'success');
        navigate(`/items/${res.item._id}`);
      }
    } catch (err) {
      console.error('Report submission error:', err);
      addToast(err.message || 'Failed to submit report. Please check required fields.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isLost = type === 'lost';

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      {/* Top Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
          Report a <span style={{ color: isLost ? '#D93025' : '#137333' }}>{isLost ? 'Lost Item' : 'Found Item'}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Provide clear details so our community matching algorithm can discover corresponding reports immediately.
        </p>
      </div>

      {/* Segmented Type Toggle */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        background: 'var(--bg-subtle)',
        padding: '0.5rem',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '2.5rem',
        border: '1px solid var(--border-light)'
      }}>
        <button
          type="button"
          onClick={() => setType('lost')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            fontSize: '1.05rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'var(--transition)',
            background: isLost ? '#FFFFFF' : 'transparent',
            color: isLost ? '#D93025' : 'var(--text-secondary)',
            boxShadow: isLost ? '0 4px 14px rgba(217, 48, 37, 0.15)' : 'none'
          }}
        >
          <Search size={20} />
          <span>🔴 I Lost Something</span>
        </button>

        <button
          type="button"
          onClick={() => setType('found')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            fontSize: '1.05rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'var(--transition)',
            background: !isLost ? '#FFFFFF' : 'transparent',
            color: !isLost ? '#137333' : 'var(--text-secondary)',
            boxShadow: !isLost ? '0 4px 14px rgba(19, 115, 51, 0.15)' : 'none'
          }}
        >
          <PlusCircle size={20} />
          <span>🟢 I Found Something</span>
        </button>
      </div>

      {/* Live Match Radar Banner (Real-time alert) */}
      {liveMatches.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF0EB 0%, #FEF7E0 100%)',
          border: '1.5px solid #FFAB91',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Sparkles size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', color: '#D93025' }}>
              Potential Matches Detected in Database ({liveMatches.length})
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Someone already posted a matching {isLost ? 'found' : 'lost'} item with similar details! You can review or claim directly:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {liveMatches.map(({ item, matchScore, reasons }) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #FFE0D6'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      📍 {item.location} • {reasons.slice(0, 2).join(' • ')}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/items/${item._id}`}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
                >
                  View Match ({matchScore}%)
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
        {/* Item Title */}
        <div className="form-group">
          <label className="form-label">
            Item Name / Title <span style={{ color: 'var(--google-red)' }}>*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={isLost ? "e.g. Black Wildcraft Leather Wallet" : "e.g. Found Black Leather Wallet with College ID"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category & Date */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">
              Category <span style={{ color: 'var(--google-red)' }}>*</span>
            </label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Date {isLost ? 'Lost' : 'Found'} <span style={{ color: 'var(--google-red)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="form-label">
            Exact Location / Campus Landmark <span style={{ color: 'var(--google-red)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. PCCOE Central Library, 2nd Floor Reference Section"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
              required
            />
            <MapPin size={17} color="var(--primary)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">
            Detailed Description <span style={{ color: 'var(--google-red)' }}>*</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder={
              isLost
                ? "Describe color, brand, distinct marks, or items inside. (e.g. 'Contains college ID PRN 20240182 and blue keycard')"
                : "Describe where it was found, visible brand, color, and general condition."
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        {/* Image Upload & Presets with Firebase Storage Support */}
        <div className="form-group">
          <label className="form-label">
            Item Image (Upload Photo or choose matching preset)
          </label>

          {/* File Upload to Firebase */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', gap: '0.4rem' }}>
              <UploadCloud size={16} />
              <span>{uploadingImage ? 'Uploading to Firebase...' : 'Upload Device Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR enter image URL:</span>

            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ paddingLeft: '2.2rem', padding: '0.5rem 0.5rem 0.5rem 2.2rem', fontSize: '0.88rem' }}
              />
              <ImageIcon size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
            </div>
          </div>

          {/* Quick preset selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Presets:</span>
            {Object.keys(PRESET_SAMPLE_IMAGES).map((presetCat) => (
              <button
                key={presetCat}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setImageUrl(PRESET_SAMPLE_IMAGES[presetCat])}
                style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)' }}
              >
                {presetCat}
              </button>
            ))}
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div style={{ marginTop: '0.75rem' }}>
              <img
                src={imageUrl}
                alt="Preview"
                style={{ height: '130px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-light)' }}
              />
            </div>
          )}
        </div>

        {/* Contact Preference */}
        <div className="form-group">
          <label className="form-label">Preferred Contact Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: contactPreference === 'in_app' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
              background: contactPreference === 'in_app' ? 'var(--primary-light)' : 'var(--bg-surface)',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="contactPref"
                value="in_app"
                checked={contactPreference === 'in_app'}
                onChange={() => setContactPreference('in_app')}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>In-App Claim (Secure)</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: contactPreference === 'email' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
              background: contactPreference === 'email' ? 'var(--primary-light)' : 'var(--bg-surface)',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="contactPref"
                value="email"
                checked={contactPreference === 'email'}
                onChange={() => setContactPreference('email')}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Direct Email</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: contactPreference === 'phone' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
              background: contactPreference === 'phone' ? 'var(--primary-light)' : 'var(--bg-surface)',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="contactPref"
                value="phone"
                checked={contactPreference === 'phone'}
                onChange={() => setContactPreference('phone')}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Phone / WhatsApp</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '2rem' }}>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontSize: '1.05rem', fontWeight: 700 }}
            disabled={submitting}
          >
            {submitting ? 'Publishing Report...' : `Publish ${isLost ? 'Lost' : 'Found'} Item Report`}
          </button>
        </div>
      </form>
    </div>
  );
}
