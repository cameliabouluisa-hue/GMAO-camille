'use client';

import Link from 'next/link';
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Gauge,
  Link2,
  Pencil,
  Plus,
  RefreshCcw,
  Ruler,
  Save,
  Server,
  ShieldAlert,
  Trash2,
  XCircle,
} from 'lucide-react';

import {
  createReleveMesure,
  deleteReleveMesure,
  getPointMesure,
} from '../services/point-mesure.service';

import type {
  PointMesure,
  ReleveMesure,
} from '../types/point-mesure.types';

type Props = {
  idPointMesure: number;
};

type ReleveFormState = {
  dateReleve: string;
  valeur: string;
  variation: string;
  commentaire: string;
  correction: boolean;
};

const DEFAULT_RELEVE_FORM: ReleveFormState = {
  dateReleve: '',
  valeur: '',
  variation: '',
  commentaire: '',
  correction: false,
};

function formatDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function displayValue(value?: number | string | null, unite?: string | null) {
  if (value === null || value === undefined || value === '') return '-';

  return `${value}${unite ? ` ${unite}` : ''}`;
}

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

export function PointMesureDetailPage({ idPointMesure }: Props) {
  const router = useRouter();

  const [point, setPoint] = useState<PointMesure | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingReleve, setSavingReleve] = useState(false);
  const [deletingReleveId, setDeletingReleveId] = useState<number | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [releveForm, setReleveForm] =
    useState<ReleveFormState>(DEFAULT_RELEVE_FORM);

  const releves = useMemo(() => point?.releves ?? [], [point]);

  const loadPoint = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getPointMesure(idPointMesure);
      setPoint(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du point de mesure.',
      );
    } finally {
      setLoading(false);
    }
  }, [idPointMesure]);

  useEffect(() => {
    loadPoint();
  }, [loadPoint]);

  function updateReleveField<K extends keyof ReleveFormState>(
    field: K,
    value: ReleveFormState[K],
  ) {
    setReleveForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleCreateReleve(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!point) return;

    if (!releveForm.valeur.trim()) {
      setError('La valeur du relevé est obligatoire.');
      setSuccess('');
      return;
    }

    const valeur = Number(releveForm.valeur);

    if (Number.isNaN(valeur)) {
      setError('La valeur du relevé doit être un nombre valide.');
      setSuccess('');
      return;
    }

    try {
      setSavingReleve(true);
      setError('');
      setSuccess('');

      await createReleveMesure({
        idPointMesure: point.idPointMesure,
        dateReleve: releveForm.dateReleve
          ? new Date(releveForm.dateReleve).toISOString()
          : undefined,
        valeur,
        variation: optionalNumber(releveForm.variation),
        commentaire: releveForm.commentaire.trim() || null,
        correction: releveForm.correction,
      });

      setReleveForm(DEFAULT_RELEVE_FORM);
      setSuccess('Relevé ajouté avec succès.');

      await loadPoint();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l’ajout du relevé.',
      );
    } finally {
      setSavingReleve(false);
    }
  }

  async function handleDeleteReleve(releve: ReleveMesure) {
    const ok = window.confirm('Voulez-vous vraiment supprimer ce relevé ?');

    if (!ok) return;

    try {
      setDeletingReleveId(releve.idReleveMesure);
      setError('');
      setSuccess('');

      await deleteReleveMesure(releve.idReleveMesure);

      setSuccess('Relevé supprimé avec succès.');
      await loadPoint();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression du relevé.',
      );
    } finally {
      setDeletingReleveId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
        <section className="mx-auto max-w-[1450px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-base font-semibold text-slate-500 shadow-sm">
            Chargement du point de mesure...
          </div>
        </section>
      </main>
    );
  }

  if (!point) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
        <section className="mx-auto max-w-[1450px]">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-base font-semibold text-red-700">
            Point de mesure introuvable.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/points-mesure')}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Retour
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadPoint}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCcw size={17} />
              Actualiser
            </button>

            <Link
              href={`/points-mesure/${point.idPointMesure}/modifier`}
              className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#0b3d4f] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#082f3d]"
            >
              <Pencil size={17} />
              Modifier
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0b3d4f] text-white shadow-sm">
                <Gauge size={30} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black text-slate-950">
                    {point.code}
                  </h1>

                  <TypeBadge type={point.type} />

                  <StatusBadge actif={Boolean(point.actif)} />
                </div>

                <p className="mt-1 text-base font-semibold text-slate-500">
                  {point.libelle}
                </p>
              </div>
            </div>

            <div className="grid min-w-[280px] gap-3 rounded-3xl bg-slate-50 p-4">
              <SmallSummary
                label="Dernière valeur"
                value={displayValue(point.derniereValeur, point.unite)}
              />

              <SmallSummary
                label="Dernier relevé"
                value={formatDate(point.derniereDate)}
              />

              <SmallSummary
                label="Nombre de relevés"
                value={String(point._count?.releves ?? releves.length)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card icon={<FileIcon />} title="Identification">
            <InfoGrid
              items={[
                ['Code', point.code],
                ['Libellé', point.libelle],
                ['Type', point.type],
                ['Unité', point.unite || '-'],
                ['Organisation', point.organisation || '-'],
                ['Statut', point.actif ? 'Actif' : 'Inactif'],
              ]}
            />

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Link2 size={18} className="text-[#0b3d4f]" />

                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Association
                </p>
              </div>

              <p className="text-sm font-black text-slate-800">
                {getAssociationLabel(point)}
              </p>
            </div>
          </Card>

          <Card icon={<CalendarDays size={20} />} title="Dernier relevé">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Valeur actuelle
              </p>

              <p className="mt-2 text-4xl font-black text-slate-950">
                {displayValue(point.derniereValeur, point.unite)}
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Date : {formatDate(point.derniereDate)}
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <MiniLine label="Valeur min" value={displayValue(point.valeurMin, point.unite)} />
              <MiniLine label="Valeur max" value={displayValue(point.valeurMax, point.unite)} />
              <MiniLine label="Période relevés" value={point.periodeReleveJours ? `${point.periodeReleveJours} jour(s)` : '-'} />
            </div>
          </Card>
        </div>

        <Card icon={<Ruler size={20} />} title="Paramètres avancés">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ParameterBox
              title="Valeurs autorisées"
              lines={[
                ['Min', displayValue(point.valeurMin, point.unite)],
                ['Max', displayValue(point.valeurMax, point.unite)],
                ['Décimales', point.nbDecimales ?? '-'],
              ]}
            />

            <ParameterBox
              title="Surveillance"
              lines={[
                ['Plancher', displayValue(point.surveillanceMin, point.unite)],
                ['Plafond', displayValue(point.surveillanceMax, point.unite)],
              ]}
            />

            <ParameterBox
              title="Correction"
              lines={[
                ['Plancher', displayValue(point.correctionMin, point.unite)],
                ['Plafond', displayValue(point.correctionMax, point.unite)],
              ]}
            />

            <ParameterBox
              title="Actions"
              lines={[
                ['Émettre DI', point.emettreDi ? 'Oui' : 'Non'],
                ['Alerte', point.envoyerAlerte ? 'Oui' : 'Non'],
              ]}
            />
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card icon={<Plus size={20} />} title="Ajouter un relevé">
            <form onSubmit={handleCreateReleve} className="space-y-4">
              <Field label="Date du relevé">
                <input
                  type="datetime-local"
                  value={releveForm.dateReleve}
                  onChange={(e) =>
                    updateReleveField('dateReleve', e.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f] focus:bg-white"
                />
              </Field>

              <Field label={`Valeur${point.unite ? ` (${point.unite})` : ''}`} required>
                <input
                  type="number"
                  value={releveForm.valeur}
                  onChange={(e) => updateReleveField('valeur', e.target.value)}
                  placeholder="Ex : 250"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f] focus:bg-white"
                />
              </Field>

              <Field label="Variation">
                <input
                  type="number"
                  value={releveForm.variation}
                  onChange={(e) =>
                    updateReleveField('variation', e.target.value)
                  }
                  placeholder="Optionnel"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f] focus:bg-white"
                />
              </Field>

              <Field label="Commentaire">
                <textarea
                  value={releveForm.commentaire}
                  onChange={(e) =>
                    updateReleveField('commentaire', e.target.value)
                  }
                  placeholder="Observation, contexte du relevé..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#0b3d4f] focus:bg-white"
                />
              </Field>

              <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <input
                  type="checkbox"
                  checked={releveForm.correction}
                  onChange={(e) =>
                    updateReleveField('correction', e.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-bold text-slate-700">
                  Ce relevé est une correction
                </span>
              </label>

              <button
                type="submit"
                disabled={savingReleve}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b3d4f] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#082f3d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {savingReleve ? 'Ajout...' : 'Ajouter le relevé'}
              </button>
            </form>
          </Card>

          <Card icon={<Activity size={20} />} title="Historique des relevés">
            {releves.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm font-bold text-slate-500">
                  Aucun relevé enregistré.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Valeur</th>
                      <th className="px-3 py-3">Variation</th>
                      <th className="px-3 py-3">Correction</th>
                      <th className="px-3 py-3">Commentaire</th>
                      <th className="px-3 py-3 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {releves.map((releve) => (
                      <tr key={releve.idReleveMesure}>
                        <td className="px-3 py-3 text-sm font-bold text-slate-700">
                          {formatDate(releve.dateReleve)}
                        </td>

                        <td className="px-3 py-3 text-sm font-black text-slate-900">
                          {displayValue(releve.valeur, point.unite)}
                        </td>

                        <td className="px-3 py-3 text-sm font-semibold text-slate-600">
                          {displayValue(releve.variation, point.unite)}
                        </td>

                        <td className="px-3 py-3">
                          {releve.correction ? (
                            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                              Oui
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                              Non
                            </span>
                          )}
                        </td>

                        <td className="max-w-[260px] px-3 py-3 text-sm font-medium text-slate-500">
                          <p className="line-clamp-2">
                            {releve.commentaire || '-'}
                          </p>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            disabled={deletingReleveId === releve.idReleveMesure}
                            onClick={() => handleDeleteReleve(releve)}
                            className="rounded-xl border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-[#0b3d4f]">
          {icon}
        </div>

        <h2 className="text-xl font-black text-slate-950">{title}</h2>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-900">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      {children}
    </label>
  );
}

function InfoGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="border-b border-slate-100 pb-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

function SmallSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="font-black text-slate-900">{value}</span>
    </div>
  );
}

function MiniLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}

function ParameterBox({
  title,
  lines,
}: {
  title: string;
  lines: Array<[string, ReactNode]>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      <div className="mt-4 space-y-3">
        {lines.map(([label, value]) => (
          <MiniLine key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type?: string | null }) {
  if (type === 'COMPTEUR') {
    return (
      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
        Compteur
      </span>
    );
  }

  if (type === 'CONDITIONNEL') {
    return (
      <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
        Conditionnel
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
      -
    </span>
  );
}

function StatusBadge({ actif }: { actif: boolean }) {
  return actif ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
      <CheckCircle2 size={13} />
      Actif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
      <XCircle size={13} />
      Inactif
    </span>
  );
}

function getAssociationLabel(point: PointMesure) {
  if (point.materiel) {
    return [
      point.materiel.code || `Matériel #${point.idMateriel}`,
      point.materiel.numeroSerie ? `Série ${point.materiel.numeroSerie}` : null,
    ]
      .filter(Boolean)
      .join(' — ');
  }

  if (point.point_structure) {
    return [
      point.point_structure.code || `Point #${point.idPointStructure}`,
      point.point_structure.libelle || null,
      point.point_structure.typePoint || null,
    ]
      .filter(Boolean)
      .join(' — ');
  }

  return '-';
}

function FileIcon() {
  return <Server size={20} />;
}