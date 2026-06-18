'use client';

import { Archive, ArrowDownToLine, Boxes, History } from 'lucide-react';

type Props = {
  totalArticles: number;
  totalQuantite: number;
  totalMagasins: number;
  totalMouvements: number;
};

export function StockDashboardCards({
  totalArticles,
  totalQuantite,
  totalMagasins,
  totalMouvements,
}: Props) {
  const cards = [
    {
      title: 'Articles',
      value: totalArticles,
      icon: Boxes,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    {
      title: 'Quantité',
      value: totalQuantite,
      icon: Archive,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    {
      title: 'Magasins',
      value: totalMagasins,
      icon: ArrowDownToLine,
      bg: 'bg-orange-50',
      text: 'text-orange-700',
    },
    {
      title: 'Mouvements',
      value: totalMouvements,
      icon: History,
      bg: 'bg-violet-50',
      text: 'text-violet-700',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="flex items-center gap-4 rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.bg} ${card.text}`}
            >
              <Icon size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                {card.title}
              </p>

              <p className="mt-1 text-3xl font-black leading-none text-slate-900">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}