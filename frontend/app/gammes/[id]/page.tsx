'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  Edit,
  ListChecks,
  RefreshCcw,
  Wrench,
} from 'lucide-react';

import {
  AppBadge,
  AppFieldGrid,
  AppReadField,
  AppSection,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
} from '@/components/app-section-layout';

import GammeOperationsPanel, {
  normalizeOperations,
} from '@/features/gammes/components/GammeOperationsPanel';

import { getGammeById } from '@/features/gammes/services/gamme.service';
import type { Gamme } from '@/features/gammes/types/gamme.types';

type ActiveTab = 'general' | 'operations';

function formatValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—';

  return String(value);
}

function formatBoolean(value?: boolean | null) {
  if (value === true) return 'Oui';
  if (value === false) return 'Non';

  return '—';
}

function formatType(value?: string | null) {
  if (value === 'PREVENTIF') return 'Préventif';
  if (value === 'CORRECTIF') return 'Correctif';
  if (value === 'CONDITIONNEL') return 'Conditionnel';

  return value || '—';
}

function formatEtat(value?: string | null) {
  if (value === 'BROUILLON') return 'Brouillon';
  if (value === 'VALIDE') return 'Validée';
  if (value === 'ARCHIVE') return 'Archivée';
  if (value === 'ANNULE') return 'Annulée';

  return value || '—';
}

function getEtatTone(value?: string | null, actif?: boolean | null) {
  if (actif === false) return 'danger';
  if (value === 'VALIDE') return 'success';
  if (value === 'BROUILLON') return 'warning';

  return 'neutral';
}

function getModeleLabel(gamme: Gamme) {
  if (gamme.modele?.code && gamme.modele?.libelle) {
    return `${gamme.modele.code} — ${gamme.modele.libelle}`;
  }

  if (gamme.modele?.code) return gamme.modele.code;
  if (gamme.modele?.libelle) return gamme.modele.libelle;
  if (gamme.idModele) return `Modèle #${gamme.idModele}`;

  return '—';
}

function getMaterielLabel(gamme: Gamme) {
  if (gamme.materiel?.code && gamme.materiel?.libelle) {
    return `${gamme.materiel.code} — ${gamme.materiel.libelle}`;
  }

  if (gamme.materiel?.code) return gamme.materiel.code;
  if (gamme.materiel?.libelle) return gamme.materiel.libelle;
  if (gamme.idMateriel) return `Matériel #${gamme.idMateriel}`;

  return '—';
}

export default function DetailGammePage() {
  const router = useRouter();
  const params = useParams();

  const idGamme = useMemo(() => {
    const raw = params?.id;
    const value = Array.isArray(raw) ? raw[0] : raw;

    return Number(value);
  }, [params]);

  const [gamme, setGamme] = useState<Gamme | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadGamme = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const data = await getGammeById(idGamme);

        setGamme(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement de la gamme.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idGamme],
  );

  useEffect(() => {
    if (Number.isFinite(idGamme) && idGamme > 0) {
      loadGamme();
    }
  }, [idGamme, loadGamme]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <RefreshCcw
            size={26}
            className="mx-auto animate-spin text-slate-400"
          />

          <p className="mt-4 text-sm font-black text-slate-500">
            Chargement de la gamme...
          </p>
        </section>
      </main>
    );
  }

  if (!gamme) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
          Gamme introuvable.
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1280px] space-y-5">
        <button
          type="button"
          onClick={() => router.push('/gammes')}
          className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#06475a]"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#0a556b] to-[#0d6f87] px-6 py-6 text-white">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Wrench size={28} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                    Fiche gamme
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black tracking-tight">
                      {gamme.libelle || `Gamme #${gamme.idGamme}`}
                    </h1>

                    <AppBadge tone={getEtatTone(gamme.etat, gamme.actif)}>
                      {gamme.actif === false ? 'Inactive' : formatEtat(gamme.etat)}
                    </AppBadge>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-white/85">
                    {gamme.code || `GAM-${gamme.idGamme}`} ·{' '}
                    {gamme.gamme_operation?.length ?? 0} opération(s)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => loadGamme(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-black text-white transition hover:bg-white/20"
                >
                  <RefreshCcw
                    size={17}
                    className={refreshing ? 'animate-spin' : ''}
                  />
                  Actualiser
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/gammes/${idGamme}/modifier`)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50"
                >
                  <Edit size={17} />
                  Modifier
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 bg-white px-6">
            <div className="flex flex-wrap gap-2 py-3">
              <TabButton
                active={activeTab === 'general'}
                icon={<ClipboardList size={18} />}
                label="Général"
                onClick={() => setActiveTab('general')}
              />

              <TabButton
                active={activeTab === 'operations'}
                icon={<ListChecks size={18} />}
                label={`Opérations (${gamme.gamme_operation?.length ?? 0})`}
                onClick={() => setActiveTab('operations')}
              />
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'general' ? (
              <div className="space-y-6">
                <AppSection title="Informations générales">
                  <AppFieldGrid>
                    <AppReadField label="Code" value={formatValue(gamme.code)} />
                    <AppReadField
                      label="Libellé"
                      value={formatValue(gamme.libelle)}
                    />
                    <AppReadField
                      label="Type maintenance"
                      value={formatType(gamme.typeMaintenance)}
                    />
                    <AppReadField
                      label="État"
                      value={
                        gamme.actif === false ? 'Inactive' : formatEtat(gamme.etat)
                      }
                    />
                    <AppReadField
                      label="Organisation"
                      value={formatValue(gamme.organisation)}
                    />
                    <AppReadField
                      label="Actif"
                      value={formatBoolean(gamme.actif !== false)}
                    />
                  </AppFieldGrid>
                </AppSection>

                <AppSection title="Association équipement">
                  <AppFieldGrid>
                    <AppReadField label="Modèle" value={getModeleLabel(gamme)} />
                    <AppReadField
                      label="Matériel"
                      value={getMaterielLabel(gamme)}
                    />
                  </AppFieldGrid>
                </AppSection>

                <AppSection title="Planification">
                  <AppFieldGrid>
                    <AppReadField
                      label="Jour fin"
                      value={formatValue(gamme.jourFin)}
                    />
                    <AppReadField
                      label="Charge prévue"
                      value={formatValue(gamme.chargePrevue)}
                    />
                    <AppReadField
                      label="Temps d’arrêt"
                      value={formatValue(gamme.tempsArret)}
                    />
                    <AppReadField
                      label="Réception travaux"
                      value={formatBoolean(gamme.receptionTravaux)}
                    />
                  </AppFieldGrid>
                </AppSection>
              </div>
            ) : (
              <GammeOperationsPanel
                readOnly
                operations={normalizeOperations(gamme.gamme_operation)}
                title="Opérations"
                description="Liste des opérations définies dans cette gamme."
              />
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black transition',
        active
          ? 'border border-slate-200 bg-white text-[#06475a] shadow-sm'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}