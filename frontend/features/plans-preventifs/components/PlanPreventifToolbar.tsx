

import { Plus, RefreshCcw } from 'lucide-react';

type Props = {
  onRefresh: () => void;
  onCreate: () => void;
};

export default function PlanPreventifToolbar({ onRefresh, onCreate }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold transition hover:bg-slate-50"
        style={{
          borderColor: '#E6EDF2',
          backgroundColor: '#FFFFFF',
          color: '#183B56',
        }}
      >
        <RefreshCcw size={16} />
        Actualiser
      </button>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold text-white transition"
        style={{
          backgroundColor: '#0F5F78',
        }}
      >
        <Plus size={16} />
        Nouveau plan
      </button>
    </div>
  );
}