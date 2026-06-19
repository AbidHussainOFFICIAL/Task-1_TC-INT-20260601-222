import { useAuth } from '../context/AuthContext';

export default function DashboardHeader({ subtitle }) {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <div>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>
          Welcome back, {user?.name}. {subtitle || `Role: ${user?.role}`}
        </p>
      </div>
      <button
        type="button"
        onClick={logout}
        style={{
          padding: '10px 18px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          fontWeight: 600,
          marginTop: 0,
        }}
      >
        Log out
      </button>
    </div>
  );
}
