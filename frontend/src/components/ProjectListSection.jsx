import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import ProjectTimeline from './ProjectTimeline';
import StarPicker from './StarPicker';

export default function ProjectListSection({
  projects,
  projectsLoading,
  projectsError,
  isProvider,
  onProjectsChange,
  title,
}) {
  const [openReviewPanels, setOpenReviewPanels] = useState({});
  const [reviewRatings, setReviewRatings] = useState({});
  const [reviewFeedbacks, setReviewFeedbacks] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState({});
  const [reviewSubmitted, setReviewSubmitted] = useState({});
  const [reviewErrors, setReviewErrors] = useState({});

  const handleUpdateProjectStatus = async (projectId, nextStatus) => {
    try {
      const res = await api.patch(`/api/projects/${projectId}/status`, { status: nextStatus });
      onProjectsChange(projects.map((p) => (p._id === projectId ? res.data.project : p)));
      toast.success(`Project status updated to ${nextStatus}.`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update project status.';
      toast.error(message);
    }
  };

  const toggleReviewPanel = (projectId) => {
    setOpenReviewPanels((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const handleSubmitReview = async (projectId) => {
    const rating = reviewRatings[projectId];
    const feedback = reviewFeedbacks[projectId] || '';

    if (!rating) {
      setReviewErrors((prev) => ({ ...prev, [projectId]: 'Please select a star rating.' }));
      return;
    }
    if (!feedback.trim()) {
      setReviewErrors((prev) => ({ ...prev, [projectId]: 'Please enter your feedback.' }));
      return;
    }

    setReviewSubmitting((prev) => ({ ...prev, [projectId]: true }));
    setReviewErrors((prev) => ({ ...prev, [projectId]: null }));

    try {
      await api.post('/api/reviews', { projectId, rating, feedback: feedback.trim() });
      setReviewSubmitted((prev) => ({ ...prev, [projectId]: true }));
      setOpenReviewPanels((prev) => ({ ...prev, [projectId]: false }));
      toast.success('Review submitted successfully!');
    } catch (err) {
      setReviewErrors((prev) => ({
        ...prev,
        [projectId]: err.response?.data?.message || 'Failed to submit review.',
      }));
    } finally {
      setReviewSubmitting((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  const renderProjectActions = (project) => {
    const { status, _id } = project;

    if (isProvider) {
      if (status === 'Pending') {
        return (
          <button
            type="button"
            className="project-action-btn"
            style={{ background: '#3b82f6', color: 'white' }}
            onClick={() => handleUpdateProjectStatus(_id, 'Accepted')}
          >
            Accept Project
          </button>
        );
      }
      if (status === 'Accepted') {
        return (
          <button
            type="button"
            className="project-action-btn"
            style={{ background: '#10b981', color: 'white' }}
            onClick={() => handleUpdateProjectStatus(_id, 'In Progress')}
          >
            Start Work
          </button>
        );
      }
      if (status === 'In Progress') {
        return (
          <button
            type="button"
            className="project-action-btn"
            style={{ background: '#f59e0b', color: 'white' }}
            onClick={() => handleUpdateProjectStatus(_id, 'Completed')}
          >
            Mark as Completed
          </button>
        );
      }
    } else if (status === 'Completed') {
      return (
        <button
          type="button"
          className="project-action-btn"
          style={{ background: '#10b981', color: 'white' }}
          onClick={() => handleUpdateProjectStatus(_id, 'Delivered')}
        >
          Accept Delivery
        </button>
      );
    }
    return null;
  };

  return (
    <div style={{ marginTop: 40, borderTop: '2px solid #f1f5f9', paddingTop: 30 }}>
      <h2>{title || (isProvider ? 'Received Requests / Orders' : 'My Orders & Projects')}</h2>

      {projectsError && <p style={{ color: '#dc2626' }}>{projectsError}</p>}

      {projectsLoading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div style={{ padding: '30px 20px', border: '1px dashed #cbd5e1', borderRadius: 18, color: '#64748b', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>No orders or project requests found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20, marginTop: 16 }}>
          {projects.map((project) => {
            const partner = isProvider ? project.customer : project.provider;
            return (
              <div key={project._id} className="service-card" style={{ borderLeft: '4px solid #3b82f6', background: '#ffffff' }}>
                <div className="project-card-header">
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: '#0f172a' }}>
                      {project.service?.title || 'Custom Service Requested'}
                    </h4>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 8 }}>
                      {isProvider ? 'Client' : 'Provider'}: <strong>{partner?.name || 'User'}</strong>
                      <span className="project-card-email"> ({partner?.email})</span>
                    </div>
                  </div>
                  <div className="project-card-meta">
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#059669' }}>${project.budget}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                      Deadline: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, fontSize: '0.9rem', color: '#475569', marginBottom: 16 }}>
                  <strong>Requirements:</strong> {project.requirements}
                </div>

                <ProjectTimeline currentStatus={project.status} />

                {!isProvider && project.status === 'Delivered' && (
                  <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                    {reviewSubmitted[project._id] ? (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: 999, padding: '6px 14px',
                        color: '#15803d', fontWeight: 600, fontSize: '0.88rem',
                      }}>
                        <span>✓</span> Review submitted
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleReviewPanel(project._id)}
                          style={{
                            padding: '7px 16px',
                            background: openReviewPanels[project._id] ? '#e0e7ff' : '#eef2ff',
                            color: '#4338ca',
                            border: '1px solid #c7d2fe',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'background 0.2s ease',
                          }}
                        >
                          {openReviewPanels[project._id] ? '▲ Hide Review Form' : '★ Leave a Review'}
                        </button>

                        {openReviewPanels[project._id] && (
                          <div style={{
                            marginTop: 12,
                            padding: '16px 18px',
                            background: '#f8fafc',
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            display: 'grid',
                            gap: 12,
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', marginBottom: 6 }}>Your Rating</div>
                              <StarPicker
                                value={reviewRatings[project._id] || 0}
                                onChange={(val) =>
                                  setReviewRatings((prev) => ({ ...prev, [project._id]: val }))
                                }
                              />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', marginBottom: 6 }}>Your Feedback</div>
                              <textarea
                                value={reviewFeedbacks[project._id] || ''}
                                onChange={(e) =>
                                  setReviewFeedbacks((prev) => ({ ...prev, [project._id]: e.target.value }))
                                }
                                placeholder="Share your experience with this provider..."
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  borderRadius: 10,
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.95rem',
                                  resize: 'vertical',
                                  boxSizing: 'border-box',
                                  fontFamily: 'inherit',
                                }}
                              />
                            </div>
                            {reviewErrors[project._id] && (
                              <p style={{ margin: 0, color: '#dc2626', fontSize: '0.88rem' }}>
                                {reviewErrors[project._id]}
                              </p>
                            )}
                            <button
                              type="button"
                              disabled={reviewSubmitting[project._id]}
                              onClick={() => handleSubmitReview(project._id)}
                              style={{
                                alignSelf: 'flex-start',
                                padding: '9px 22px',
                                background: reviewSubmitting[project._id] ? '#94a3b8' : '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: reviewSubmitting[project._id] ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s ease',
                              }}
                            >
                              {reviewSubmitting[project._id] ? 'Submitting...' : 'Submit Review'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="project-actions-row">
                  {renderProjectActions(project)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
