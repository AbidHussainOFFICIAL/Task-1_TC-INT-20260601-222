import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';

function StarDisplay({ rating, size = '1.3rem' }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let fill = '#cbd5e1';
    if (rating >= i) fill = '#f59e0b';
    else if (rating >= i - 0.5) fill = '#fcd34d';
    stars.push(
      <span key={i} style={{ fontSize: size, color: fill, lineHeight: 1 }}>★</span>
    );
  }
  return <span style={{ display: 'inline-flex', gap: 2 }}>{stars}</span>;
}

export default function ProviderProfileView() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/api/profile/${userId}`),
          api.get(`/api/reviews/provider/${userId}`),
        ]);
        setProfile(profileRes.data.profile);
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="page-loading" role="status">
        <div className="page-loading-spinner" aria-hidden="true" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-shell" style={{ maxWidth: 700 }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  const avg = profile.averageRating || 0;
  const count = profile.reviewCount || 0;

  return (
    <div className="profile-page">
      <div className="profile-rating-banner">
        <StarDisplay rating={avg} size="2rem" />
        <div>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#92400e', lineHeight: 1 }}>
            {count > 0 ? avg.toFixed(1) : '—'}
          </span>
          <span style={{ fontSize: '1.1rem', color: '#b45309', marginLeft: 4 }}>/ 5.0</span>
          <div style={{ fontSize: '0.88rem', color: '#78350f', marginTop: 2, fontWeight: 500 }}>
            {count > 0 ? `${count} review${count !== 1 ? 's' : ''}` : 'No reviews yet'}
          </div>
        </div>
      </div>

      <ProfileCard profile={profile} />

      {reviews.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#0f172a' }}>
            Customer Reviews
          </h3>
          <div className="review-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-card-top">
                  <div>
                    <StarDisplay rating={review.rating} size="1.1rem" />
                    <span style={{ marginLeft: 8, fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      {review.customer?.name || 'Anonymous'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.94rem', color: '#475569', lineHeight: 1.55 }}>
                  {review.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
