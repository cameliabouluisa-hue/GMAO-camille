import { ReactNode } from 'react';

interface DetailHeroProps {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  metadata?: Array<{
    label: string;
    value: ReactNode;
  }>;
  actions?: ReactNode;
}

export function DetailHero({
  title,
  subtitle,
  status,
  metadata,
  actions,
}: DetailHeroProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#0b3d4f] to-[#06475a] px-8 py-10 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
            Détail
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-lg text-white/80">{subtitle}</p>
          )}

          {metadata && metadata.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              {metadata.map((item, index) => (
                <div key={index}>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {(status || actions) && (
          <div className="flex flex-col gap-3">
            {status && <div>{status}</div>}
            {actions && <div className="flex flex-col gap-2">{actions}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
