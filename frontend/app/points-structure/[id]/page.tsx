'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, MapPin, RefreshCcw } from 'lucide-react';

import {
  AppBadge,
  AppFieldGrid,
  AppReadField,
  AppSection,
} from '@/components/app-section-layout';

import { getPointStructure } from '@/features/points-structure/services/point-structure.service';

import type {
  CriticitePoint,
  EtatPoint,
  PointStructureDetail,
  TypePointStructure,
} from '@/features/points-structure/types/point-structure.type';

function formatValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function formatBoolean(value?: boolean | null) {
  if (value === true) return 'Oui';
  if (value === false) return 'Non';
  return '—';
}

function formatType(value?: TypePointStructure | string | null) {
  if (value === 'GEOGRAPHIQUE') return 'Géographique';
  if (value === 'TECHNIQUE') return 'Technique';
  return value || '—';
}

function formatEtat(value?: EtatPoint | string | null) {
  if (value === 'BROUILLON') return 'Brouillon';
  if (value === 'VALIDE') return 'Validé';
  if (value === 'ARCHIVE') return 'Archivé';
  return value || '—';
}

function formatCriticite(value?: CriticitePoint | string | null) {
  if (value === 'FAIBLE') return 'Faible';
  if (value === 'MOYENNE') return 'Moyenne';
  if (value === 'ELEVEE') return 'Élevée';
  if (value === 'CRITIQUE') return 'Critique';
  return value || '—';
}

function getEtatTone(point: PointStructureDetail) {
  if (point.actif === false) return 'danger';
  if (point.etat === 'VALIDE') return 'success';
  if (point.etat === 'BROUILLON') return 'warning';
  return 'neutral';
}

function getTypeTone(point: PointStructureDetail) {
  if (point.typePoint === 'GEOGRAPHIQUE') return 'info';
  return 'warning';
}

function getParentLabel(point: PointStructureDetail) {
  const parent = point.parent ?? point.placement?.parent ?? null;

  if (!parent) return '—';

  if (parent.code && parent.libelle) {
    return `${parent.code} — ${parent.libelle}`;
  }

  return parent.code || parent.libelle || `Point #${parent.idPoint}`;
}

export default function DetailPointStructurePage() {
  const router = useRouter();
  const params = useParams();

  const idPoint = useMemo(() => {
    const raw = params?.id;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return Number(value);
  }, [params]);

  const [point, setPoint] = useState<PointStructureDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadPoint = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const data = await getPointStructure(idPoint);
        setPoint(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement du point de structure.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idPoint],
  );

  useEffect(() => {
    if (Number.isFinite(idPoint) && idPoint > 0) {
      loadPoint();
    }
  }, [idPoint, loadPoint]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <RefreshCcw
            size={26}
            className="mx-auto animate-spin text-slate-400"
          />

          <p className="mt-4 text-sm font-black text-slate-500">
            Chargement du point de structure...
          </p>
        </section>
      </main>
    );
  }

  if (!point) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
          Point de structure introuvable.
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1280px] space-y-5">
        <button
          type="button"
          onClick={() => router.push('/points-structure')}
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
                  <MapPin size={28} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                    Fiche point de structure
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black tracking-tight">
                      {point.libelle || `Point #${point.idPoint}`}
                    </h1>

                    <AppBadge tone={getTypeTone(point)}>
                      {formatType(point.typePoint)}
                    </AppBadge>

                    <AppBadge tone={getEtatTone(point)}>
                      {point.actif === false ? 'Inactif' : formatEtat(point.etat)}
                    </AppBadge>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-white/85">
                    {point.code || `PS-${point.idPoint}`} ·{' '}
                    {point.nbMateriels ?? point.materielsCount ?? 0} matériel(s)
                    lié(s)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => loadPoint(true)}
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
                  onClick={() =>
                    router.push(`/points-structure/${idPoint}/modifier`)
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50"
                >
                  <Edit size={17} />
                  Modifier
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <AppSection title="Informations générales">
              <AppFieldGrid>
                <AppReadField label="Code" value={formatValue(point.code)} />
                <AppReadField label="Libellé" value={formatValue(point.libelle)} />
                <AppReadField
                  label="Type de point"
                  value={formatType(point.typePoint)}
                />
                <AppReadField
                  label="État"
                  value={point.actif === false ? 'Inactif' : formatEtat(point.etat)}
                />
                <AppReadField
                  label="Catégorie"
                  value={formatValue(point.categorie)}
                />
                <AppReadField
                  label="Description"
                  value={formatValue(point.description)}
                />
              </AppFieldGrid>
            </AppSection>

            <AppSection title="Arborescence">
              <AppFieldGrid>
                <AppReadField
                  label="Type arborescence"
                  value={formatType(
                    point.typeArborescence ?? point.placement?.typeArborescence,
                  )}
                />
                <AppReadField label="Parent" value={getParentLabel(point)} />
                <AppReadField
                  label="Ordre"
                  value={formatValue(point.ordre ?? point.placement?.ordre)}
                />
                <AppReadField
                  label="Liens"
                  value={String(point.liensArborescence?.length ?? 0)}
                />
              </AppFieldGrid>
            </AppSection>

            <AppSection title="Organisation">
              <AppFieldGrid>
                <AppReadField
                  label="Responsable"
                  value={formatValue(point.responsable)}
                />
                <AppReadField
                  label="Organisation"
                  value={formatValue(point.organisation)}
                />
                <AppReadField
                  label="Centre de coût"
                  value={formatValue(point.centreCout)}
                />
                <AppReadField label="Actif" value={formatBoolean(point.actif)} />
              </AppFieldGrid>
            </AppSection>

            <AppSection title="Maintenance">
              <AppFieldGrid>
                <AppReadField
                  label="Interventions autorisées"
                  value={formatBoolean(point.interventionsAutorisees)}
                />
                <AppReadField
                  label="Criticité"
                  value={formatCriticite(point.criticite)}
                />
                <AppReadField
                  label="Observation"
                  value={formatValue(point.observationMaintenance)}
                />
                <AppReadField
                  label="Matériels liés"
                  value={String(point.nbMateriels ?? point.materielsCount ?? 0)}
                />
                <AppReadField
                  label="Gammes opérations"
                  value={String(point.nbGammesOperations ?? 0)}
                />
                <AppReadField
                  label="Plans préventifs"
                  value={String(point.nbPlansPreventifs ?? 0)}
                />
                <AppReadField
                  label="Déclencheurs"
                  value={String(point.nbDeclencheursPreventifs ?? 0)}
                />
                <AppReadField
                  label="Historiques"
                  value={String(point.nbHistoriquesPreventifs ?? 0)}
                />
              </AppFieldGrid>
            </AppSection>

            <AppSection title="Sécurité">
              <AppFieldGrid>
                <AppReadField
                  label="Zone sensible"
                  value={formatBoolean(point.zoneSensible)}
                />
                <AppReadField
                  label="Accès restreint"
                  value={formatBoolean(point.accesRestreint)}
                />
                <AppReadField
                  label="EPI obligatoire"
                  value={formatBoolean(point.epiObligatoire)}
                />
                <AppReadField
                  label="Consigne sécurité"
                  value={formatValue(point.consigneSecurite)}
                />
              </AppFieldGrid>
            </AppSection>
          </div>
        </section>
      </section>
    </main>
  );
}