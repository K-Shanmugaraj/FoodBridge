import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search, Eye, Loader2, AlertCircle } from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { formatDateTime } from '../../utils/formatters';

export default function NgoHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    donationApi
      .getByNgo(user.id)
      .then((res) => setHistory(res.data || []))
      .catch((err) => setError(err.message || 'Failed to load collected history'))
      .finally(() => setLoading(false));
  }, [user.id]);

  const filtered = history.filter(
    (item) =>
      item.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalServings = history.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <SidebarLayout
      title="Collected Food History"
      subtitle={`Complete record of ${history.length} pickups (${totalServings} servings rescued)`}
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl">
              <CheckCircle2 className="h-4 w-4" />
              <span>{totalServings} Total Servings Distributed</span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by food, donor, location..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 bg-slate-50/70">
                  <th className="py-3.5 px-5">Food Item</th>
                  <th className="py-3.5 px-5">Donor</th>
                  <th className="py-3.5 px-5">Quantity</th>
                  <th className="py-3.5 px-5">Pickup Location</th>
                  <th className="py-3.5 px-5">Collected At</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="py-4 px-5 font-semibold text-slate-900">{item.foodName}</td>
                    <td className="py-4 px-5 text-slate-700">{item.donorName}</td>
                    <td className="py-4 px-5 font-medium text-slate-800">{item.quantity} servings</td>
                    <td className="py-4 px-5 text-slate-600">{item.pickupLocation}</td>
                    <td className="py-4 px-5 text-slate-600">
                      {item.collectedAt ? formatDateTime(item.collectedAt) : '—'}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/ngo/donations/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      {searchTerm
                        ? 'No matching records found for your search.'
                        : 'You have not collected any food donations yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}