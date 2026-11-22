import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { formatDateTime } from '../../utils/formatters';

export default function DonorHistory() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationApi
      .getByDonor(user.id)
      .then((res) => setDonations(res.data))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <SidebarLayout
      title="Donation History"
      subtitle="Complete audit log of all food donations you have created"
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Food Name</th>
                  <th className="px-6 py-3.5">Servings</th>
                  <th className="px-6 py-3.5">Pickup Location</th>
                  <th className="px-6 py-3.5">Created On</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Collected By</th>
                  <th className="px-6 py-3.5">Collected At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-semibold text-slate-900">{d.foodName}</td>
                    <td className="px-6 py-4">{d.quantity}</td>
                    <td className="px-6 py-4 text-slate-600">{d.pickupLocation}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDateTime(d.createdAt)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={d.status} expiryTime={d.expiryTime} />
                    </td>
                    <td className="px-6 py-4 text-slate-700">{d.collectedByName || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDateTime(d.collectedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}