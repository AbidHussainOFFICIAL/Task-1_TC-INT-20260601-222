import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CompleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [picture, setPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'Service Provider') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!picture) {
      setPicturePreview(null);
      return;
    }

    const url = URL.createObjectURL(picture);
    setPicturePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [picture]);

  const isValid = useMemo(() => headline.trim() && bio.trim() && skills.trim(), [headline, bio, skills]);

  const handleAddPortfolio = () => setPortfolio([...portfolio, { title: '', description: '', url: '' }]);

  const handlePortfolioChange = (idx, field, value) => {
    const updated = [...portfolio];
    updated[idx][field] = value;
    setPortfolio(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setError('Headline, bio, and skills are required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('headline', headline);
      fd.append('bio', bio);
      fd.append('skills', skills);
      fd.append('pricing', JSON.stringify({ startingPrice: Number(startingPrice) || 0 }));
      fd.append('portfolio', JSON.stringify(portfolio.filter((item) => item.title.trim())));
      if (picture) fd.append('picture', picture);

      const res = await api.post('/api/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/profile/${res.data.profile.user._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 900 }}>
      <h1>Complete Your Profile</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Headline
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Experienced Frontend Developer" />
        </label>

        <label>
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Tell clients what you do best." />
        </label>

        <label>
          Skills (comma separated)
          <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, UX Design" />
        </label>

        <label>
          Starting price
          <input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="50" />
        </label>

        <label>
          Profile picture
          <input type="file" accept="image/*" onChange={(e) => setPicture(e.target.files?.[0] ?? null)} />
        </label>

        {picturePreview && (
          <div className="profile-preview">
            <strong>Preview</strong>
            <img src={picturePreview} alt="Profile preview" />
          </div>
        )}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Portfolio</h3>
            <button type="button" onClick={handleAddPortfolio} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: 'white' }}>
              Add item
            </button>
          </div>
          {portfolio.length === 0 && <p style={{ color: '#6b7280' }}>No portfolio items yet.</p>}
          {portfolio.map((item, idx) => (
            <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <input placeholder="Title" value={item.title} onChange={(e) => handlePortfolioChange(idx, 'title', e.target.value)} />
              <input placeholder="URL" value={item.url} onChange={(e) => handlePortfolioChange(idx, 'url', e.target.value)} style={{ marginTop: 10 }} />
              <textarea placeholder="Description" value={item.description} onChange={(e) => handlePortfolioChange(idx, 'description', e.target.value)} rows={3} style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>

        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <button className="primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
