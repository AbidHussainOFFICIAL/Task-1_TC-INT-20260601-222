import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';

// Renders filled, half, or empty stars based on a decimal rating
function StarDisplay({ rating, size = '1.3rem' }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let fill = '#cbd5e1'; // empty
    if (rating >= i) fill = '#f59e0b';             // full
    else if (rating >= i - 0.5) fill = '#fcd34d';  // half (visually lighter)
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

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/api/profile/${userId}`),
          api.get(`/api/reviews/provider/${userId}`),
        ]);
        setProfile(profileRes.data.profile);
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load profile');
      }
    })();
  }, [userId]);

  if (error) return <div style={{ padding: 20 }}>{error}</div>;
  if (!profile) return <div style={{ padding: 20 }}>Loading...</div>;

  const avg = profile.averageRating || 0;
  const count = profile.reviewCount || 0;

  return (
    <div style={{ maxWidth: 1000, margin: '20px auto', padding: '0 16px' }}>

      {/* ── Star Rating Banner ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        background: 'linear-gradient(135deg, #fefce8 0%, #fff7ed 100%)',
        border: '1px solid #fde68a',
        borderRadius: 16,
        padding: '18px 24px',
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(245,158,11,0.08)',
      }}>
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

      {/* ── Profile Card ── */}
      <ProfileCard profile={profile} />

      {/* ── Review List ── */}
      {reviews.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#0f172a' }}>
            Customer Reviews
          </h3>
          <div style={{
            display: 'grid',
            gap: 14,
            maxHeight: 520,
            overflowY: 'auto',
            paddingRight: 4,
          }}>
            {reviews.map((review) => (
              <div key={review._id} style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '16px 20px',
                boxShadow: '0 1px 4px rgba(2,6,23,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <StarDisplay rating={review.rating} size="1.1rem" />
                    <span style={{ marginLeft: 8, fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      {review.customer?.name || 'Anonymous'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
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
