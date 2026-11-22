import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Utensils,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { formatDateTime, getTimeRemaining } from '../../utils/formatters';

export default function DonationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    donationApi
      .getById(id)
      .then((res) => setDonation(res.data))
      .catch((err) => setError(err.message || 'Failed to load donation details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCollect = async () => {
    setError('');
    setCollecting(true);
    try {
      await donationApi.collect(id, { ngoId: user.id });
      navigate('/ngo/history');
    } catch (err) {
      setError(err.message || 'Unable to claim this donation');
    } finally {
      setCollecting(false);
    }
  };

  return (
    <SidebarLayout
      title="Donation Batch Details"
      subtitle="Inspect food preparation, expiry window, and pickup location before claiming"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : !donation ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Donation not found.'}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Listings
          </button>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{donation.foodName}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <User className="h-4 w-4 text-emerald-600" />
                Donated by <strong className="text-slate-700">{donation.donorName}</strong>
              </p>
            </div>
            <StatusBadge status={donation.status} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-slate-50 p-5 text-sm">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase text-slate-500">
                <Utensils className="h-3.5 w-3.5 text-emerald-600" /> Quantity
              </span>
              <p className="text-base font-bold text-slate-900">{donation.quantity} servings</p>
            </div>

            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase text-slate-500">
                <Clock className="h-3.5 w-3.5 text-amber-600" /> Time Remaining
              </span>
              <p className="text-base font-bold text-amber-700">
                {donation.status === 'AVAILABLE'
                  ? getTimeRemaining(donation.expiryTime)
                  : 'Already Collected'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium uppercase text-slate-500">Prepared At</span>
              <p className="font-semibold text-slate-800">
                {formatDateTime(donation.preparedTime)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium uppercase text-slate-500">Expires At</span>
              <p className="font-semibold text-slate-800">
                {formatDateTime(donation.expiryTime)}
              </p>
            </div>

            <div className="sm:col-span-2 space-y-1 pt-2 border-t border-slate-200/70">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Pickup Location
              </span>
              <p className="font-semibold text-slate-900">{donation.pickupLocation}</p>
            </div>

            {donation.status === 'COLLECTED' && (
              <div className="sm:col-span-2 space-y-1 pt-2 border-t border-slate-200/70">
                <span className="text-xs font-medium uppercase text-slate-500">Collected By</span>
                <p className="font-semibold text-emerald-700">
                  {donation.collectedByName} • {formatDateTime(donation.collectedAt)}
                </p>
              </div>
            )}
          </div>

          {donation.status === 'AVAILABLE' && (
            <button
              onClick={handleCollect}
              disabled={collecting}
              className="w-full rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
            >
              {collecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {collecting ? 'Confirming Pickup...' : 'Confirm & Collect Donation'}
            </button>
          )}
        </div>
      )}
    </SidebarLayout>
  );
}