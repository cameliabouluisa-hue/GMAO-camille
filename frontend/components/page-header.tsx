import { ReactNode } from 'react';
import { Button } from '@/components/button';
import { Plus, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  module: string;
  title: string;
  description?: string;
  actions?: {
    type: 'button' | 'link';
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary';
    loading?: boolean;
    disabled?: boolean;
  }[];
}

export function PageHeader({
  module,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">
          {module}
        </p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">{title}</h1>
        {description && (
          <p className="mt-1 text-base text-slate-500">{description}</p>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {actions.map((action, index) => {
            const buttonContent = (
              <>
                {action.icon && action.icon}
                <span>{action.label}</span>
              </>
            );

            if (action.type === 'link') {
              return (
                <Link
                  key={index}
                  href={action.href || '#'}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold shadow-sm transition ${
                    action.variant === 'primary'
                      ? 'bg-[#0b3d4f] text-white hover:bg-[#082f3d]'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {buttonContent}
                </Link>
              );
            }

            return (
              <button
                key={index}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold shadow-sm transition disabled:opacity-60 ${
                  action.variant === 'primary'
                    ? 'bg-[#0b3d4f] text-white hover:bg-[#082f3d]'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {action.loading ? (
                  <RefreshCcw size={18} className="animate-spin" />
                ) : (
                  buttonContent
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
