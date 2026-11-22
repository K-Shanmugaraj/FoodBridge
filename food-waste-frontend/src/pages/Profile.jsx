import { useEffect, useState } from 'react';
import { User, Mail, Shield, Calendar, Loader2 } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { formatDateTime } from '../utils/formatters';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    userApi
      .getById(user.id)
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(user))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <SidebarLayout title="Account Profile" subtitle="Your verified FoodBridge identity and role details">
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{profile?.name}</h2>
              <span className="mt-1 inline-block rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                {profile?.role}
              </span>
            </div>
          </div>

          <dl className="mt-6 space-y-5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-500"><User className="h-4 w-4" /> User ID</dt>
              <dd className="font-semibold text-slate-900">#{profile?.id}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-500"><Mail className="h-4 w-4" /> Email Address</dt>
              <dd className="font-semibold text-slate-900">{profile?.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-500"><Shield className="h-4 w-4" /> Assigned Role</dt>
              <dd className="font-semibold text-emerald-700">{profile?.role}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4" /> Member Since</dt>
              <dd className="font-semibold text-slate-900">{formatDateTime(profile?.createdAt)}</dd>
            </div>
          </dl>
        </div>
      )}
    </SidebarLayout>
  );
}