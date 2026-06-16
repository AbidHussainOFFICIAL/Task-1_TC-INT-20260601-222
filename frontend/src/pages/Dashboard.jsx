import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CATEGORIES = [
  'Website Development',
  'Logo Design',
  'Social Media Management',
  'Content Writing',
  'Other'
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [picture, setPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const isProvider = user?.role === 'Service Provider';

  const fetchServices = useCallback(async () => {
    if (!isProvider) return;
    setLoading(true);
    try {
      const res = await api.get('/api/services/provider');
      setServices(res.data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  }, [isProvider]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(CATEGORIES[0]);
    setCustomCategory('');
    setPrice('');
    setDeliveryTime('');
    setPicture(null);
    setPicturePreview('');
    setEditingServiceId(null);
    setFormError(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (svc) => {
    setTitle(svc.title);
    setDescription(svc.description);
    if (CATEGORIES.includes(svc.category)) {
      setCategory(svc.category);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(svc.category);
    }
    setPrice(svc.price);
    setDeliveryTime(svc.deliveryTime);
    setEditingServiceId(svc._id);
    setPicture(null);
    setPicturePreview(svc.imageUrl || '');
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (svcId) => {
    if (!window.confirm('Are you sure you want to delete this service listing?')) {
      return;
    }
    try {
      await api.delete(`/api/services/${svcId}`);
      setServices(services.map(s => s._id === svcId ? { ...s, active: false } : s));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service listing.');
    }
  };

  const handleRestoreClick = async (svcId) => {
    try {
      const res = await api.put(`/api/services/${svcId}`, { active: true });
      setServices(services.map(s => s._id === svcId ? res.data.service : s));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore service listing.');
    }
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    setFormError(null);

    const finalCategory = category === 'Other' ? customCategory.trim() : category;

    if (!title.trim() || !description.trim() || !finalCategory || price === '' || !deliveryTime) {
      setFormError('All fields are required.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 5 || !Number.isInteger(numPrice)) {
      setFormError('Price must be an integer of at least $5 USD.');
      return;
    }

    setFormSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', finalCategory);
    formData.append('price', numPrice);
    formData.append('deliveryTime', Number(deliveryTime));
    if (picture) {
      formData.append('picture', picture);
    }

    try {
      if (editingServiceId) {
        const res = await api.put(`/api/services/${editingServiceId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setServices(services.map(s => s._id === editingServiceId ? res.data.service : s));
      } else {
        const res = await api.post('/api/services', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setServices([...services, res.data.service]);
      }
      handleResetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save service listing.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="dashboard-shell" style={{ maxWidth: 960 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Welcome back, {user?.name}. role: {user?.role}</p>
        </div>
        <button type="button" onClick={logout} style={{ padding: '10px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>
          Log out
        </button>
      </div>

      {isProvider ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
            <h2 style={{ margin: 0 }}>My Service Listings</h2>
            {!isFormOpen && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}
              >
                Create New Service
              </button>
            )}
          </div>

          {isFormOpen && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 24, marginBottom: 24, background: '#f8fafc' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>{editingServiceId ? 'Edit Service Listing' : 'Create New Service Listing'}</h3>
              <form onSubmit={handleSubmitService} className="auth-form" style={{ display: 'grid', gap: 16 }}>
                <label>
                  Service Title
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Modern Full-Stack Web Development"
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what is included in this service..."
                    rows={4}
                    required
                    style={{ padding: 12, borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '1rem' }}
                  />
                </label>

                <label>
                  Category
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 12, borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '1rem' }}>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>

                {category === 'Other' && (
                  <label>
                    Custom Category Name
                    <input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. SEO Audit"
                      required
                    />
                  </label>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <label>
                    Price ($)
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="99"
                      min="5"
                      step="1"
                      required
                    />
                  </label>

                  <label>
                    Delivery Time (Days)
                    <input
                      type="number"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      placeholder="5"
                      min="1"
                      required
                    />
                  </label>
                </div>

                <label>
                  Service Thumbnail Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setPicture(file);
                      if (file) {
                        setPicturePreview(URL.createObjectURL(file));
                      } else {
                        setPicturePreview('');
                      }
                    }}
                    style={{ padding: '8px 10px', borderRadius: 12, border: '1px solid #cbd5e1' }}
                  />
                </label>

                {picturePreview && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#64748b' }}>Preview / Current Image:</p>
                    <img src={picturePreview} alt="Preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  </div>
                )}

                {formError && <p style={{ color: '#dc2626', margin: 0 }}>{formError}</p>}

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="submit" disabled={formSubmitting} style={{ flex: 1, padding: '12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>
                    {formSubmitting ? 'Saving...' : 'Save Service'}
                  </button>
                  <button type="button" onClick={handleResetForm} style={{ padding: '12px 20px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && <p style={{ color: '#dc2626' }}>{error}</p>}

          {loading ? (
            <p>Loading your listings...</p>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: 18, color: '#64748b' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>You haven't listed any services yet.</p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {services.map((svc) => (
                <div key={svc._id} className="service-card" style={{ opacity: svc.active === false ? 0.7 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#0f172a' }}>
                        {svc.title}
                        {svc.active === false && (
                          <span style={{ marginLeft: 8, padding: '4px 10px', borderRadius: 999, background: '#f1f5f9', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                            Archived
                          </span>
                        )}
                      </h3>
                      <span className="category-badge">
                        {svc.category}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>${svc.price}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>{svc.deliveryTime} day{svc.deliveryTime > 1 ? 's' : ''} delivery</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 4, alignItems: 'flex-start' }}>
                    {svc.imageUrl && (
                      <img src={svc.imageUrl} alt={svc.title} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0', flexShrink: 0 }} />
                    )}
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, flex: 1 }}>{svc.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleEditClick(svc)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    {svc.active === false ? (
                      <button
                        type="button"
                        onClick={() => handleRestoreClick(svc._id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: '#f0fdf4',
                          border: '1px solid #dcfce7',
                          color: '#15803d',
                          transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#dcfce7';
                          e.target.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#f0fdf4';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(svc._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 18, background: '#f8fafc' }}>
          <h2>Customer Area</h2>
          <p>As a customer, you can browse available services, request quotes, and hire service providers.</p>
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Marketplace Search & Filter engine features will be available in the next release.</p>
        </div>
      )}
    </div>
  );
}
