import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  const [experience, setExperience] = useState([]);
  const [picture, setPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'Service Provider') {
      navigate('/dashboard');
      return;
    }

    // Fetch existing profile
    api.get('/api/profile/me')
      .then((res) => {
        const p = res.data.profile;
        if (p) {
          setHeadline(p.headline || '');
          setBio(p.bio || '');
          setSkills(p.skills ? p.skills.join(', ') : '');
          setStartingPrice(p.pricing?.startingPrice || '');
          setPortfolio(p.portfolio || []);
          setExperience(p.experience || []);
          if (p.profilePictureUrl) {
            setPicturePreview(p.profilePictureUrl);
          }
        }
      })
      .catch((err) => {
        // 404 means profile does not exist yet; ignore it.
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load profile.');
        }
      });
  }, [user, navigate]);

  useEffect(() => {
    if (!picture) {
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

  const handleRemovePortfolio = (idx) => {
    setPortfolio(portfolio.filter((_, i) => i !== idx));
  };

  const handleAddExperience = () => setExperience([...experience, { title: '', company: '', period: '', description: '' }]);

  const handleExperienceChange = (idx, field, value) => {
    const updated = [...experience];
    updated[idx][field] = value;
    setExperience(updated);
  };

  const handleRemoveExperience = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
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
      fd.append('experience', JSON.stringify(experience.filter((item) => item.title.trim())));
      if (picture) fd.append('picture', picture);

      const res = await api.post('/api/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const returnedUser = res?.data?.profile?.user;
      const userId = returnedUser?._id || returnedUser?.id || returnedUser;
      if (userId) {
        toast.success('Profile saved successfully!');
        navigate(`/profile/${userId}`);
      } else {
        console.warn('Profile created but no user id returned, redirecting to dashboard');
        navigate('/dashboard');
      }
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

        <div style={{ marginTop: 20 }}>
          <div className="section-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Experience</h3>
            <button type="button" className="btn-action" style={{ background: 'white', border: '1px solid #cbd5e1' }} onClick={handleAddExperience}>
              Add Experience
            </button>
          </div>
          {experience.length === 0 && <p style={{ color: '#6b7280' }}>No experience items listed yet.</p>}
          {experience.map((item, idx) => (
            <div key={idx} className="form-block">
              <button
                type="button"
                className="form-block-remove"
                onClick={() => handleRemoveExperience(idx)}
              >
                Remove
              </button>
              <div className="form-block-grid">
                <input placeholder="Job Title (e.g. Lead Developer)" value={item.title} onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)} />
                <input placeholder="Company" value={item.company} onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)} />
              </div>
              <input placeholder="Period (e.g. 2021 - 2024)" value={item.period} onChange={(e) => handleExperienceChange(idx, 'period', e.target.value)} style={{ marginTop: 10, width: '100%' }} />
              <textarea placeholder="Description of your responsibilities" value={item.description} onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)} rows={3} style={{ marginTop: 10, width: '100%' }} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="section-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Portfolio</h3>
            <button type="button" className="btn-action" style={{ background: 'white', border: '1px solid #cbd5e1' }} onClick={handleAddPortfolio}>
              Add item
            </button>
          </div>
          {portfolio.length === 0 && <p style={{ color: '#6b7280' }}>No portfolio items yet.</p>}
          {portfolio.map((item, idx) => (
            <div key={idx} className="form-block">
              <button
                type="button"
                className="form-block-remove"
                onClick={() => handleRemovePortfolio(idx)}
              >
                Remove
              </button>
              <input placeholder="Title" value={item.title} onChange={(e) => handlePortfolioChange(idx, 'title', e.target.value)} style={{ width: '100%' }} />
              <input placeholder="URL" value={item.url} onChange={(e) => handlePortfolioChange(idx, 'url', e.target.value)} style={{ marginTop: 10, width: '100%' }} />
              <textarea placeholder="Description" value={item.description} onChange={(e) => handlePortfolioChange(idx, 'description', e.target.value)} rows={3} style={{ marginTop: 10, width: '100%' }} />
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
