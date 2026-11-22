import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Mail, Lock, AlertCircle, Loader2, HeartHandshake, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../utils/formatters';
import Navbar from '../components/Navbar';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DONOR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'NGO') navigate('/ngo/dashboard');
      else navigate('/donor/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Leaf className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Join FoodBridge</h1>
            <p className="mt-1 text-sm text-slate-500">Create your Donor or NGO account</p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Account Type</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[
                  { value: 'DONOR', title: 'Food Donor', desc: 'Share surplus meals', icon: Utensils },
                  { value: 'NGO', title: 'NGO / Shelter', desc: 'Collect & distribute', icon: HeartHandshake },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = form.role === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setForm({ ...form, role: opt.value })}
                      className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
                        active
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="mt-2 text-sm font-bold text-slate-900">{opt.title}</span>
                      <span className="text-xs text-slate-500">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name / Organization Name</label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Green Leaf Kitchen / Hope Foundation"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  maxLength={150}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@organization.org"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password (min 6 characters)</label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  maxLength={100}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}