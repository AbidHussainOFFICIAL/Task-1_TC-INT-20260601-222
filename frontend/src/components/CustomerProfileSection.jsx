import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CustomerProfileSection() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = { name: name.trim(), email: email.trim() };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    setSubmitting(true);
    try {
      const res = await api.patch('/api/auth/account', payload);
      updateUser(res.data.user);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Profile updated successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="profile-management" className="profile-management-section">
      <h2>Profile Management</h2>
      <p className="profile-management-desc">Update your account name, email, or password.</p>

      <form onSubmit={handleSubmit} className="auth-form profile-management-form">
        <label>
          Full Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <div className="profile-password-section">
          <p className="profile-password-heading">Change Password (optional)</p>
          <label>
            Current Password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              minLength={8}
              placeholder="Required only if changing password"
            />
          </label>
          <label>
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              placeholder="Leave blank to keep current password"
            />
          </label>
        </div>

        {error && <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '12px 20px',
            background: submitting ? '#94a3b8' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            marginTop: 0,
            alignSelf: 'flex-start',
          }}
        >
          {submitting ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
