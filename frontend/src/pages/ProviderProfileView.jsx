import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';

export default function ProviderProfileView(){
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await api.get(`/api/profile/${userId}`);
        setProfile(res.data.profile);
      }catch(err){
        setError(err.response?.data?.message || 'Unable to load profile');
      }
    })();
  },[userId]);

  if (error) return <div style={{padding:20}}>{error}</div>;
  if (!profile) return <div style={{padding:20}}>Loading...</div>;

  return (
    <div style={{maxWidth:1000, margin:'20px auto'}}>
      <ProfileCard profile={profile} />
    </div>
  );
}
