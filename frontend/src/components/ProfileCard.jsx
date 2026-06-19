import { Link } from 'react-router-dom';
import SkillPill from './SkillPill';
import PortfolioItem from './PortfolioItem';

export default function ProfileCard({ profile }) {
  const userId = profile.user?._id || profile.user?.id || profile.user;

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <img
          src={profile.profilePictureUrl || 'https://ui-avatars.com/api/?name=Provider&background=e2e8f0&color=475569'}
          alt={`${profile.user?.name || 'Provider'} avatar`}
          className="profile-card-avatar"
        />
        <div className="profile-card-body">
          <h2>{profile.user?.name}</h2>
          <p>{profile.headline}</p>
          <p className="profile-card-bio">{profile.bio}</p>
          <div style={{ marginTop: 8 }}>
            {profile.skills?.map((s) => <SkillPill key={s} skill={s} />)}
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3>Portfolio</h3>
        {profile.portfolio?.length
          ? profile.portfolio.map((p, idx) => <PortfolioItem key={idx} item={p} />)
          : <p>No portfolio items yet.</p>}
      </div>

      <div className="profile-section">
        <h3>Experience</h3>
        {profile.experience?.length ? (
          profile.experience.map((exp, idx) => (
            <div key={idx} className="profile-experience-item">
              <div className="profile-experience-top">
                <h4 style={{ margin: 0, color: '#1e1b4b' }}>{exp.title}</h4>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>{exp.period}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: 600, margin: '2px 0 6px 0' }}>{exp.company}</div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 }}>{exp.description}</p>
            </div>
          ))
        ) : (
          <p style={{ color: '#6b7280' }}>No experience items listed yet.</p>
        )}
      </div>

      <div className="profile-section">
        <h3>Pricing</h3>
        <p>
          Starting price:{' '}
          {profile.pricing?.startingPrice ? `$${profile.pricing.startingPrice}` : 'Not specified'}
        </p>
      </div>

      {userId && (
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <Link to={`/profile/${userId}`} style={{ textDecoration: 'none' }}>
            <button type="button" className="btn-action btn-action-primary">View portfolio</button>
          </Link>
        </div>
      )}
    </div>
  );
}
