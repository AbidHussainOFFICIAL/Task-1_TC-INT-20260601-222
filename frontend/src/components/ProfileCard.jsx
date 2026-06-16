import { Link } from 'react-router-dom';
import SkillPill from './SkillPill';
import PortfolioItem from './PortfolioItem';

export default function ProfileCard({ profile }) {
  return (
    <div style={{padding:20, borderRadius:12, background:'#fff', boxShadow:'0 8px 30px rgba(2,6,23,0.06)'}}>
      <div style={{display:'flex', gap:16}}>
        <img src={profile.profilePictureUrl || '/src/assets/react.svg'} alt="avatar" width={120} height={120} style={{borderRadius:12, objectFit:'cover'}} />
        <div>
          <h2 style={{margin:0}}>{profile.user?.name}</h2>
          <p style={{margin:'6px 0'}}>{profile.headline}</p>
          <p style={{margin:'6px 0', color:'#475569'}}>{profile.bio}</p>
          <div style={{marginTop:8}}>
            {profile.skills?.map(s => <SkillPill key={s} skill={s} />)}
          </div>
        </div>
      </div>
      <div style={{marginTop:18, display:'flex', justifyContent:'flex-end'}}>
        <Link to={`/profile/${profile.user?._id || profile.user?.id || profile.user}`} style={{textDecoration:'none'}}>
          <button style={{padding:'8px 12px', borderRadius:8, border:'1px solid #cbd5e1', background:'#fff'}}>View portfolio</button>
        </Link>
      </div>

      <div style={{marginTop:18}}>
        <h3>Portfolio</h3>
        {profile.portfolio?.length ? profile.portfolio.map((p, idx) => <PortfolioItem key={idx} item={p} />) : <p>No portfolio items yet.</p>}
      </div>

      <div style={{marginTop:18}}>
        <h3>Experience</h3>
        {profile.experience?.length ? (
          profile.experience.map((exp, idx) => (
            <div key={idx} style={{borderLeft:'3px solid #6366f1', paddingLeft:12, marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <h4 style={{margin:0, color:'#1e1b4b'}}>{exp.title}</h4>
                <span style={{fontSize:'0.85rem', color:'#6b7280', fontWeight:500}}>{exp.period}</span>
              </div>
              <div style={{fontSize:'0.9rem', color:'#4f46e5', fontWeight:600, margin:'2px 0 6px 0'}}>{exp.company}</div>
              <p style={{margin:0, fontSize:'0.9rem', color:'#4b5563', lineHeight:1.5}}>{exp.description}</p>
            </div>
          ))
        ) : (
          <p style={{color:'#6b7280'}}>No experience items listed yet.</p>
        )}
      </div>

      <div style={{marginTop:18}}>
        <h3>Pricing</h3>
        <p>Starting price: {profile.pricing?.startingPrice ? '$' + profile.pricing.startingPrice : 'Not specified'}</p>
      </div>
    </div>
  );
}
