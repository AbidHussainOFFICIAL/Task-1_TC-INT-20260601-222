import { useCallback, useEffect, useState } from 'react';
import { Clipboard, CheckCircle, CreditCard } from 'phosphor-react';
import api from '../services/api';
import DashboardHeader from '../components/DashboardHeader';
import StatCard from '../components/StatCard';
import ProjectListSection from '../components/ProjectListSection';
import CustomerProfileSection from '../components/CustomerProfileSection';

function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString()}`;
}

export default function CustomerDashboard() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await api.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      setStatsError(err.response?.data?.message || 'Failed to fetch dashboard stats.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const res = await api.get('/api/projects/customer');
      setProjects(res.data.projects || []);
    } catch (err) {
      setProjectsError(err.response?.data?.message || 'Failed to fetch projects.');
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchProjects();
  }, [fetchStats, fetchProjects]);

  return (
    <div className="dashboard-shell" style={{ maxWidth: 960 }}>
      <DashboardHeader subtitle="Customer overview" />

      {statsError && <p style={{ color: '#dc2626' }}>{statsError}</p>}

      {statsLoading ? (
        <p>Loading stats...</p>
      ) : stats && (
        <div className="stats-grid stats-grid-3">
          <StatCard
            label="Active Requests"
            value={stats.stats.activeCount}
            icon={<Clipboard size={24} weight="bold" />}
            accent="#3b82f6"
          />
          <StatCard
            label="Completed Projects"
            value={stats.stats.completedCount}
            icon={<CheckCircle size={24} weight="bold" />}
            accent="#10b981"
          />
          <StatCard
            label="Total Spend"
            value={formatCurrency(stats.stats.totalSpend)}
            icon={<CreditCard size={24} weight="bold" />}
            accent="#8b5cf6"
          />
        </div>
      )}

      <CustomerProfileSection />

      <ProjectListSection
        projects={projects}
        projectsLoading={projectsLoading}
        projectsError={projectsError}
        isProvider={false}
        onProjectsChange={setProjects}
      />
    </div>
  );
}
