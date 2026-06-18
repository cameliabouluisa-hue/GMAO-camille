'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Layers,
  ListChecks,
  Plus,
  RefreshCcw,
  Wrench,
} from 'lucide-react';

import { Select } from '@/components/select';
import { PageHeader } from '@/components/page-header';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { KpiCard } from '@/components/kpi-card';

import { GammeTable } from '@/features/gammes/components/GammeTable';
import {
  deleteGamme,
  getGammes,
} from '@/features/gammes/services/gamme.service';

import type { Gamme } from '@/features/gammes/types/gamme.types';

type TypeFilter = 'TOUS' | 'PREVENTIF' | 'CORRECTIF' | 'CONDITIONNEL';
type EtatFilter = 'TOUS' | 'BROUILLON' | 'VALIDE' | 'ACTIF' | 'INACTIF';

function getOperationsCount(gamme: Gamme): number {
  return gamme.gamme_operation?.length ?? 0;
}

function getSearchText(gamme: Gamme): string {
  return [
    gamme.idGamme,
    gamme.code,
    gamme.libelle,
    gamme.typeMaintenance,
    gamme.etat,
    gamme.organisation,
    gamme.modele?.code,
    gamme.modele?.libelle,
    gamme.idGamme ? `Gamme ${gamme.idGamme}` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function GammesPage() {
  const router = useRouter();

  const [gammes, setGammes] = useState<Gamme[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('TOUS');
  const [etatFilter, setEtatFilter] = useState<EtatFilter>('TOUS');

  const loadGammes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setDeleteCandidateId(null);

      const data = await getGammes();

      setGammes(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des gammes.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGammes();
  }, [loadGammes]);

  const filteredGammes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return gammes.filter((gamme) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        getSearchText(gamme).includes(normalizedSearch);

      const matchesType =
        typeFilter === 'TOUS' || gamme.typeMaintenance === typeFilter;

      const matchesEtat =
        etatFilter === 'TOUS' ||
        (etatFilter === 'ACTIF' && gamme.actif !== false) ||
        (etatFilter === 'INACTIF' && gamme.actif === false) ||
        gamme.etat === etatFilter;

      return matchesSearch && matchesType && matchesEtat;
    });
  }, [gammes, search, typeFilter, etatFilter]);

  const stats = useMemo(() => {
    return {
      total: gammes.length,
      preventives: gammes.filter(
        (gamme) => gamme.typeMaintenance === 'PREVENTIF',
      ).length,
      validees: gammes.filter((gamme) => gamme.etat === 'VALIDE').length,
      operations: gammes.reduce(
        (total, gamme) => total + getOperationsCount(gamme),
        0,
      ),
      actives: gammes.filter((gamme) => gamme.actif !== false).length,
    };
  }, [gammes]);

  async function handleDelete(gamme: Gamme) {
    if (deleteCandidateId !== gamme.idGamme) {
      setDeleteCandidateId(gamme.idGamme);
      return;
    }

    try {
      setActionLoadingId(gamme.idGamme);
      setError('');

      await deleteGamme(gamme.idGamme);
      await loadGammes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de supprimer cette gamme.',
      );
    } finally {
      setActionLoadingId(null);
      setDeleteCandidateId(null);
    }
  }

  function resetFilters() {
    setSearch('');
    setTypeFilter('TOUS');
    setEtatFilter('TOUS');
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Module maintenance"
          title="Gammes de maintenance"
          description="Créez, consultez et gérez les gammes ainsi que les opérations de maintenance associées."
          actions={[
            {
              type: 'button',
              label: 'Actualiser',
              icon: <RefreshCcw size={18} />,
              onClick: loadGammes,
              variant: 'secondary',
              loading,
            },
            {
              type: 'link',
              label: 'Nouvelle gamme',
              href: '/gammes/nouveau',
              icon: <Plus size={18} />,
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
            icon={<Wrench size={20} />}
            label="Préventives"
            value={stats.preventives}
            tone="blue"
          />

          <KpiCard
            icon={<CheckCircle2 size={20} />}
            label="Validées"
            value={stats.validees}
            tone="emerald"
          />

          <KpiCard
            icon={<Layers size={20} />}
            label="Opérations"
            value={stats.operations}
            tone="violet"
          />

          <KpiCard
            icon={<ListChecks size={20} />}
            label="Actives"
            value={stats.actives}
            tone="emerald"
          />
        </div>

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          onReset={resetFilters}
          
        >
          <Select
            value={typeFilter}
            onValueChange={(value: string) =>
              setTypeFilter(value as TypeFilter)
            }
            items={[
              { label: 'Tous les types', value: 'TOUS' },
              { label: 'Préventif', value: 'PREVENTIF' },
              { label: 'Correctif', value: 'CORRECTIF' },
              { label: 'Conditionnel', value: 'CONDITIONNEL' },
            ]}
          />

          <Select
            value={etatFilter}
            onValueChange={(value: string) =>
              setEtatFilter(value as EtatFilter)
            }
            items={[
              { label: 'Tous les états', value: 'TOUS' },
              { label: 'Brouillon', value: 'BROUILLON' },
              { label: 'Validée', value: 'VALIDE' },
              { label: 'Actives', value: 'ACTIF' },
              { label: 'Inactives', value: 'INACTIF' },
            ]}
          />
        </SearchFilterBar>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <GammeTable
          gammes={filteredGammes}
          total={gammes.length}
          loading={loading}
          actionLoadingId={actionLoadingId}
          deleteCandidateId={deleteCandidateId}
          onView={(id) => router.push(`/gammes/${id}`)}
          onEdit={(id) => router.push(`/gammes/${id}/modifier`)}
          onDelete={handleDelete}

        />
      </section>
    </main>
  );
}