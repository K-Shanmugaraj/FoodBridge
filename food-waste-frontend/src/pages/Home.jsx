import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Users, Heart, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HIGHLIGHTS = [
  {
    icon: Leaf,
    title: 'Reduce Food Waste',
    desc: 'Give surplus food a second chance.',
  },
  {
    icon: Users,
    title: 'Support Communities',
    desc: 'Help NGOs feed those in need.',
  },
  {
    icon: Heart,
    title: 'Create Impact',
    desc: 'Small actions make a big difference.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & Safe',
    desc: 'Verified NGOs and secure platform.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-[#f2fbf6] to-teal-50/70 border-b border-emerald-100/80">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16 grid items-center gap-10 lg:grid-cols-12">
          {/* Left Column Text Content */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-100/70 px-3.5 py-1.5 text-xs font-bold tracking-wider text-emerald-800 uppercase">
              <Leaf className="h-3.5 w-3.5 text-emerald-700" />
              <span>FOODBRIDGE · FOOD RESCUE PLATFORM</span>
            </div>

            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl leading-[1.08]">
              Good Food.
              <span className="block text-emerald-600">Greater Good.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Every meal deserves a purpose. Connect surplus food with NGOs and
              turn what&apos;s left over into someone&apos;s next meal.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* Donate or Collect Food Button */}
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                <Leaf className="h-4 w-4" />
                <span>Donate or Collect Food</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* How FoodBridge Works Button */}
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:text-emerald-700"
              >
                How FoodBridge Works
              </Link>
            </div>
          </div>

          {/* Right Column Illustration */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-xl overflow-hidden rounded-3xl">
              <img
                src="/hero-rescue.png"
                alt="FoodBridge volunteer delivering surplus food box to an NGO"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Feature Strip (Added below hero to match screenshot) */}
      <section className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}