import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const desktopNavClass = ({ isActive }) =>
    `inline-flex h-16 items-center border-b-2 text-sm font-medium transition ${
      isActive
        ? 'border-emerald-600 font-semibold text-emerald-700'
        : 'border-transparent text-slate-600 hover:text-emerald-600'
    }`;

  const mobileNavClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? 'font-semibold text-emerald-600' : 'text-slate-600 hover:text-emerald-600'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Food<span className="text-emerald-600">Bridge</span>
          </span>
        </Link>

        <nav className="hidden h-full items-center gap-8 md:flex">
          <NavLink to="/" className={desktopNavClass} end>
            Home
          </NavLink>
          <NavLink to="/about" className={desktopNavClass}>
            About FoodBridge
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={desktopNavClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                {user?.name} ({user?.role})
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-3">
            <NavLink to="/" onClick={() => setOpen(false)} className={mobileNavClass} end>
              Home
            </NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)} className={mobileNavClass}>
              About FoodBridge
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" onClick={() => setOpen(false)} className={mobileNavClass}>
                  Dashboard
                </NavLink>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 text-left text-sm font-semibold text-rose-600"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-sm font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl bg-emerald-600 py-2 text-center text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}