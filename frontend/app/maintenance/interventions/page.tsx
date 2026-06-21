'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Play,
  Plus,
  RefreshCcw,
  XCircle,
} from 'lucide-react';

import { Select } from '@/components/select';
import { PageHeader } from '@/components/page-header';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { KpiCard } from '@/components/kpi-card';
import { InterventionTable } from '@/features/interventions/components/InterventionTable';
import {
  deleteIntervention,
  getInterventions,
} from '@/features/interventions/services/intervention.service';
import type { Intervention } from '@/features/interventions/types/intervention.types';
import PermissionRoute from '@/components/PermissionRoute';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types/auth';
type EtatFilter =
  | 'TOUS'
  | 'EN_PREPARATION'
  | 'ATTENTE_VALIDATION'
  | 'VALIDEE'
  | 'ATTENTE_FOURNITURE'
  | 'EN_COURS'
  | 'TERMINE'
  | 'TRAVAUX_ACCEPTES'
  | 'TRAVAUX_REFUSES'
  | 'SOLDE'
  | 'ARCHIVE'
  | 'ANNULE';

type TypeFilter = 'TOUS' | 'CORRECTIF' | 'PREVENTIF' | 'CONDITIONNEL';

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [etatFilter, setEtatFilter] = useState<EtatFilter>('TOUS');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('TOUS');
const { hasPermission } = useAuth();
  const loadInterventions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getInterventions();
      setInterventions(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des interventions.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterventions();
  }, [loadInterventions]);

  const filteredInterventions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return interventions.filter((intervention) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          intervention.code,
          intervention.libelle,
          intervention.description,
          intervention.typeMaintenance,
          intervention.etat,
          intervention.priorite,
          intervention.materiel?.code,
          intervention.materiel?.libelle,
          intervention.equipe_maintenance?.libelle,
          intervention.idIntervention
            ? `OT-${intervention.idIntervention}`
            : undefined,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch),
          );

      const matchesEtat =
        etatFilter === 'TOUS' || intervention.etat === etatFilter;
      const matchesType =
        typeFilter === 'TOUS' || intervention.typeMaintenance === typeFilter;

      return matchesSearch && matchesEtat && matchesType;
    });
  }, [interventions, search, etatFilter, typeFilter]);

  const stats = useMemo(
    () => ({
      total: interventions.length,
      preparation: interventions.filter((item) => item.etat === 'EN_PREPARATION')
        .length,
      enCours: interventions.filter((item) => item.etat === 'EN_COURS').length,
      terminees: interventions.filter((item) => item.etat === 'TERMINE').length,
      annulees: interventions.filter((item) => item.etat === 'ANNULE').length,
    }),
    [interventions],
  );

  async function handleDelete(intervention: Intervention) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'intervention ${
        intervention.code || intervention.idIntervention
      } ?`,
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(intervention.idIntervention);
      setError('');
      await deleteIntervention(intervention.idIntervention);
      await loadInterventions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer cette intervention.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  function resetFilters() {
    setSearch('');
    setEtatFilter('TOUS');
    setTypeFilter('TOUS');
  }

  return (
  <PermissionRoute
    permission={[
      Permission.INTERVENTION_VIEW_ALL,
      Permission.INTERVENTION_VIEW_ASSIGNED,
    ]}
    mode="any"
  >
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Module maintenance"
          title="Interventions"
          description="Consultez et pilotez les ordres de travail correctifs, préventifs et conditionnels."
          actions={[
  {
    type: 'button',
    label: 'Actualiser',
    icon: <RefreshCcw size={18} />,
    onClick: loadInterventions,
    variant: 'secondary',
    loading: loading,
  },
  ...(hasPermission(Permission.INTERVENTION_CREATE)
    ? [
        {
          type: 'link' as const,
          label: 'Nouvelle intervention',
          href: '/maintenance/interventions/nouveau',
          icon: <Plus size={18} />,
          variant: 'primary' as const,
        },
      ]
    : []),
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
            icon={<ClipboardList size={20} />}
            label="Préparation"
            value={stats.preparation}
            tone="blue"
          />
          <KpiCard
            icon={<Play size={20} />}
            label="En cours"
            value={stats.enCours}
            tone="violet"
          />
          <KpiCard
            icon={<CheckCircle2 size={20} />}
            label="Terminées"
            value={stats.terminees}
            tone="emerald"
          />
          <KpiCard
            icon={<XCircle size={20} />}
            label="Annulées"
            value={stats.annulees}
            tone="red"
          />
        </div>

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          onReset={resetFilters}
        >
          <Select
            value={etatFilter}
            onValueChange={(value: string) =>
              setEtatFilter(value as EtatFilter)
            }
            items={[
              { label: 'Tous les états', value: 'TOUS' },
              { label: 'En préparation', value: 'EN_PREPARATION' },
              { label: 'Attente validation', value: 'ATTENTE_VALIDATION' },
              { label: 'Validée', value: 'VALIDEE' },
              { label: 'Attente fourniture', value: 'ATTENTE_FOURNITURE' },
              { label: 'En cours', value: 'EN_COURS' },
              { label: 'Terminé', value: 'TERMINE' },
              { label: 'Travaux acceptés', value: 'TRAVAUX_ACCEPTES' },
              { label: 'Travaux refusés', value: 'TRAVAUX_REFUSES' },
              { label: 'Soldé', value: 'SOLDE' },
              { label: 'Archivé', value: 'ARCHIVE' },
              { label: 'Annulé', value: 'ANNULE' },
            ]}
          />

          <Select
            value={typeFilter}
            onValueChange={(value: string) =>
              setTypeFilter(value as TypeFilter)
            }
            items={[
              { label: 'Tous les types', value: 'TOUS' },
              { label: 'Correctif', value: 'CORRECTIF' },
              { label: 'Préventif', value: 'PREVENTIF' },
              { label: 'Conditionnel', value: 'CONDITIONNEL' },
            ]}
          />
        </SearchFilterBar>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

       <InterventionTable
  interventions={filteredInterventions}
  total={interventions.length}
  loading={loading}
  actionLoadingId={actionLoadingId}
  onDelete={handleDelete}
  canUpdate={hasPermission(Permission.INTERVENTION_UPDATE)}
  canDelete={hasPermission(Permission.INTERVENTION_DELETE)}
/>
      </section>
       </main>
  </PermissionRoute>
);
}