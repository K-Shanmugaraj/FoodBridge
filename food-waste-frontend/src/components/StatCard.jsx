export default function StatCard({ title, value, subtitle, icon: Icon, accent = 'emerald' }) {
    const accents = {
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      teal: 'bg-teal-50 text-teal-600 border-teal-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      sky: 'bg-sky-50 text-sky-600 border-sky-100',
    };
  
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${accents[accent] || accents.emerald}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    );
  }