import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900">FoodBridge</span>
          <span className="text-xs text-slate-400">• Zero Food Waste Network</span>
        </div>

        <div className="flex gap-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <Link to="/about" className="hover:text-emerald-600">About</Link>
          <Link to="/register" className="hover:text-emerald-600">Join as Donor / NGO</Link>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} FoodBridge Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}