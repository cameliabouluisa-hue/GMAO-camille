'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowDownToLine,
  ArrowRight,
  Archive,
  Boxes,
  ClipboardList,
  History,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  RefreshCw,
  Send,
  ShoppingCart,
  Truck,
  Warehouse,
} from 'lucide-react';

type MenuItem = {
  title: string;
  description: string;
  href?: string;
  icon: React.ElementType;
  status: 'active' | 'soon';
  color: string;
  bg: string;
};

export default function StockMenuPage() {
  const router = useRouter();

  const mainItems: MenuItem[] = [
    {
      title: 'Stock actuel',
      description: 'Voir les quantités disponibles par article et par magasin.',
      href: '/stock',
      icon: Boxes,
      status: 'active',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      title: 'Entrées stock',
      description: 'Consulter les bons d’entrée déjà enregistrés.',
      href: '/stock/entrees',
      icon: PackagePlus,
      status: 'active',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Sortie stock',
      description: 'Créer un nouveau bon d’entrée stock.',
      href: '/stock/sorties',
      icon: ArrowDownToLine,
      status: 'active',
      color: 'text-cyan-700',
      bg: 'bg-cyan-50',
    },
    {
      title: 'Mouvements stock',
      description: 'Voir l’historique des entrées, sorties et corrections.',
      href: '/stock/mouvements',
      icon: History,
      status: 'active',
      color: 'text-violet-700',
      bg: 'bg-violet-50',
    },
  ];

  const nextItems: MenuItem[] = [
    {
      title: 'Sorties stock',
      description: 'Sortir des articles ou matériels du magasin.',
      icon: PackageMinus,
      status: 'soon',
      color: 'text-red-700',
      bg: 'bg-red-50',
    },
    {
      title: 'Réservations',
      description: 'Réserver des pièces pour une intervention.',
      icon: PackageCheck,
      status: 'soon',
      color: 'text-orange-700',
      bg: 'bg-orange-50',
    },
    {
      title: 'Demandes de transfert',
      description: 'Déplacer le stock entre plusieurs magasins.',
      icon: Truck,
      status: 'soon',
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Inventaire',
      description: 'Contrôler les quantités réelles en magasin.',
      icon: ClipboardList,
      status: 'soon',
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
    {
      title: 'Réapprovisionnement',
      description: 'Préparer les besoins d’achat ou de commande.',
      icon: ShoppingCart,
      status: 'soon',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      title: 'Expédition',
      description: 'Gérer les expéditions et livraisons sortantes.',
      icon: Send,
      status: 'soon',
      color: 'text-pink-700',
      bg: 'bg-pink-50',
    },
  ];

  function openItem(item: MenuItem) {
    if (item.status === 'soon' || !item.href) return;
    router.push(item.href);
  }

  return (
    <div className="w-full min-w-0 overflow-hidden px-6 py-8 lg:px-9">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="rounded-[30px] border border-slate-200 bg-white px-7 py-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">
                Module stock
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
                Menu stock
              </h1>

              <p className="mt-3 max-w-3xl text-lg font-medium text-slate-500">
                Accédez rapidement aux articles, entrées, mouvements,
                réservations, inventaires et opérations de stock.
              </p>
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#0f3d56] text-white shadow-sm">
              <Warehouse size={36} />
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {mainItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => openItem(item)}
                className="group rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#0f3d56]/30 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}
                  >
                    <Icon size={27} />
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-[#0f3d56] group-hover:text-white">
                    <ArrowRight size={20} />
                  </div>
                </div>

                <h2 className="mt-6 text-2xl font-black text-slate-950">
                  {item.title}
                </h2>

                <p className="mt-2 min-h-[52px] text-base font-medium leading-7 text-slate-500">
                  {item.description}
                </p>

                <div className="mt-5 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-black uppercase tracking-wide text-emerald-700">
                  Disponible
                </div>
              </button>
            );
          })}
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-7 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-950">
                Fonctions à compléter
              </h2>

              <p className="mt-1 text-base font-medium text-slate-500">
                Ces parties seront reliées progressivement quand le backend et
                les interfaces seront prêts.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black uppercase tracking-wide text-slate-500">
              <RefreshCw size={16} />
              Prochaines étapes
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
            {nextItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}
                    >
                      <Icon size={24} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900">
                          {item.title}
                        </h3>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-400">
                          Bientôt
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}