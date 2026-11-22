import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { extractErrorMessage, toInputDateTime } from '../../utils/formatters';

export default function CreateDonation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const defaultExpiry = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const [form, setForm] = useState({
    foodName: '',
    quantity: 10,
    preparedTime: toInputDateTime(now),
    expiryTime: toInputDateTime(defaultExpiry),
    pickupLocation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await donationApi.create({
        foodName: form.foodName,
        quantity: Number(form.quantity),
        preparedTime: form.preparedTime.length === 16 ? `${form.preparedTime}:00` : form.preparedTime,
        expiryTime: form.expiryTime.length === 16 ? `${form.expiryTime}:00` : form.expiryTime,
        pickupLocation: form.pickupLocation,
        donorId: user.id,
      });
      navigate('/donor/donations');
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create donation'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title="Create Food Donation"
      subtitle="Publish surplus food details for nearby NGOs to claim"
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">Food Name / Description</label>
            <input
              type="text"
              required
              maxLength={150}
              value={form.foodName}
              onChange={(e) => setForm({ ...form, foodName: e.target.value })}
              placeholder="e.g., Vegetable Biryani & Raita Packs"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Quantity (Number of Servings)</label>
            <input
              type="number"
              required
              min={1}
              max={100000}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Prepared Time</label>
              <input
                type="datetime-local"
                required
                value={form.preparedTime}
                onChange={(e) => setForm({ ...form, preparedTime: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Safe Consumption Expiry</label>
              <input
                type="datetime-local"
                required
                value={form.expiryTime}
                onChange={(e) => setForm({ ...form, expiryTime: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Pickup Location / Full Address</label>
            <input
              type="text"
              required
              maxLength={255}
              value={form.pickupLocation}
              onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
              placeholder="e.g., 42 Anna Salai, Teynampet, Chennai"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/donor/donations')}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {loading ? 'Publishing...' : 'Publish Donation'}
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}