import { useCallback, useEffect, useState } from 'react';
import { Users, ShoppingCart, Briefcase, Package, ChartBar, Star } from 'phosphor-react';
import api from '../services/api';
import DashboardHeader from '../components/DashboardHeader';
import StatCard from '../components/StatCard';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Accepted: '#3b82f6',
  'In Progress': '#8b5cf6',
  Completed: '#06b6d4',
  Delivered: '#10b981',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const projectsByStatus = stats?.stats?.projectsByStatus || {};
  const maxCount = Math.max(...Object.values(projectsByStatus), 1);

  return (
    <div className="dashboard-shell" style={{ maxWidth: 960 }}>
      <DashboardHeader subtitle="Admin platform overview" />

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {loading ? (
        <p>Loading stats...</p>
      ) : stats && (
        <>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#475569' }}>User Statistics</h2>
          <div className="stats-grid stats-grid-3">
            <StatCard
              label="Total Users"
              value={stats.stats.totalUsers}
              icon={<Users size={24} weight="bold" />}
              accent="#3b82f6"
            />
            <StatCard
              label="Customers"
              value={stats.stats.customerCount}
              icon={<ShoppingCart size={24} weight="bold" />}
              accent="#10b981"
            />
            <StatCard
              label="Providers"
              value={stats.stats.providerCount}
              icon={<Briefcase size={24} weight="bold" />}
              accent="#8b5cf6"
            />
          </div>

          <h2 style={{ margin: '32px 0 16px 0', fontSize: '1.1rem', color: '#475569' }}>Platform Statistics</h2>
          <div className="stats-grid stats-grid-3">
            <StatCard
              label="Active Services"
              value={stats.stats.totalActiveServices}
              icon={<Package size={24} weight="bold" />}
              accent="#f59e0b"
            />
            <StatCard
              label="Total Projects"
              value={stats.stats.totalProjects}
              icon={<ChartBar size={24} weight="bold" />}
              accent="#06b6d4"
            />
            <StatCard
              label="Total Reviews"
              value={stats.stats.totalReviews}
              icon={<Star size={24} weight="bold" />}
              accent="#ec4899"
            />
          </div>

          <div style={{ marginTop: 32 }}>
            <h2 style={{ margin: '0 0 16px 0' }}>Project Status Breakdown</h2>

            <div className="admin-status-bars" style={{ marginBottom: 24 }}>
              {Object.entries(projectsByStatus).map(([status, count]) => (
                <div key={status} className="admin-status-row">
                  <span className="admin-status-label">{status}</span>
                  <div className="admin-status-bar-track">
                    <div
                      className="admin-status-bar-fill"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: STATUS_COLORS[status] || '#94a3b8',
                      }}
                    />
                  </div>
                  <span className="admin-status-count">{count}</span>
                </div>
              ))}
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(projectsByStatus).map(([status, count]) => {
                    const share = stats.stats.totalProjects
                      ? ((count / stats.stats.totalProjects) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <tr key={status}>
                        <td>
                          <span
                            className="admin-status-dot"
                            style={{ backgroundColor: STATUS_COLORS[status] || '#94a3b8' }}
                          />
                          {status}
                        </td>
                        <td>{count}</td>
                        <td>{share}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {stats.stats.adminCount > 0 && (
              <p style={{ marginTop: 16, fontSize: '0.88rem', color: '#64748b' }}>
                Includes {stats.stats.adminCount} admin account{stats.stats.adminCount !== 1 ? 's' : ''} in total user count.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
