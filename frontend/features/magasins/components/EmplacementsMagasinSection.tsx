'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, MapPin, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

import {
  createEmplacementMagasin,
  deleteEmplacementMagasin,
  getEmplacementsByMagasin,
  updateEmplacementMagasin,
} from '../services/magasin.service';
import type {
  CreateEmplacementMagasinDto,
  EmplacementMagasin,
} from '../types/magasin';

type Props = {
  idMagasin: number;
};

type FormState = {
  code: string;
  libelle: string;
  actif: boolean;
};

const initialForm: FormState = {
  code: '',
  libelle: '',
  actif: true,
};

export function EmplacementsMagasinSection({ idMagasin }: Props) {
  const [emplacements, setEmplacements] = useState<EmplacementMagasin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmplacementMagasin | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  async function loadEmplacements() {
    try {
      setLoading(true);
      setError('');
      const data = await getEmplacementsByMagasin(idMagasin);
      setEmplacements(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des emplacements.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (idMagasin) {
      loadEmplacements();
    }
  }, [idMagasin]);

  function openCreateForm() {
    setEditing(null);
    setForm(initialForm);
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  }

  function openEditForm(emplacement: EmplacementMagasin) {
    setEditing(emplacement);
    setForm({
      code: emplacement.code,
      libelle: emplacement.libelle,
      actif: emplacement.actif,
    });
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditing(null);
    setForm(initialForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.code.trim() || !form.libelle.trim()) {
      setError('Le code et le libellé sont obligatoires.');
      return;
    }

    const payload: CreateEmplacementMagasinDto = {
      code: form.code.trim(),
      libelle: form.libelle.trim(),
      actif: form.actif,
    };

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editing) {
        await updateEmplacementMagasin(editing.idEmplacement, payload);
        setSuccess('Emplacement modifié avec succès.');
      } else {
        await createEmplacementMagasin(idMagasin, payload);
        setSuccess('Emplacement ajouté avec succès.');
      }

      closeForm();
      await loadEmplacements();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l’enregistrement de l’emplacement.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActif(emplacement: EmplacementMagasin) {
    try {
      setError('');
      setSuccess('');

      if (emplacement.actif) {
        await deleteEmplacementMagasin(emplacement.idEmplacement);
        setSuccess('Emplacement désactivé avec succès.');
      } else {
        await updateEmplacementMagasin(emplacement.idEmplacement, {
          actif: true,
        });
        setSuccess('Emplacement réactivé avec succès.');
      }

      await loadEmplacements();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du changement d’état de l’emplacement.',
      );
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-8 py-7 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0f3d56]">
            <MapPin size={26} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
              Référentiel stock
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Emplacements du magasin
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Gérez les rayons, zones ou emplacements utilisés dans les mouvements de stock.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f3d56] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0b3044]"
        >
          <Plus size={18} />
          Ajouter un emplacement
        </button>
      </div>

      <div className="px-8 py-6">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        )}

        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="mb-7 rounded-[26px] border border-slate-200 bg-slate-50 p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {editing ? 'Modifier l’emplacement' : 'Nouvel emplacement'}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Exemple : A01, RAYON-01, QUAI-RÉCEPTION, DEFAULT.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                  Code emplacement *
                </label>
                <input
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="Ex : A01"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d56] focus:ring-4 focus:ring-cyan-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                  Libellé *
                </label>
                <input
                  value={form.libelle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      libelle: e.target.value,
                    }))
                  }
                  placeholder="Ex : Rayon A01"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d56] focus:ring-4 focus:ring-cyan-50"
                />
              </div>
            </div>

            <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <span>
                <span className="block text-sm font-black text-slate-950">
                  Emplacement actif
                </span>
                <span className="mt-1 block text-sm font-medium text-slate-500">
                  Un emplacement inactif ne sera pas proposé dans les nouvelles opérations.
                </span>
              </span>

              <input
                type="checkbox"
                checked={form.actif}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    actif: e.target.checked,
                  }))
                }
                className="h-5 w-5 accent-[#0f3d56]"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <X size={17} />
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f3d56] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0b3044] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {saving
                  ? 'Enregistrement...'
                  : editing
                    ? 'Enregistrer'
                    : 'Créer l’emplacement'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
            Chargement des emplacements...
          </div>
        ) : emplacements.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm font-black text-slate-700">
              Aucun emplacement trouvé.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ajoutez au moins un emplacement pour utiliser ce magasin dans les opérations de stock.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-slate-200">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Libellé</th>
                  <th className="px-6 py-4">État</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {emplacements.map((emplacement) => (
                  <tr
                    key={emplacement.idEmplacement}
                    className="bg-white transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5 text-sm font-bold text-slate-500">
                      #{emplacement.idEmplacement}
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-black text-[#0f3d56]">
                        {emplacement.code}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-black text-slate-900">
                      {emplacement.libelle}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${
                          emplacement.actif
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {emplacement.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openEditForm(emplacement)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActif(emplacement)}
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                            emplacement.actif
                              ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100'
                              : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={
                            emplacement.actif
                              ? 'Désactiver'
                              : 'Réactiver'
                          }
                        >
                          {emplacement.actif ? (
                            <Trash2 size={18} />
                          ) : (
                            <Check size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}