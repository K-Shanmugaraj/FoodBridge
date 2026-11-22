import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, PlusCircle, Loader2, AlertCircle, X } from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { extractErrorMessage, formatDateTime } from '../../utils/formatters';

export default function MyDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    donationApi
      .getByDonor(user.id)
      .then((res) => setDonations(res.data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this uncollected donation?')) return;
    try {
      await donationApi.remove(id, user.id);
      setDonations((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const openEdit = (d) => {
    setEditing({
      id: d.id,
      foodName: d.foodName,
      quantity: d.quantity,
      preparedTime: d.preparedTime.slice(0, 16),
      expiryTime: d.expiryTime.slice(0, 16),
      pickupLocation: d.pickupLocation,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await donationApi.update(editing.id, {
        foodName: editing.foodName,
        quantity: Number(editing.quantity),
        preparedTime: `${editing.preparedTime}:00`,
        expiryTime: `${editing.expiryTime}:00`,
        pickupLocation: editing.pickupLocation,
        donorId: user.id,
      });
      setEditing(null);
      loadData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const activeDonations = donations.filter((d) => d.status === 'AVAILABLE');

  return (
    <SidebarLayout
      title="My Donations"
      subtitle="Manage your active food listings awaiting pickup"
    >
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{activeDonations.length}</span> active donations
        </p>
        <Link
          to="/donor/create"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4" /> Add Donation
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : activeDonations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">No active donations right now.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {activeDonations.map((d) => (
            <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{d.foodName}</h3>
                  <p className="mt-1 text-sm font-medium text-emerald-700">{d.quantity} servings</p>
                </div>
                <StatusBadge status={d.status} expiryTime={d.expiryTime} />
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <p><span className="font-semibold text-slate-700">Pickup:</span> {d.pickupLocation}</p>
                <p><span className="font-semibold text-slate-700">Prepared:</span> {formatDateTime(d.preparedTime)}</p>
                <p><span className="font-semibold text-slate-700">Expires:</span> {formatDateTime(d.expiryTime)}</p>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => openEdit(d)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Update Donation</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Food Name</label>
                <input
                  type="text"
                  required
                  value={editing.foodName}
                  onChange={(e) => setEditing({ ...editing, foodName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editing.quantity}
                  onChange={(e) => setEditing({ ...editing, quantity: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Prepared Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editing.preparedTime}
                    onChange={(e) => setEditing({ ...editing, preparedTime: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Expiry Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editing.expiryTime}
                    onChange={(e) => setEditing({ ...editing, expiryTime: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Pickup Location</label>
                <input
                  type="text"
                  required
                  value={editing.pickupLocation}
                  onChange={(e) => setEditing({ ...editing, pickupLocation: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}