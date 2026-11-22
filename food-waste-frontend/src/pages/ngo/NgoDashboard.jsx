import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2, Utensils, Clock, Loader2 } from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { getTimeRemaining } from '../../utils/formatters';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [collected, setCollected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([donationApi.getAvailable(), donationApi.getByNgo(user.id)])
      .then(([availRes, collRes]) => {
        setAvailable(availRes.data);
        setCollected(collRes.data);
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  const rescuedMeals = collected.reduce((sum, d) => sum + (d.quantity || 0), 0);

  return (
    <SidebarLayout
      title={`Welcome, ${user.name}`}
      subtitle="Discover available food donations and track rescued meals"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-3">
            <StatCard title="Available Pickups" value={available.length} subtitle="Ready to claim now" icon={Search} accent="amber" />
            <StatCard title="Pickups Completed" value={collected.length} subtitle="By your NGO" icon={CheckCircle2} accent="emerald" />
            <StatCard title="Total Meals Rescued" value={rescuedMeals} subtitle="Servings distributed" icon={Utensils} accent="teal" />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Urgent Available Donations</h2>
            <Link to="/ngo/available" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              Browse all ({available.length}) →
            </Link>
          </div>

          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {available.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {item.quantity} servings
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                    <Clock className="h-3.5 w-3.5" /> {getTimeRemaining(item.expiryTime)}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.foodName}</h3>
                <p className="mt-1 text-xs text-slate-500">Donor: {item.donorName}</p>
                <p className="mt-2 truncate text-xs text-slate-600">{item.pickupLocation}</p>
                <Link
                  to={`/ngo/donations/${item.id}`}
                  className="mt-5 block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Inspect & Collect
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </SidebarLayout>
  );
}