import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase } from 'phosphor-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

const CATEGORIES = [
  'All',
  'Website Development',
  'Logo Design',
  'Social Media Management',
  'Content Writing',
  'Other'
];

export default function MarketplaceExplorer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters — search input is debounced before API calls
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Order Modal states
  const [selectedService, setSelectedService] = useState(null);
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (category && category !== 'All') params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.get('/api/services', { params });
      setServices(res.data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, minPrice, maxPrice]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handleOrderClick = (svc) => {
    if (!user) {
      toast.error('Please log in to place an order.');
      navigate('/login');
      return;
    }
    if (user.role !== 'Customer') {
      toast.error('Only customers can place service orders.');
      return;
    }

    setSelectedService(svc);
    setRequirements('');
    setBudget(svc.price);
    const deliveryDays = Number(svc.deliveryTime) || 1;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + deliveryDays);
    setDeadline(futureDate.toISOString().split('T')[0]);
    setOrderError(null);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderError(null);

    if (!requirements.trim() || budget === '' || !deadline) {
      setOrderError('All fields are required.');
      return;
    }

    setOrderSubmitting(true);
    try {
      await api.post('/api/projects', {
        serviceId: selectedService._id,
        requirements: requirements.trim(),
        budget: Number(budget),
        deadline,
      });
      toast.success('Your service request has been submitted successfully!');
      setSelectedService(null);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to submit order request.');
      toast.error(err.response?.data?.message || 'Failed to submit order request.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="dashboard-shell marketplace-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>Marketplace</h1>
        <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '1.1rem' }}>Find the perfect service for your needs</p>
      </div>

      <div className="marketplace-layout">
        {/* Sidebar Filters */}
        <div className="marketplace-filters">
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem' }}>Filters</h3>
          
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#475569' }}>Search</label>
              <input
                type="text"
                placeholder="Keywords..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#475569' }}>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#475569' }}>Price Range ($)</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
              </div>
            </div>

            <button 
              type="submit"
              style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: '1rem', marginTop: 10 }}
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="marketplace-results">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <h2>Loading services...</h2>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#dc2626', background: '#fee2e2', borderRadius: 18 }}>
              <p>{error}</p>
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #cbd5e1', borderRadius: 18, color: '#64748b' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', color: '#0f172a' }}>No services found</h3>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>Try adjusting your filters or search terms.</p>
              <button 
                onClick={() => {
                  setSearchInput('');
                  setCategory('All');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                style={{ marginTop: 24, padding: '10px 20px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: 20, color: '#64748b', fontWeight: 500 }}>Showing {services.length} result{services.length !== 1 ? 's' : ''}</p>
              <div style={{ display: 'grid', gap: 20 }}>
                {services.map(svc => (
                  <div key={svc._id} className="service-card marketplace-service-card">
                    <div className="marketplace-card-inner">
                      {/* Thumbnail Section */}
                      <div className="marketplace-card-thumb">
                        {svc.imageUrl ? (
                          <img src={svc.imageUrl} alt={svc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Briefcase size={48} weight="bold" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content Section */}
                      <div className="marketplace-card-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <span className="category-badge">{svc.category}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>by <strong>{svc.provider?.name || 'Unknown'}</strong></span>
                        </div>
                        <Link to={`/services/${svc._id}`} className="marketplace-card-title">
                          {svc.title}
                        </Link>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>{svc.description}</p>
                      </div>
                      
                      {/* Actions/Price Section */}
                      <div className="marketplace-card-actions">
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>${svc.price}</div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: 4 }}>{svc.deliveryTime} day{svc.deliveryTime > 1 ? 's' : ''} delivery</div>
                        </div>
                        <Link to={`/services/${svc._id}`} className="marketplace-card-btn marketplace-card-btn-details">
                          View Details
                        </Link>
                        <Link to={`/profile/${svc.provider?._id}`} className="marketplace-card-btn marketplace-card-btn-provider">
                          View Provider
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOrderClick(svc)}
                          className="marketplace-card-btn marketplace-card-btn-order"
                        >
                          Order Service
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedService && (
        <div className="modal-overlay">
          <div className="dashboard-shell modal-panel">
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className="modal-close"
              aria-label="Close order dialog"
            >
              &times;
            </button>

            <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: '1.5rem', color: '#0f172a' }}>Order Service</h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.95rem' }}>
              You are requesting a custom order for <strong>{selectedService.title}</strong> by {selectedService.provider?.name || 'freelancer'}.
            </p>

            <form onSubmit={handleOrderSubmit} className="auth-form" style={{ display: 'grid', gap: 16 }}>
                <label>
                  Requirements
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide clear details of what you need..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    style={{ padding: 12, borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
                  />
                </label>

                <div className="form-two-col">
                  <label>
                    Your Budget ($)
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="100"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </label>

                  <label>
                    Deadline Date
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </label>
                </div>

                {orderError && <p style={{ color: '#dc2626', margin: 0 }}>{orderError}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }} className="modal-actions">
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="btn-action btn-action-primary"
                    style={{ flex: 1 }}
                  >
                    {orderSubmitting ? 'Submitting Request...' : 'Submit Order Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="btn-action"
                    style={{ background: '#e2e8f0', color: '#475569' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
}
