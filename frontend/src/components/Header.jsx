import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="header-bar">
      <div>
        <strong>{user.name}</strong>
        <span>{user.role ? ` • ${user.role}` : ''}</span>
      </div>
      <div className="header-links">
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/dashboard">Dashboard</Link>
        {user.role === 'Service Provider' && <Link to="/profile/complete">Complete Profile</Link>}
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
