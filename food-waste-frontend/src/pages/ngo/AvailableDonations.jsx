import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { extractErrorMessage, getTimeRemaining, isExpired } from '../../utils/formatters';

export default function AvailableDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadAvailable = () => {
    setLoading(true);
    donationApi
      .getAvailable()
      .then((res) => setDonations(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAvailable();
  }, []);

  const handleQuickCollect = async (id) => {
    setCollectingId(id);
    setMessage({ type: '', text: '' });
    try {
      await donationApi.collect(id, user.id);
      setMessage({ type: 'success', text: 'Donation claimed! Added to your collected history.' });
      setDonations((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setMessage({ type: 'error', text: extractErrorMessage(err) });
    } finally {
      setCollectingId(null);
    }
  };

  const filtered = donations.filter(
    (d) =>
      d.foodName.toLowerCase().includes(query.toLowerCase()) ||
      d.pickupLocation.toLowerCase().includes(query.toLowerCase()) ||
      d.donorName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SidebarLayout
      title="Available Food Donations"
      subtitle="Sorted by earliest expiry so fresh meals reach communities first"
    >
      {message.text && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-xl border p-4 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by food, donor, or pickup area..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          No available donations match your search right now.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => {
            const expired = isExpired(d.expiryTime);
            return (
              <div key={d.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {d.quantity} Servings
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${expired ? 'text-rose-600' : 'text-amber-600'}`}>
                      <Clock className="h-3.5 w-3.5" />
                      {getTimeRemaining(d.expiryTime)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">{d.foodName}</h3>
                  <p className="mt-1 text-xs text-slate-500">Donated by <span className="font-medium text-slate-700">{d.donorName}</span></p>

                  <div className="mt-4 flex items-start gap-2 text-xs text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{d.pickupLocation}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/ngo/donations/${d.id}`}
                    className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Details
                  </Link>
                  <button
                    disabled={expired || collectingId === d.id}
                    onClick={() => handleQuickCollect(d.id)}
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {collectingId === d.id ? 'Claiming...' : 'Collect Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SidebarLayout>
  );
}