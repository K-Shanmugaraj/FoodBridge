import { useEffect, useState } from 'react';
import { Trash2, Search, Loader2, AlertCircle } from 'lucide-react';
import SidebarLayout from '../../components/SidebarLayout';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { formatDateTime } from '../../utils/formatters';

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get('/users')
      .then((res) => setUsers(res.data || []))
      .catch((err) => setError(err.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Permanently remove user "${name}"?`)) return;
    setError('');
    try {
      await axiosClient.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <SidebarLayout
      title="Manage Users"
      subtitle="Audit and moderate all registered Donors, NGOs, and Administrators"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Role Filter & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'DONOR', 'NGO', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    roleFilter === role
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or email..."
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
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Name / Organization</th>
                  <th className="py-3.5 px-5">Email</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Joined</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-4 px-5 text-slate-500">#{u.id}</td>
                    <td className="py-4 px-5 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-4 px-5 text-slate-600">{u.email}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'NGO'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500">
                      {u.createdAt ? formatDateTime(u.createdAt) : '—'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      {u.role !== 'ADMIN' && u.id !== currentUser?.id ? (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No matching users found.
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