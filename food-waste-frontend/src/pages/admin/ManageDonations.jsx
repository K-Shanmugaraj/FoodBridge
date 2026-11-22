import { useEffect, useState } from 'react';
import { Trash2, Search, Loader2, AlertCircle } from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import axiosClient from '../../api/axiosClient';
import { formatDateTime } from '../../utils/formatters';

export default function ManageDonations() {
  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get('/donations/all')
      .then((res) => setDonations(res.data || []))
      .catch((err) => setError(err.message || 'Failed to load donations'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, foodName) => {
    if (!window.confirm(`Delete donation "${foodName}"?`)) return;
    setError('');
    try {
      await axiosClient.delete(`/donations/admin/${id}`);
      setDonations((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete donation');
    }
  };

  const filtered = donations.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesSearch =
      d.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.collectedByName &&
        d.collectedByName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <SidebarLayout
      title="Manage Donations"
      subtitle="Moderate all available and collected food batches across the platform"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Filter & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'AVAILABLE', 'COLLECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    statusFilter === status
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search food, donor, NGO..."
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
                  <th className="py-3.5 px-5">Qty</th>
                  <th className="py-3.5 px-5">Expiry Time</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Collected By</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60">
                    <td className="py-4 px-5 font-semibold text-slate-900">{d.foodName}</td>
                    <td className="py-4 px-5 text-slate-700">{d.donorName}</td>
                    <td className="py-4 px-5 font-medium">{d.quantity}</td>
                    <td className="py-4 px-5 text-slate-600">{formatDateTime(d.expiryTime)}</td>
                    <td className="py-4 px-5">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-4 px-5 text-slate-600">{d.collectedByName || '—'}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDelete(d.id, d.foodName)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Donation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No matching donations found.
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