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

      <div style={{marginTop:18}}>
        <h3>Portfolio</h3>
        {profile.portfolio?.length ? profile.portfolio.map((p, idx) => <PortfolioItem key={idx} item={p} />) : <p>No portfolio items yet.</p>}
      </div>

      <div style={{marginTop:18}}>
        <h3>Pricing</h3>
        <p>Starting price: {profile.pricing?.startingPrice ? '$' + profile.pricing.startingPrice : 'Not specified'}</p>
      </div>
    </div>
  );
}
