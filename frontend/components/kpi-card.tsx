import { ReactNode } from 'react';

type KpiTone = 'blue' | 'orange' | 'violet' | 'emerald' | 'red';

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone?: KpiTone;
  subtitle?: string;
}

export function KpiCard({
  icon,
  label,
  value,
  tone = 'blue',
  subtitle,
}: KpiCardProps) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
