import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <div className="header-bar">
      <div className="header-bar-identity">
        {user ? (
          <>
            <strong>{user.name}</strong>
            <span>{user.role ? ` • ${user.role}` : ''}</span>
          </>
        ) : (
          <>
            <strong>Service Marketplace</strong>
            <span>Browse and hire freelancers</span>
          </>
        )}
      </div>
      <div className="header-links">
        <Link to="/marketplace">Marketplace</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.role === 'Service Provider' && <Link to="/profile/complete">Complete Profile</Link>}
            <button type="button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
