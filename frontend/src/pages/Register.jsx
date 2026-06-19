import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await api.post('/api/auth/register', { name, email, password, role });
      login(response.data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-7 shadow-xl">
      <h1 className="mb-5 text-3xl font-bold text-slate-900">Register</h1>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-900">
          Full name
          <input
            className="rounded-xl border border-slate-300 px-3.5 py-3 text-base"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-900">
          Email
          <input
            className="rounded-xl border border-slate-300 px-3.5 py-3 text-base"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-900">
          Password
          <input
            className="rounded-xl border border-slate-300 px-3.5 py-3 text-base"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-900">
          Role
          <select
            className="rounded-xl border border-slate-300 px-3.5 py-3 text-base"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Customer">Customer</option>
            <option value="Service Provider">Service Provider</option>
          </select>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          className="rounded-xl bg-blue-500 px-4 py-3 text-base font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="mt-4 text-center text-slate-600">
        Already have an account? <Link className="text-blue-500 no-underline" to="/login">Login</Link>
      </p>
    </div>
  );
}
