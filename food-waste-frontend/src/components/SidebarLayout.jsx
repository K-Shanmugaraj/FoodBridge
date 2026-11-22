import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  PlusCircle,
  Package,
  History,
  UserCircle,
  Search,
  Users,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_MENUS = {
  DONOR: [
    { to: '/donor/dashboard', label: 'Donor Dashboard', icon: LayoutDashboard },
    { to: '/donor/create', label: 'Create Food Donation', icon: PlusCircle },
    { to: '/donor/donations', label: 'My Donations', icon: Package },
    { to: '/donor/history', label: 'Donation History', icon: History },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
  NGO: [
    { to: '/ngo/dashboard', label: 'NGO Dashboard', icon: LayoutDashboard },
    { to: '/ngo/available', label: 'Available Food Donations', icon: Search },
    { to: '/ngo/history', label: 'Collected Food History', icon: History },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/donations', label: 'Manage Donations', icon: ShieldCheck },
    { to: '/admin/statistics', label: 'Platform Statistics', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
};

export default function SidebarLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = ROLE_MENUS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
    }`;

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-6">
      <div>
        <Link to="/" className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900">
              Food<span className="text-emerald-600">Bridge</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
              {user?.role} Portal
            </span>
          </div>
        </Link>

        <nav className="mt-8 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={navLinkClass}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <Home className="h-4 w-4" /> Public Home
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white shadow-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
            </div>
          </div>

          <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 sm:inline-block">
            {user?.role}
          </span>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}