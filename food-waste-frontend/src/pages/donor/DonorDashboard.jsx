import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle2, Clock, Utensils, PlusCircle, Loader2 } from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { formatDateTime } from '../../utils/formatters';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationApi
      .getByDonor(user.id)
      .then((res) => setDonations(res.data))
      .finally(() => setLoading(false));
  }, [user.id]);

  const totalServings = donations.reduce((sum, d) => sum + (d.quantity || 0), 0);
  const availableCount = donations.filter((d) => d.status === 'AVAILABLE').length;
  const collectedCount = donations.filter((d) => d.status === 'COLLECTED').length;

  return (
    <SidebarLayout
      title={`Welcome, ${user.name}`}
      subtitle="Monitor your food donations and community impact"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Donations" value={donations.length} icon={Package} accent="emerald" />
            <StatCard title="Meals Contributed" value={totalServings} subtitle="Total servings listed" icon={Utensils} accent="teal" />
            <StatCard title="Active Listings" value={availableCount} subtitle="Awaiting NGO pickup" icon={Clock} accent="amber" />
            <StatCard title="Collected" value={collectedCount} subtitle="Successfully rescued" icon={CheckCircle2} accent="sky" />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Donations</h2>
            <Link
              to="/donor/create"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700"
            >
              <PlusCircle className="h-4 w-4" /> New Donation
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {donations.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-slate-500">You haven&apos;t listed any food donations yet.</p>
                <Link to="/donor/create" className="mt-3 inline-block text-sm font-semibold text-emerald-600">
                  Create your first donation →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Food Item</th>
                      <th className="px-6 py-3.5">Quantity</th>
                      <th className="px-6 py-3.5">Expiry</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Collected By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donations.slice(0, 6).map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-semibold text-slate-900">{d.foodName}</td>
                        <td className="px-6 py-4">{d.quantity} servings</td>
                        <td className="px-6 py-4 text-slate-600">{formatDateTime(d.expiryTime)}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={d.status} expiryTime={d.expiryTime} />
                        </td>
                        <td className="px-6 py-4 text-slate-600">{d.collectedByName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </SidebarLayout>
  );
}