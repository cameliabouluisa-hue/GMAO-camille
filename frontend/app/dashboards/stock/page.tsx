'use client';

import Link from 'next/link';
import {
  Package,
  TrendingDown,
  TrendingUp,
  Building2,
  BarChart3,
  Layers,
  ArrowRightLeft,
  ClipboardList,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { SectionCard } from '@/components/section-card';

export default function StockDashboardPage() {
  // Données temporaires — à remplacer plus tard par l’API réelle
  const stockStats = {
    totalArticles: 16,
    totalEntrees: 12,
    totalSorties: 12,
    totalMouvements: 24,
    totalInventaires: 3,
    totalMagasins: 4,
    inventairesPrepares: 2,
  };

  const modules = [
    { label: 'Articles', href: '/articles', icon: Package },
    { label: 'Entrées', href: '/stock/entrees', icon: TrendingUp },
    { label: 'Sorties', href: '/stock/sorties', icon: TrendingDown },
    { label: 'Mouvements', href: '/stock/mouvements', icon: ArrowRightLeft },
    { label: 'Inventaire', href: '/stock/inventaire', icon: BarChart3 },
    { label: 'Inventaires préparés', href: '/stock/inventaires-prepares', icon: Layers },
    { label: 'Magasins', href: '/magasins', icon: Building2 },
  ];

  const operations = [
    {
      label: 'Entrées stock',
      value: stockStats.totalEntrees,
      description: 'Bons d’entrée enregistrés',
      icon: TrendingUp,
      href: '/stock/entrees',
      tone: 'emerald',
    },
    {
      label: 'Sorties stock',
      value: stockStats.totalSorties,
      description: 'Bons de sortie enregistrés',
      icon: TrendingDown,
      href: '/stock/sorties',
      tone: 'blue',
    },
    {
      label: 'Mouvements',
      value: stockStats.totalMouvements,
      description: 'Traçabilité des flux',
      icon: ArrowRightLeft,
      href: '/stock/mouvements',
      tone: 'violet',
    },
    {
      label: 'Inventaires préparés',
      value: stockStats.inventairesPrepares,
      description: 'Inventaires en préparation',
      icon: ClipboardList,
      href: '/stock/inventaires-prepares',
      tone: 'orange',
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Tableaux de bord"
          title="Stock"
          description="Vue d’ensemble des articles, magasins, entrées, sorties et mouvements de stock."
        />

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <KpiCard
            icon={<Package size={20} />}
            label="Articles"
            value={stockStats.totalArticles}
            tone="blue"
            subtitle="Références enregistrées"
          />

          <KpiCard
            icon={<TrendingUp size={20} />}
            label="Entrées"
            value={stockStats.totalEntrees}
            tone="emerald"
            subtitle="Bons d’entrée"
          />

          <KpiCard
            icon={<TrendingDown size={20} />}
            label="Sorties"
            value={stockStats.totalSorties}
            tone="orange"
            subtitle="Bons de sortie"
          />

          <KpiCard
            icon={<Building2 size={20} />}
            label="Magasins"
            value={stockStats.totalMagasins}
            tone="violet"
            subtitle="Espaces de stockage"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            icon={<ArrowRightLeft size={20} />}
            label="Mouvements"
            value={stockStats.totalMouvements}
            tone="blue"
            subtitle="Entrées, sorties et ajustements"
          />

          <KpiCard
            icon={<BarChart3 size={20} />}
            label="Inventaires"
            value={stockStats.totalInventaires}
            tone="emerald"
            subtitle="Contrôles de stock"
          />

          <KpiCard
            icon={<Layers size={20} />}
            label="Inventaires préparés"
            value={stockStats.inventairesPrepares}
            tone="orange"
            subtitle="En préparation"
          />
        </div>

        <SectionCard>
          <h2 className="mb-6 text-xl font-black text-slate-950">
            Accès rapides
          </h2>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#0b3d4f] hover:bg-[#f5f7fb]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-[#0b3d4f] group-hover:text-white">
                    <Icon size={20} />
                  </div>

                  <span className="text-sm font-bold text-slate-900">
                    {module.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </SectionCard>

       <SectionCard className="overflow-hidden">
  <div className="mb-6 rounded-[24px] bg-gradient-to-r from-[#0b3d4f] via-[#0f5b6b] to-[#16a6c9] p-6 text-white">
    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
      Journal du stock
    </p>

    <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-black">
          Dernières opérations
        </h2>
        <p className="mt-2 text-sm font-medium text-cyan-50">
          Aperçu des derniers mouvements enregistrés dans les magasins.
        </p>
      </div>

      <Link
        href="/stock/mouvements"
        className="inline-flex h-11 w-fit items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-[#0b3d4f] shadow-sm transition hover:bg-cyan-50"
      >
        Voir tous les mouvements
      </Link>
    </div>
  </div>

  <div className="grid gap-4 lg:grid-cols-3">
    {[
      {
        type: 'Entrée',
        reference: 'ENT-INT-12',
        article: 'Batterie',
        magasin: 'MAG-001 — Magasin principal',
        date: '16/06/2026',
        quantity: '+5',
        icon: TrendingUp,
        cardClass: 'border-emerald-200 bg-emerald-50/70',
        iconClass: 'bg-emerald-100 text-emerald-700',
        badgeClass: 'bg-emerald-600 text-white',
        quantityClass: 'bg-emerald-600 text-white',
      },
      {
        type: 'Sortie',
        reference: 'SORT-INT-30',
        article: 'Filtre hydraulique',
        magasin: 'MAG-001 — Magasin principal',
        date: '16/06/2026',
        quantity: '-1',
        icon: TrendingDown,
        cardClass: 'border-red-200 bg-red-50/70',
        iconClass: 'bg-red-100 text-red-700',
        badgeClass: 'bg-red-600 text-white',
        quantityClass: 'bg-red-600 text-white',
      },
      {
        type: 'Inventaire',
        reference: 'INV-003',
        article: 'Articles contrôlés',
        magasin: 'MAG-002 — Zone maintenance',
        date: '15/06/2026',
        quantity: '12 lignes',
        icon: BarChart3,
        cardClass: 'border-blue-200 bg-blue-50/70',
        iconClass: 'bg-blue-100 text-blue-700',
        badgeClass: 'bg-blue-600 text-white',
        quantityClass: 'bg-blue-600 text-white',
      },
    ].map((operation) => {
      const Icon = operation.icon;

      return (
        <div
          key={operation.reference}
          className={`relative overflow-hidden rounded-[26px] border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${operation.cardClass}`}
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40" />

          <div className="relative flex items-start justify-between gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${operation.iconClass}`}>
              <Icon size={22} />
            </div>

            <div className={`rounded-2xl px-4 py-2 text-sm font-black shadow-sm ${operation.quantityClass}`}>
              {operation.quantity}
            </div>
          </div>

          <div className="relative mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-slate-950">
                {operation.reference}
              </h3>

              <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] shadow-sm ${operation.badgeClass}`}>
                {operation.type}
              </span>
            </div>

            <p className="mt-3 text-sm font-black text-slate-800">
              {operation.article}
            </p>

            <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
              {operation.magasin}
            </p>

            <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              {operation.date}
            </p>
          </div>
        </div>
      );
    })}
  </div>
</SectionCard>
      </section>
    </main>
  );
}