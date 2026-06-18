import { ReactNode } from 'react';
import { RefreshCcw } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Chargement...' }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef7fa] text-[#0b3d4f]">
        <RefreshCcw className="h-7 w-7 animate-spin" />
      </div>

      <p className="mt-4 text-sm font-bold text-slate-600">{message}</p>
    </div>
  );
}
