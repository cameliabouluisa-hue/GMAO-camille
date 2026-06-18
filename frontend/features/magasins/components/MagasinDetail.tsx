

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import {
  CalendarClock,
  Check,
  CheckCircle2,
  ListTree,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Warehouse,
  X,
  XCircle,
} from 'lucide-react';

import {
  AppBadge,
  AppFieldGrid,
  AppReadField,
  AppSection,
  appInputClassName,
} from '@/components/app-section-layout';

import {
  createEmplacementMagasin,
  deleteEmplacementMagasin,
  getEmplacementsByMagasin,
  updateEmplacementMagasin,
} from '@/features/magasins/services/magasin.service';

import type {
  EmplacementMagasin,
  Magasin,
} from '@/features/magasins/types/magasin';

export type MagasinDetail = Magasin;

type Props = {
  magasin: MagasinDetail;
  refreshing?: boolean;
  onRefresh: () => void | Promise<void>;
  onEdit: () => void;
};

type TabId = 'general' | 'emplacements';

const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: 'general', label: 'Général', icon: <Warehouse size={17} /> },
  { id: 'emplacements', label: 'Emplacements', icon: <ListTree size={17} /> },
];

type EmplacementForm = {
  code: string;
  libelle: string;
  actif: boolean;
};

const emptyForm: EmplacementForm = {
  code: '',
  libelle: '',
  actif: true,
};

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== '';
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function MagasinDetailCard({
  magasin,
  refreshing = false,
  onRefresh,
  onEdit,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const [emplacements, setEmplacements] = useState<EmplacementMagasin[]>(
    magasin.emplacements ?? [],
  );

  const [loadingEmplacements, setLoadingEmplacements] = useState(false);
  const [savingEmplacement, setSavingEmplacement] = useState(false);
  const [emplacementError, setEmplacementError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmplacementMagasin | null>(null);
  const [form, setForm] = useState<EmplacementForm>(emptyForm);

  const magasinActif = magasin.actif !== false;

  const code = magasin.code || `MAG-${magasin.idMagasin}`;
  const libelle = magasin.libelle || 'Magasin sans libellé';

  const totalEmplacements = emplacements.length;
  const emplacementsActifs = emplacements.filter((item) => item.actif).length;

  useEffect(() => {
    setEmplacements(magasin.emplacements ?? []);
  }, [magasin]);

  async function loadEmplacements() {
    try {
      setLoadingEmplacements(true);
      setEmplacementError('');

      const data = await getEmplacementsByMagasin(magasin.idMagasin);
      setEmplacements(data);
    } catch (error) {
      setEmplacementError(
        error instanceof Error
          ? error.message
          : 'Erreur lors du chargement des emplacements.',
      );
    } finally {
      setLoadingEmplacements(false);
    }
  }

  function openCreateForm() {
    setEditing(null);
    setForm(emptyForm);
    setEmplacementError('');
    setFormOpen(true);
  }

  function openEditForm(emplacement: EmplacementMagasin) {
    setEditing(emplacement);
    setForm({
      code: emplacement.code,
      libelle: emplacement.libelle,
      actif: emplacement.actif,
    });
    setEmplacementError('');
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSaveEmplacement() {
    const payload = {
      code: form.code.trim(),
      libelle: form.libelle.trim(),
      actif: form.actif,
    };

    if (!payload.code || !payload.libelle) {
      setEmplacementError('Le code et le libellé sont obligatoires.');
      return;
    }

    try {
      setSavingEmplacement(true);
      setEmplacementError('');

      if (editing) {
        await updateEmplacementMagasin(editing.idEmplacement, payload);
      } else {
        await createEmplacementMagasin(magasin.idMagasin, payload);
      }

      closeForm();
      await loadEmplacements();
      await onRefresh();
    } catch (error) {
      setEmplacementError(
        error instanceof Error
          ? error.message
          : 'Erreur lors de l’enregistrement de l’emplacement.',
      );
    } finally {
      setSavingEmplacement(false);
    }
  }

  async function handleToggleEmplacement(emplacement: EmplacementMagasin) {
  try {
    setEmplacementError('');

    if (emplacement.actif) {
      await deleteEmplacementMagasin(emplacement.idEmplacement);
    } else {
      await updateEmplacementMagasin(emplacement.idEmplacement, {
        actif: true,
      });
    }

    await loadEmplacements();
    await onRefresh();
  } catch (error) {
    setEmplacementError(
      error instanceof Error
        ? error.message
        : 'Erreur lors du changement d’état de l’emplacement.',
    );
  }
}

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-[#06475a] to-[#0b5d73] px-6 py-5 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Warehouse size={29} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">
                Fiche magasin
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="min-w-0 break-words text-3xl font-black tracking-tight">
                  {code}
                </h1>

                <AppBadge>{magasinActif ? 'Actif' : 'Inactif'}</AppBadge>
              </div>

              <p className="mt-2 min-w-0 break-words text-sm font-semibold text-white/75">
                {libelle} · {emplacementsActifs} emplacement(s) actif(s)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-bold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                size={16}
                className={refreshing ? 'animate-spin' : ''}
              />
              Actualiser
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#0b3d4f] shadow-sm transition hover:bg-slate-50"
            >
              <Pencil size={16} />
              Modifier
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-black transition',
                  active
                    ? 'bg-white text-[#06475a] shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:bg-white hover:text-slate-900',
                ].join(' ')}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <AppSection title="Généralités">
              <AppFieldGrid>
                <AppReadField label="Code" value={code} />

                <AppReadField label="Libellé" value={libelle} />
<AppReadField
  label="État"
  value={
    magasinActif ? (
      <AppBadge tone="success">Actif</AppBadge>
    ) : (
      <AppBadge tone="danger">Inactif</AppBadge>
    )
  }
/>

                <AppReadField
                  label="Emplacements"
                  value={`${totalEmplacements} emplacement(s), ${emplacementsActifs} actif(s)`}
                />
              </AppFieldGrid>
            </AppSection>

           
          </div>
        )}

        {activeTab === 'emplacements' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">
                  Emplacements du magasin
                </h2>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Liste des emplacements rattachés au magasin.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadEmplacements}
                  disabled={loadingEmplacements}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Actualiser
                </button>

                <button
                  type="button"
                  onClick={openCreateForm}
                  className="rounded-xl bg-[#06475a] px-4 py-2 text-xs font-black text-white transition hover:bg-[#043747]"
                >
                  + Nouvel emplacement
                </button>
              </div>
            </div>

            {emplacementError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
                {emplacementError}
              </div>
            )}

            {formOpen && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">
                      {editing
                        ? 'Modifier emplacement'
                        : 'Nouvel emplacement'}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Exemple : A01, A02, QUAI-RÉCEPTION, DEFAULT.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_2fr_160px]">
                  <input
                    value={form.code}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        code: event.target.value,
                      }))
                    }
                    placeholder="Code"
                    className={appInputClassName}
                  />

                  <input
                    value={form.libelle}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        libelle: event.target.value,
                      }))
                    }
                    placeholder="Libellé"
                    className={appInputClassName}
                  />

                  <select
                    value={form.actif ? 'true' : 'false'}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        actif: event.target.value === 'true',
                      }))
                    }
                    className={appInputClassName}
                  >
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:bg-slate-100"
                  >
                    <X size={15} />
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveEmplacement}
                    disabled={savingEmplacement}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-4 text-xs font-black text-white transition hover:bg-[#043747] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={15} />
                    {savingEmplacement ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}

            <EmplacementsCarlTable
              emplacements={emplacements}
              empty="Aucun emplacement rattaché à ce magasin."
              onEdit={openEditForm}
              onToggle={handleToggleEmplacement}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EmplacementsCarlTable({
  emplacements,
  empty,
  onEdit,
  onToggle,
}: {
  emplacements: EmplacementMagasin[];
  empty: string;
  onEdit: (emplacement: EmplacementMagasin) => void;
  onToggle: (emplacement: EmplacementMagasin) => void;
}) {
  if (emplacements.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center text-sm font-bold text-slate-400">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#06475a] text-white">
              <th className="px-4 py-3 text-left font-black">Code</th>
              <th className="px-4 py-3 text-left font-black">Libellé</th>
              <th className="px-4 py-3 text-left font-black">État</th>
              <th className="px-4 py-3 text-right font-black">Actions</th>
            </tr>
          </thead>

          <tbody>
            {emplacements.map((emplacement, index) => (
              <tr
                key={emplacement.idEmplacement}
                className={[
                  'border-b border-slate-100 transition hover:bg-cyan-50/70',
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50',
                ].join(' ')}
              >
                <td className="px-4 py-3 font-black text-slate-900">
                  {emplacement.code || `EMP-${emplacement.idEmplacement}`}
                </td>

                <td className="px-4 py-3 font-semibold text-slate-700">
                  {emplacement.libelle || '—'}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-xs font-black',
                      emplacement.actif
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500',
                    ].join(' ')}
                  >
                    {emplacement.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(emplacement)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggle(emplacement)}
                      className={[
                        'inline-flex h-9 w-9 items-center justify-center rounded-xl border transition',
                        emplacement.actif
                          ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100'
                          : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                      ].join(' ')}
                      title={emplacement.actif ? 'Désactiver' : 'Réactiver'}
                    >
                      {emplacement.actif ? (
                        <Trash2 size={16} />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}