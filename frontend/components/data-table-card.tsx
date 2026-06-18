import { ReactNode } from 'react';

interface DataTableCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function DataTableCard({
  title,
  subtitle,
  children,
  className = '',
}: DataTableCardProps) {
  return (
    <div className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-2xl font-black text-slate-950">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
