import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../utils/formatters';
import Navbar from '../components/Navbar';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'NGO') navigate('/ngo/dashboard');
      else navigate('/donor/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Leaf className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to your FoodBridge account</p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}