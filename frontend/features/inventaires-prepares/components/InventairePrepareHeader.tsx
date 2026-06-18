import { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export function InventairePrepareHeader({
  title,
  subtitle,
  eyebrow = 'MODULE STOCK',
  actions,
}: Props) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-7 py-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.35em] text-slate-400">
            {eyebrow}
          </p>

          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            {subtitle}
          </p>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}