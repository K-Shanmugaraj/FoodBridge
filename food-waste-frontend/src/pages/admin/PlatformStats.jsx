import { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Utensils,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import axiosClient from '../../api/axiosClient';

export default function PlatformStats() {
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
      .catch((err) => setError(err.message || 'Failed to load statistics'))
      .finally(() => setLoading(false));
  }, []);

  const donors = users.filter((u) => u.role === 'DONOR');
  const ngos = users.filter((u) => u.role === 'NGO');
  const admins = users.filter((u) => u.role === 'ADMIN');

  const available = donations.filter((d) => d.status === 'AVAILABLE');
  const collected = donations.filter((d) => d.status === 'COLLECTED');

  const totalServingsPosted = donations.reduce((s, d) => s + (d.quantity || 0), 0);
  const totalServingsRescued = collected.reduce((s, d) => s + (d.quantity || 0), 0);
  const rescuePercentage = donations.length
    ? Math.round((collected.length / donations.length) * 100)
    : 0;

  const donorLeaderboard = Object.values(
    donations.reduce((acc, d) => {
      if (!acc[d.donorId]) {
        acc[d.donorId] = { name: d.donorName, batches: 0, servings: 0 };
      }
      acc[d.donorId].batches += 1;
      acc[d.donorId].servings += d.quantity || 0;
      return acc;
    }, {})
  )
    .sort((a, b) => b.servings - a.servings)
    .slice(0, 5);

  const ngoLeaderboard = Object.values(
    collected.reduce((acc, d) => {
      if (!d.collectedById) return acc;
      if (!acc[d.collectedById]) {
        acc[d.collectedById] = { name: d.collectedByName, pickups: 0, servings: 0 };
      }
      acc[d.collectedById].pickups += 1;
      acc[d.collectedById].servings += d.quantity || 0;
      return acc;
    }, {})
  )
    .sort((a, b) => b.servings - a.servings)
    .slice(0, 5);

  return (
    <SidebarLayout
      title="Platform Analytics & Statistics"
      subtitle="Detailed breakdown of food redistribution efficiency and top contributors"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Breakdown Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Conversion Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" /> Donation Conversion
                </h2>
                <span className="text-sm font-bold text-emerald-700">
                  {rescuePercentage}% Rescued
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-3.5 rounded-full transition-all"
                  style={{ width: `${rescuePercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-500">Total Posted</p>
                  <p className="text-lg font-extrabold text-slate-900">{donations.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50">
                  <p className="text-xs text-amber-700">Available</p>
                  <p className="text-lg font-extrabold text-amber-800">{available.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <p className="text-xs text-emerald-700">Collected</p>
                  <p className="text-lg font-extrabold text-emerald-800">{collected.length}</p>
                </div>
              </div>
            </div>

            {/* Community & Meal Volume */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" /> Community & Meal Volume
              </h2>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-emerald-50/70">
                  <p className="text-xs text-slate-500">Donors</p>
                  <p className="text-lg font-extrabold text-slate-900">{donors.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-teal-50/70">
                  <p className="text-xs text-slate-500">NGOs</p>
                  <p className="text-lg font-extrabold text-slate-900">{ngos.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100">
                  <p className="text-xs text-slate-500">Admins</p>
                  <p className="text-lg font-extrabold text-slate-900">{admins.length}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Utensils className="h-5 w-5" />
                  <span className="text-sm font-medium">Servings Rescued / Posted</span>
                </div>
                <span className="text-lg font-extrabold">
                  {totalServingsRescued} / {totalServingsPosted}
                </span>
              </div>
            </div>
          </div>

          {/* Leaderboards */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Top Food Donors</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {donorLeaderboard.map((d, idx) => (
                  <div key={d.name} className="px-6 py-3.5 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-emerald-600 mr-2">#{idx + 1}</span>
                      <span className="font-semibold text-slate-900">{d.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({d.batches} batches)</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.servings} servings</span>
                  </div>
                ))}
                {donorLeaderboard.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-slate-500">No donor data yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Top Collecting NGOs</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {ngoLeaderboard.map((n, idx) => (
                  <div key={n.name} className="px-6 py-3.5 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-emerald-600 mr-2">#{idx + 1}</span>
                      <span className="font-semibold text-slate-900">{n.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({n.pickups} pickups)</span>
                    </div>
                    <span className="font-bold text-slate-800">{n.servings} servings</span>
                  </div>
                ))}
                {ngoLeaderboard.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-slate-500">No NGO pickups yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}