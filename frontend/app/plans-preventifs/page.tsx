'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Layers,
  Plus,
  RefreshCcw,
  ShieldCheck,
  X,
} from 'lucide-react';

import { Select } from '@/components/select';
import { PageHeader } from '@/components/page-header';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { KpiCard } from '@/components/kpi-card';

import { PlanPreventifTable } from '@/features/plans-preventifs/components/PlanPreventifTable';
import type { PlanPreventif } from '@/features/plans-preventifs/types/plan-preventif.types';

type RawOption =
  | string
  | {
      label?: string;
      value?: string;
    };

type PlanPreventifAvecChamps = Omit<
  PlanPreventif,
  'materiel' | 'plan_preventif_predefini'
> & {
  actif?: boolean | null;
  idMateriel?: number | null;
  idPlanPreventifPredefini?: number | null;

  materiel?: {
    idMateriel?: number | null;
    code?: string | null;
    libelle?: string | null;
    designation?: string | null;
  } | null;

  plan_preventif_predefini?: {
    idPlanPreventifPredefini?: number | null;
    code?: string | null;
    titre?: string | null;
    libelle?: string | null;
  } | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  );
}

function normalizeSearch(value?: string | number | null) {
  return String(value ?? '').toLowerCase().trim();
}

function planMatchesSearch(plan: PlanPreventifAvecChamps, search: string) {
  const query = normalizeSearch(search);

  if (!query) return true;

  const source = [
    plan.code,
    plan.libelle,
    plan.etat,
    plan.typeDeclenchement,
    plan.materiel?.code,
    plan.materiel?.libelle,
    plan.materiel?.designation,
    plan.plan_preventif_predefini?.code,
    plan.plan_preventif_predefini?.titre,
    plan.plan_preventif_predefini?.libelle,
  ]
    .map(normalizeSearch)
    .join(' ');

  return source.includes(query);
}

async function fetchPlansPreventifs() {
  const res = await fetch(`${API_BASE_URL}/plans-preventifs`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Erreur lors du chargement des plans préventifs.');
  }

  const data = await res.json();

  return Array.isArray(data) ? (data as PlanPreventif[]) : [];
}

async function getApiErrorMessage(res: Response) {
  const text = await res.text().catch(() => '');

  if (!text) {
    return 'Une erreur est survenue.';
  }

  try {
    const data = JSON.parse(text);

    if (typeof data?.message === 'string') {
      return data.message;
    }

    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }

    if (typeof data?.error === 'string') {
      return data.error;
    }

    return 'Une erreur est survenue.';
  } catch {
    return text;
  }
}

async function deletePlanPreventif(id: number) {
  const res = await fetch(`${API_BASE_URL}/plans-preventifs/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res));
  }
}
export default function PlansPreventifsPage() {
  const router = useRouter();

  const [items, setItems] = useState<PlanPreventif[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [etat, setEtat] = useState('');
  const [typeDeclenchement, setTypeDeclenchement] = useState('');

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchPlansPreventifs();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des plans préventifs.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const plan = item as PlanPreventifAvecChamps;

      const matchSearch = planMatchesSearch(plan, search);
      const matchEtat = etat ? plan.etat === etat : true;
      const matchType = typeDeclenchement
        ? plan.typeDeclenchement === typeDeclenchement
        : true;

      return matchSearch && matchEtat && matchType;
    });
  }, [items, search, etat, typeDeclenchement]);

  const etatItems = useMemo(
    () =>
      toSelectItems(
        uniqueValues(items.map((item) => item.etat)) as RawOption[],
        'Tous les états',
      ),
    [items],
  );

  const typeItems = useMemo(
    () =>
      toSelectItems(
        uniqueValues(items.map((item) => item.typeDeclenchement)) as RawOption[],
        'Tous les types',
      ),
    [items],
  );

  const stats = useMemo(() => {
    const plans = filteredItems.map((item) => item as PlanPreventifAvecChamps);

    return {
      total: plans.length,
      actifs: plans.filter((item) => item.actif !== false).length,
      associes: plans.filter(
        (item) =>
          item.idPlanPreventifPredefini ||
          item.plan_preventif_predefini?.idPlanPreventifPredefini ||
          item.plan_preventif_predefini?.code,
      ).length,
      materiels: plans.filter((item) => item.idMateriel || item.materiel?.code)
        .length,
      automatiques: plans.filter(
        (item) => item.typeDeclenchement === 'AUTOMATIQUE',
      ).length,
    };
  }, [filteredItems]);

  function handleCreate() {
    router.push('/plans-preventifs/nouveau');
  }

  function handleView(id: number) {
    router.push(`/plans-preventifs/${id}`);
  }

  function handleEdit(id: number) {
    router.push(`/plans-preventifs/${id}/modifier`);
  }

  async function handleDelete(id: number) {
    if (deletingId !== null) return;

    try {
      setDeletingId(id);
      setError('');

      await deletePlanPreventif(id);

      setItems((current) =>
        current.filter((item) => item.idPlanPreventif !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression du plan préventif.',
      );
    } finally {
      setDeletingId(null);
    }
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
          title="Plans préventifs"
          description="Consultez, filtrez et gérez les plans de maintenance préventive appliqués aux équipements."
          actions={[
            {
              type: 'button',
              label: 'Actualiser',
              icon: <RefreshCcw size={18} />,
              onClick: loadPlans,
              variant: 'secondary',
              loading,
            },
            {
              type: 'button',
              label: 'Nouveau plan',
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
            label="Matériels"
            value={stats.materiels}
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
  <div className="flex items-start justify-between gap-4 rounded-[24px] border border-red-100 bg-red-50/90 px-5 py-4 text-red-700 shadow-sm">
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm ring-1 ring-red-100">
        <AlertTriangle size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black text-red-800">
          Action impossible
        </p>

        <p className="mt-1 text-sm font-bold leading-6 text-red-700">
          {error}
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={() => setError('')}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm ring-1 ring-red-100 transition hover:bg-red-50"
      title="Fermer le message"
    >
      <X size={17} />
    </button>
  </div>
)}

        <PlanPreventifTable
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