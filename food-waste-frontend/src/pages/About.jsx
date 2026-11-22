import { Link } from 'react-router-dom';
import { CheckCircle2, Leaf, Users, Truck, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="mx-auto max-w-5xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700">
            <Leaf className="h-3.5 w-3.5" /> About FoodBridge
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-5xl">
            Bridging the Gap Between Abundance and Need
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            Every day, edible surplus food goes to waste while local shelters struggle to source fresh meals. FoodBridge provides a fast, accountable digital logistics layer.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-8">
            <Users className="h-8 w-8 text-emerald-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">For Food Donors</h2>
            <p className="mt-2 text-sm text-slate-600">
              Caterers, restaurants, hostels, and event hosts can publish surplus meals with preparation and expiry times in under 30 seconds.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Edit or withdraw uncollected listings</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Track which NGO collected every batch</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
            <Truck className="h-8 w-8 text-emerald-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">For NGOs & Shelters</h2>
            <p className="mt-2 text-sm text-slate-600">
              Food rescue organizations get real-time visibility into nearby meals prioritized by earliest expiry so nothing spoils in transit.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> One-click atomic collection reservation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Complete historical pickup records</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Enterprise-Grade Security & Food Safety</h3>
              <p className="mt-1 text-sm text-slate-600">
                Role-based JWT authentication, BCrypt password hashing, and strict expiry validation ensure safe, accountable operations.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:mt-0 sm:shrink-0"
          >
            Create Free Account
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}