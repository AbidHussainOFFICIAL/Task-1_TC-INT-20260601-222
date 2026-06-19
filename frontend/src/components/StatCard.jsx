export default function StatCard({ label, value, icon, accent = '#3b82f6', children }) {
  return (
    <div className="stat-card" style={{ '--stat-accent': accent }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
        {children}
      </div>
    </div>
  );
}
