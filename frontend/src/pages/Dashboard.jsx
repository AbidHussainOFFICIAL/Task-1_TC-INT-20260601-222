import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-shell">
      <h1>Dashboard</h1>
      <p>Welcome back, {user?.name || 'User'}.</p>
      <p>Your role: {user?.role}</p>
      <button type="button" onClick={logout}>Log out</button>
    </div>
  );
}
