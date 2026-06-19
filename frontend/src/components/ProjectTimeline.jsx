const STATUS_STEPS = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Delivered'];

export default function ProjectTimeline({ currentStatus }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: 4 }}>
      {STATUS_STEPS.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;
        return (
          <div key={status} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {index > 0 && (
              <div style={{
                position: 'absolute',
                left: '-50%',
                right: '50%',
                top: 10,
                height: 3,
                backgroundColor: index <= currentIndex ? '#10b981' : '#e2e8f0',
                zIndex: 1,
              }} />
            )}
            <div style={{
              width: 22, height: 22,
              borderRadius: '50%',
              backgroundColor: isActive ? '#3b82f6' : (isCompleted ? '#10b981' : '#ffffff'),
              border: `2px solid ${isActive ? '#3b82f6' : (isCompleted ? '#10b981' : '#cbd5e1')}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              zIndex: 2,
              boxShadow: isActive ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
              transition: 'all 0.3s ease',
            }}>
              {isCompleted && !isActive ? '✓' : ''}
            </div>
            <span style={{
              marginTop: 6,
              fontSize: '0.72rem',
              fontWeight: isActive || isCompleted ? 600 : 500,
              color: isActive ? '#3b82f6' : (isCompleted ? '#10b981' : '#64748b'),
              textAlign: 'center',
            }}>
              {status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
