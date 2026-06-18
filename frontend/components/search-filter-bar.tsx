
import type { ReactNode } from 'react';
import { RefreshCcw, Search } from 'lucide-react';

type SearchFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  children?: ReactNode;
  placeholder?: string;
  searchWidthClassName?: string;
  resetLabel?: string;
};

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  onReset,
  children,
  placeholder = 'Rechercher...',
  searchWidthClassName = 'lg:w-[420px] lg:flex-none',
  resetLabel = 'Réinitialiser',
}: SearchFilterBarProps) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className={`relative w-full shrink-0 ${searchWidthClassName}`}>
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={placeholder}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pl-10 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 hover:bg-white focus:border-[#06475a] focus:bg-white focus:ring-4 focus:ring-[#06475a]/10"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          {children}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 transition hover:bg-white lg:w-[170px]"
        >
          <RefreshCcw size={17} />
          {resetLabel}
        </button>
      </div>
    </div>
  );
}