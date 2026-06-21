'use client';

import { Select } from '@/components/select';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  XCircle,
} from 'lucide-react';

import {
  deleteDemandeIntervention,
  getDemandesIntervention,
} from '@/features/demandes-intervention/services/demande-intervention.service';
import PermissionRoute from '@/components/PermissionRoute';
import { useAuth } from '@/context/AuthContext';
import { Permission, UserRole } from '@/types/auth';
import type { DemandeIntervention } from '@/features/demandes-intervention/types/demande-intervention.types';

import { DemandeInterventionTable } from '@/features/demandes-intervention/components/DemandeInterventionTable';

type StatutFilter =
  | 'TOUS'
  | 'EN_PREPARATION'
  | 'ATTENTE_PRISE_EN_COMPTE'
  | 'ATTENTE_REALISATION'
  | 'REFUSE'
  | 'SOLDE'
  | 'ANNULE';

type PrioriteFilter = 'TOUTES' | 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';

type CriticiteFilter =
  | 'TOUTES'
  | 'FAIBLE'
  | 'MOYENNE'
  | 'ELEVEE'
  | 'CRITIQUE';

type MiniStatTone = 'blue' | 'green' | 'red' | 'slate' | 'indigo';

export default function DemandesInterventionPage() {
  const [demandes, setDemandes] = useState<DemandeIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState('');
const { user, hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutFilter>('TOUS');
  const [prioriteFilter, setPrioriteFilter] =
    useState<PrioriteFilter>('TOUTES');
  const [criticiteFilter, setCriticiteFilter] =
    useState<CriticiteFilter>('TOUTES');

  const loadDemandes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getDemandesIntervention();
      setDemandes(data);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Erreur lors du chargement des demandes d’intervention.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDemandes();
  }, [loadDemandes]);

  async function reloadDemandesSilently() {
    try {
      const data = await getDemandesIntervention();
      setDemandes(data);
      return data;
    } catch {
      return null;
    }
  }

  const filteredDemandes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return demandes.filter((demande) => {
      const statutNormalise = normalizeDemandeStatut(demande.statut);

      const materielLabel = [
        demande.materiel?.code,
        demande.materiel?.libelle,
        demande.materiel?.numeroSerie,
      ]
        .filter(Boolean)
        .join(' ');

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          demande.code,
          demande.description,
          demande.demandeur,
          statutNormalise,
          demande.priorite,
          demande.criticite,
          materielLabel,
          demande.idDemande ? `DI-${demande.idDemande}` : undefined,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch),
          );

      const matchesStatut =
        statutFilter === 'TOUS' || statutNormalise === statutFilter;

      const matchesPriorite =
        prioriteFilter === 'TOUTES' || demande.priorite === prioriteFilter;

      const matchesCriticite =
        criticiteFilter === 'TOUTES' ||
        demande.criticite === criticiteFilter;

      return (
        matchesSearch &&
        matchesStatut &&
        matchesPriorite &&
        matchesCriticite
      );
    });
  }, [demandes, search, statutFilter, prioriteFilter, criticiteFilter]);

  const stats = useMemo(() => {
    return {
      total: demandes.length,

      preparation: demandes.filter(
        (demande) => normalizeDemandeStatut(demande.statut) === 'EN_PREPARATION',
      ).length,

      priseEnCompte: demandes.filter(
        (demande) =>
          normalizeDemandeStatut(demande.statut) ===
          'ATTENTE_PRISE_EN_COMPTE',
      ).length,

      realisation: demandes.filter(
        (demande) =>
          normalizeDemandeStatut(demande.statut) === 'ATTENTE_REALISATION',
      ).length,

      refusees: demandes.filter(
        (demande) => normalizeDemandeStatut(demande.statut) === 'REFUSE',
      ).length,
    };
  }, [demandes]);

  function resetFilters() {
    setSearch('');
    setStatutFilter('TOUS');
    setPrioriteFilter('TOUTES');
    setCriticiteFilter('TOUTES');
  }

  async function handleDelete(demande: DemandeIntervention) {
    const statutNormalise = normalizeDemandeStatut(demande.statut);

    if (statutNormalise !== 'EN_PREPARATION') {
      setError(
        'Seules les demandes en préparation peuvent être supprimées.',
      );
      return;
    }

   

    try {
      setActionLoadingId(demande.idDemande);
      setError('');

      await deleteDemandeIntervention(demande.idDemande);

      setDemandes((current) =>
        current.filter((item) => item.idDemande !== demande.idDemande),
      );

      await loadDemandes();
    } catch (err) {
      const reloaded = await reloadDemandesSilently();

      const demandeExisteEncore = reloaded?.some(
        (item) => item.idDemande === demande.idDemande,
      );

      /**
       * Cas observé :
       * Le backend renvoie parfois une erreur alors que la suppression est déjà faite.
       * Si après rechargement la DI n'existe plus, on ne garde pas l'erreur rouge.
       */
      if (reloaded && !demandeExisteEncore) {
        setError('');
        return;
      }

      setError(
        getApiErrorMessage(
          err,
          'Impossible de supprimer cette demande d’intervention.',
        ),
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
  <PermissionRoute
    permission={[Permission.DI_VIEW_ALL, Permission.DI_VIEW_OWN]}
    mode="any"
  >
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">
              Module maintenance
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-950">
              Demandes d’intervention
            </h1>

            <p className="mt-1 text-base text-slate-500">
              Consultez, filtrez et gérez les demandes signalées avant leur
              transformation en ordre de travail.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadDemandes}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                size={18}
                className={loading ? 'animate-spin' : ''}
              />
              Actualiser
            </button>
{user?.role === UserRole.DEMANDEUR && hasPermission(Permission.DI_CREATE) && (
  <Link
    href="/maintenance/demandes/nouveau"
    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#06475a] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
  >
    <Plus size={18} />
    Nouvelle demande
  </Link>
)}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <MiniStat
            icon={<ClipboardList size={18} />}
            label="Total"
            value={stats.total}
            tone="blue"
          />

          <MiniStat
            icon={<FileText size={18} />}
            label="Préparation"
            value={stats.preparation}
            tone="slate"
          />

          <MiniStat
            icon={<Send size={18} />}
            label="À prendre"
            value={stats.priseEnCompte}
            tone="indigo"
          />

          <MiniStat
            icon={<CheckCircle2 size={18} />}
            label="Réalisation"
            value={stats.realisation}
            tone="green"
          />

          <MiniStat
            icon={<XCircle size={18} />}
            label="Refusées"
            value={stats.refusees}
            tone="red"
          />
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[1.5fr_0.75fr_0.75fr_0.75fr_auto]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par code, description, demandeur, matériel, statut..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b3d4f] focus:bg-white focus:ring-4 focus:ring-[#0b3d4f]/10"
              />
            </div>

            <Select
              value={statutFilter}
              onValueChange={(value: string) =>
                setStatutFilter(value as StatutFilter)
              }
              items={[
                { label: 'Tous les statuts', value: 'TOUS' },
                { label: 'En préparation', value: 'EN_PREPARATION' },
                {
                  label: 'Attente prise en compte',
                  value: 'ATTENTE_PRISE_EN_COMPTE',
                },
                {
                  label: 'Attente réalisation',
                  value: 'ATTENTE_REALISATION',
                },
                { label: 'Refusé', value: 'REFUSE' },
                { label: 'Soldé', value: 'SOLDE' },
                { label: 'Annulé', value: 'ANNULE' },
              ]}
            />

            <Select
              value={prioriteFilter}
              onValueChange={(value: string) =>
                setPrioriteFilter(value as PrioriteFilter)
              }
              items={[
                { label: 'Toutes priorités', value: 'TOUTES' },
                { label: 'Basse', value: 'BASSE' },
                { label: 'Normale', value: 'NORMALE' },
                { label: 'Haute', value: 'HAUTE' },
                { label: 'Urgente', value: 'URGENTE' },
              ]}
            />

            <Select
              value={criticiteFilter}
              onValueChange={(value: string) =>
                setCriticiteFilter(value as CriticiteFilter)
              }
              items={[
                { label: 'Toutes criticités', value: 'TOUTES' },
                { label: 'Faible', value: 'FAIBLE' },
                { label: 'Moyenne', value: 'MOYENNE' },
                { label: 'Élevée', value: 'ELEVEE' },
                { label: 'Critique', value: 'CRITIQUE' },
              ]}
            />

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw size={17} />
              Réinitialiser
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

       <DemandeInterventionTable
  demandes={filteredDemandes}
  total={demandes.length}
  loading={loading}
  actionLoadingId={actionLoadingId}
  onDelete={handleDelete}
  canCreate={hasPermission(Permission.DI_CREATE)}
  canUpdate={hasPermission(Permission.DI_UPDATE)}
  canDelete={hasPermission(Permission.DI_DELETE)}
  canAccept={hasPermission(Permission.DI_ACCEPT)}
  canRefuse={hasPermission(Permission.DI_REFUSE)}
  canClose={hasPermission(Permission.DI_CLOSE)}
/>
      </section>
       </main>
  </PermissionRoute>
);
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: MiniStatTone;
}) {
  const tones: Record<MiniStatTone, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-700',
  };

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]}`}
        >
          {icon}
        </div>

        <p className="text-2xl font-black text-slate-950">{value}</p>
      </div>

      <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function normalizeDemandeStatut(statut?: string | null) {
  if (
    statut === 'TERMINE' ||
    statut === 'TRAVAUX_ACCEPTES' ||
    statut === 'TRAVAUX_REFUSES'
  ) {
    return 'ATTENTE_REALISATION';
  }

  return statut || '';
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as {
    response?: {
      data?: {
        message?: unknown;
        error?: unknown;
      };
    };
    message?: string;
  };

  const responseMessage = apiError.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(', ');
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  const responseError = apiError.response?.data?.error;

  if (typeof responseError === 'string' && responseError.trim()) {
    return responseError;
  }

  if (typeof apiError.message === 'string' && apiError.message.trim()) {
    return apiError.message;
  }

  return fallback;
}