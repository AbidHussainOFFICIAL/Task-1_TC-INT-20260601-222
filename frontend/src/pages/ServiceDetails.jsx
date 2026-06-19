import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Briefcase } from 'phosphor-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/services/${id}`);
        setService(res.data.service);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load service.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openOrderModal = () => {
    if (!user) {
      toast.error('Please log in to place an order.');
      navigate('/login');
      return;
    }
    if (user.role !== 'Customer') {
      toast.error('Only customers can place service orders.');
      return;
    }

    setRequirements('');
    setBudget(String(service.price));
    const deliveryDays = Number(service.deliveryTime) || 1;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + deliveryDays);
    setDeadline(futureDate.toISOString().split('T')[0]);
    setOrderError(null);
    setShowOrderModal(true);
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
        serviceId: service._id,
        requirements: requirements.trim(),
        budget: Number(budget),
        deadline,
      });
      toast.success('Your service request has been submitted!');
      setShowOrderModal(false);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit order request.';
      setOrderError(message);
      toast.error(message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-shell" style={{ maxWidth: 900, margin: '0 auto' }}>
        <p>Loading service...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="dashboard-shell" style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ color: '#dc2626' }}>{error || 'Service not found.'}</p>
        <Link to="/marketplace" style={{ color: '#3b82f6' }}>Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="dashboard-shell service-details-page" style={{ maxWidth: 900, margin: '0 auto' }}>
      <Link to="/marketplace" className="service-details-back">&larr; Back to Marketplace</Link>

      <div className="service-details-layout">
        <div className="service-details-media">
          {service.imageUrl ? (
            <img src={service.imageUrl} alt={service.title} className="service-details-image" />
          ) : (
            <div className="service-details-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={64} weight="bold" color="#94a3b8" />
            </div>
          )}
        </div>

        <div className="service-details-content">
          <span className="category-badge">{service.category}</span>
          <h1 className="service-details-title">{service.title}</h1>
          <p className="service-details-provider">
            by{' '}
            <Link to={`/profile/${service.provider?._id}`} style={{ color: '#3b82f6', fontWeight: 600 }}>
              {service.provider?.name || 'Provider'}
            </Link>
          </p>
          <p className="service-details-description">{service.description}</p>

          <div className="service-details-meta">
            <div>
              <div className="service-details-price">${service.price}</div>
              <div className="service-details-delivery">
                {service.deliveryTime} day{service.deliveryTime > 1 ? 's' : ''} delivery
              </div>
            </div>
            <button
              type="button"
              onClick={openOrderModal}
              className="service-details-order-btn"
            >
              Order Service
            </button>
          </div>
        </div>
      </div>

      {showOrderModal && (
        <div className="modal-overlay">
          <div className="dashboard-shell modal-panel">
            <button
              type="button"
              onClick={() => setShowOrderModal(false)}
              className="modal-close"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 style={{ marginTop: 0 }}>Order Service</h2>
            <p style={{ color: '#64748b' }}>
              Request a custom order for <strong>{service.title}</strong>.
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

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, marginTop: 0 }}
                >
                  {orderSubmitting ? 'Submitting...' : 'Submit Order Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  style={{ padding: '12px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, marginTop: 0 }}
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
