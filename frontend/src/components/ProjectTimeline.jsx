const STATUS_STEPS = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Delivered'];

export default function ProjectTimeline({ currentStatus }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="project-timeline" aria-label="Project status timeline">
      {STATUS_STEPS.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={status} className="project-timeline-step">
            {index > 0 && (
              <div
                className="project-timeline-connector"
                style={{ backgroundColor: index <= currentIndex ? '#10b981' : '#e2e8f0' }}
              />
            )}
            <div
              className="project-timeline-dot"
              style={{
                backgroundColor: isActive ? '#3b82f6' : (isCompleted ? '#10b981' : '#ffffff'),
                border: `2px solid ${isActive ? '#3b82f6' : (isCompleted ? '#10b981' : '#cbd5e1')}`,
                color: '#ffffff',
                boxShadow: isActive ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
              }}
            >
              {isCompleted && !isActive ? '✓' : ''}
            </div>
            <span
              className="project-timeline-label"
              style={{
                fontWeight: isActive || isCompleted ? 600 : 500,
                color: isActive ? '#3b82f6' : (isCompleted ? '#10b981' : '#64748b'),
              }}
            >
              {status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
