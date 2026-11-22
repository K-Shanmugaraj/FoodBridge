import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  CheckCircle2,
  Utensils,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([axiosClient.get('/users'), axiosClient.get('/donations/all')])
      .then(([usersRes, donationsRes]) => {
        setUsers(usersRes.data || []);
        setDonations(donationsRes.data || []);
      })
      .catch((err) => setError(err.message || 'Failed to load platform metrics'))
      .finally(() => setLoading(false));
  }, []);

  const donorsCount = users.filter((u) => u.role === 'DONOR').length;
  const ngosCount = users.filter((u) => u.role === 'NGO').length;
  const availableCount = donations.filter((d) => d.status === 'AVAILABLE').length;
  const collectedDonations = donations.filter((d) => d.status === 'COLLECTED');
  const mealsRescued = collectedDonations.reduce((sum, d) => sum + (d.quantity || 0), 0);
  const rescueRate = donations.length
    ? Math.round((collectedDonations.length / donations.length) * 100)
    : 0;

  return (
    <SidebarLayout
      title={`Admin Control Center • ${user?.name || 'Administrator'}`}
      subtitle="Platform-wide oversight of users, food batches, and rescue impact"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={users.length}
              subtitle={`${donorsCount} Donors • ${ngosCount} NGOs`}
              icon={Users}
              accent="emerald"
            />
            <StatCard
              title="Total Donations"
              value={donations.length}
              subtitle={`${availableCount} Available Now`}
              icon={Package}
              accent="amber"
            />
            <StatCard
              title="Completed Pickups"
              value={collectedDonations.length}
              subtitle={`${rescueRate}% Rescue Conversion`}
              icon={CheckCircle2}
              accent="teal"
            />
            <StatCard
              title="Meals Rescued"
              value={mealsRescued}
              subtitle="Total servings saved"
              icon={Utensils}
              accent="emerald"
            />
          </div>

          {/* Two-Column Overview */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Latest Donations */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Latest Donations</h2>
                <Link
                  to="/admin/donations"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  Manage all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {donations.slice(0, 5).map((d) => (
                  <div key={d.id} className="px-6 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{d.foodName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Donor: {d.donorName} • {d.quantity} servings
                      </p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
                {donations.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-slate-500">
                    No donations posted yet.
                  </p>
                )}
              </div>
            </div>

            {/* Recently Registered Users */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recently Joined Users</h2>
                <Link
                  to="/admin/users"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  Manage users <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {users.slice(-5).reverse().map((u) => (
                  <div key={u.id} className="px-6 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{u.email}</p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 shrink-0">
                      {u.role}
                    </span>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-slate-500">
                    No registered users found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}