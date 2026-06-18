'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ClipboardList,
  Layers,
  Plus,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';

import { Select } from '@/components/select';
import { PageHeader } from '@/components/page-header';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { KpiCard } from '@/components/kpi-card';

import { PlanPreventifPredefiniTable } from '@/features/plans-preventifs-predefinis/components/PlanPreventifPredefiniTable';
import { usePlansPreventifsPredefinis } from '@/features/plans-preventifs-predefinis/hooks/usePlansPreventifsPredefinis';

type RawOption =
  | string
  | {
      label?: string;
      value?: string;
    };

const ALL_SELECT_VALUE = '__ALL__';

function normalizeOptionLabel(value: string) {
  if (value === 'ACTIF') return 'Actif';
  if (value === 'INACTIF') return 'Inactif';
  if (value === 'BROUILLON') return 'Brouillon';
  if (value === 'VALIDE') return 'Validé';
  if (value === 'AUTOMATIQUE') return 'Automatique';
  if (value === 'MANUEL') return 'Manuel';
  if (value === 'CONDITIONNEL') return 'Conditionnel';

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toSelectItems(options: RawOption[], allLabel: string) {
  const normalized = options
    .map((option) => {
      if (typeof option === 'string') {
        return {
          value: option,
          label: normalizeOptionLabel(option),
        };
      }

      return {
        value: option.value ?? '',
        label: option.label || normalizeOptionLabel(option.value || ''),
      };
    })
    .filter(
      (item) =>
        item.value &&
        item.value !== 'ALL' &&
        item.value !== 'TOUS' &&
        item.value !== ALL_SELECT_VALUE,
    );

  return [
    {
      value: ALL_SELECT_VALUE,
      label: allLabel,
    },
    ...normalized,
  ];
}

function toSelectValue(value?: string | null) {
  return value ? value : ALL_SELECT_VALUE;
}

function fromSelectValue(value: string) {
  return value === ALL_SELECT_VALUE ? '' : value;
}

export default function PlansPreventifsPredefinisPage() {
  const router = useRouter();

  const {
    filteredItems,
    loading,
    error,
    search,
    setSearch,
    etat,
    setEtat,
    typeDeclenchement,
    setTypeDeclenchement,
    etatsOptions,
    typesDeclenchementOptions,
    handleDelete,
  } = usePlansPreventifsPredefinis();

  const etatItems = useMemo(
    () => toSelectItems(etatsOptions as RawOption[], 'Tous les états'),
    [etatsOptions],
  );

  const typeItems = useMemo(
    () =>
      toSelectItems(
        typesDeclenchementOptions as RawOption[],
        'Tous les types',
      ),
    [typesDeclenchementOptions],
  );

  useEffect(() => {
    setEtat('');
    setTypeDeclenchement('');
  }, [setEtat, setTypeDeclenchement]);

  const stats = useMemo(() => {
    return {
      total: filteredItems.length,
      actifs: filteredItems.filter((item) => item.actif !== false).length,
      associes: filteredItems.filter(
        (item) => item.idModele || item.modele?.idModele,
      ).length,
      declencheurs: filteredItems.reduce(
        (total, item) => total + (item.ppp_declencheur?.length ?? 0),
        0,
      ),
      automatiques: filteredItems.filter(
        (item) => item.typeDeclenchement === 'AUTOMATIQUE',
      ).length,
    };
  }, [filteredItems]);

  function handleCreate() {
    router.push('/plans-preventifs-predefinis/nouveau');
  }

  function handleView(id: number) {
    router.push(`/plans-preventifs-predefinis/${id}`);
  }

  function handleEdit(id: number) {
    router.push(`/plans-preventifs-predefinis/${id}/modifier`);
  }

  function resetFilters() {
    setSearch('');
    setEtat('');
    setTypeDeclenchement('');
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-6 pb-6 pt-10">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Module maintenance préventive"
          title="Plans préventifs prédéfinis"
          description="Consultez, filtrez et gérez les modèles de maintenance préventive ainsi que leurs déclencheurs."
          actions={[
            {
              type: 'button',
              label: 'Actualiser',
              icon: <RefreshCcw size={18} />,
              onClick: () => window.location.reload(),
              variant: 'secondary',
              loading,
            },
            {
              type: 'button',
              label: 'Nouveau PPP',
              icon: <Plus size={18} />,
              onClick: handleCreate,
              variant: 'primary',
            },
          ]}
        />

        <div className="grid gap-4 md:grid-cols-5">
          <KpiCard
            icon={<ClipboardList size={20} />}
            label="Total"
            value={stats.total}
            tone="blue"
          />

          <KpiCard
            icon={<CheckCircle2 size={20} />}
            label="Actifs"
            value={stats.actifs}
            tone="emerald"
          />

          <KpiCard
            icon={<ShieldCheck size={20} />}
            label="Associés"
            value={stats.associes}
            tone="emerald"
          />

          <KpiCard
            icon={<Layers size={20} />}
            label="Déclencheurs"
            value={stats.declencheurs}
            tone="violet"
          />

          <KpiCard
            icon={<RefreshCcw size={20} />}
            label="Automatiques"
            value={stats.automatiques}
            tone="blue"
          />
        </div>

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          onReset={resetFilters}
          placeholder="Rechercher..."
          searchWidthClassName="lg:w-[300px] lg:flex-none"
        >
          <div className="w-full sm:w-[220px]">
            <Select
              value={toSelectValue(etat)}
              onValueChange={(value) => setEtat(fromSelectValue(value))}
              items={etatItems}
            />
          </div>

          <div className="w-full sm:w-[250px]">
            <Select
              value={toSelectValue(typeDeclenchement)}
              onValueChange={(value) =>
                setTypeDeclenchement(fromSelectValue(value))
              }
              items={typeItems}
            />
          </div>
        </SearchFilterBar>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        <PlanPreventifPredefiniTable
          items={filteredItems}
          total={filteredItems.length}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </main>
  );
}