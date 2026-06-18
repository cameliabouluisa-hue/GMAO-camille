import { ReactNode } from 'react';

type BadgeTone = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';

interface StatusBadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({
  children,
  tone = 'gray',
  size = 'md',
}: StatusBadgeProps) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    orange: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100',
    red: 'bg-red-50 text-red-700 ring-1 ring-red-100',
    purple: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
    gray: 'bg-slate-100 text-slate-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <span
      className={`inline-flex max-w-[210px] items-center rounded-full font-black ${toneClasses[tone]} ${sizeClasses[size]}`}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}
