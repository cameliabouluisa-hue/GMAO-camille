

import { useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';

import {
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
} from '@/components/app-section-layout';

import { getApiErrorMessage } from '../services/intervention.service';
import type {
  CreateOperationInterventionDto,
  OperationIntervention,
} from '../types/intervention.types';
import { formatNumber } from './InterventionTable';

type Props = {
  canManageOperations: boolean;
  operations?: OperationIntervention[];
  interventionEtat?: string | null;
  loading?: boolean;
  onCreate: (data: CreateOperationInterventionDto) => void | Promise<void>;
  onDelete?: (idOperation: number) => void | Promise<void>;
};

const EMPTY_FORM = {
  ordre: '',
  libelle: '',
  description: '',
  tempsPasse: '',
  obligatoire: false,
};

export function OperationsSection({
  operations = [],
  interventionEtat,
  loading = false,
    canManageOperations,
  onCreate,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const etat = (interventionEtat || '').toUpperCase();

  const canEdit =
  canManageOperations &&
  ['EN_PREPARATION', 'ATTENTE_VALIDATION', 'VALIDEE'].includes(etat);

  async function handleSubmit() {
    if (!form.libelle.trim()) {
      setError('Le libellé de l’opération est obligatoire.');
      return;
    }

    try {
      setError('');

      await onCreate({
        ordre: form.ordre.trim() ? Number(form.ordre) : undefined,
        libelle: form.libelle.trim(),
        description: form.description.trim() || undefined,
        tempsPasse: form.tempsPasse.trim()
          ? Number(form.tempsPasse)
          : undefined,
        obligatoire: form.obligatoire,
      });

      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Impossible d'ajouter l'opération."),
      );
    }
  }

  async function handleDelete(idOperation: number) {
    if (!onDelete) return;

    try {
      setError('');
      await onDelete(idOperation);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Impossible de supprimer l'opération."),
      );
    }
  }

  return (
    <AppSection title="Operations">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-bold text-slate-500">
          Operations saisies manuellement pour cette intervention corrective.
        </p>

        {canEdit && (
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            disabled={loading}
            className={`${appSecondaryButtonClassName} w-fit disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}
            {showForm ? 'Fermer' : 'Ajouter operation'}
          </button>
        )}
      </div>

      {!canEdit && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
          Les opérations ne sont plus modifiables pour une intervention{' '}
          {interventionEtat || 'finalisée'}.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {showForm && canEdit && (
        <div className="mb-5 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
          <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)_140px_150px]">
            <input
              type="number"
              min="0"
              value={form.ordre}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, ordre: event.target.value }))
              }
              className={appInputClassName}
              placeholder="Ordre"
              disabled={loading}
            />

            <input
              type="text"
              value={form.libelle}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, libelle: event.target.value }))
              }
              className={appInputClassName}
              placeholder="Libellé opération"
              disabled={loading}
            />

            <input
              type="number"
              min="0"
              value={form.tempsPasse}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  tempsPasse: event.target.value,
                }))
              }
              className={appInputClassName}
              placeholder="Temps"
              disabled={loading}
            />

            <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700">
              <input
                type="checkbox"
                checked={form.obligatoire}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    obligatoire: event.target.checked,
                  }))
                }
                disabled={loading}
                className="h-4 w-4"
              />
              Obligatoire
            </label>
          </div>

          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
            className={`${appInputClassName} mt-3 min-h-[96px] w-full resize-none py-4`}
            placeholder="Description de l’opération"
            disabled={loading}
          />

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setShowForm(false);
                setError('');
              }}
              disabled={loading}
              className={`${appSecondaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`${appPrimaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Save size={17} />
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              <th className="py-3 pr-4 align-middle">Ordre</th>
              <th className="py-3 pr-4 align-middle">Libelle</th>
              <th className="py-3 pr-4 align-middle">Description</th>
              <th className="py-3 pr-4 align-middle">Temps passe</th>
              <th className="py-3 pr-4 align-middle">Obligatoire</th>
              <th className="py-3 pr-4 text-right align-middle">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {operations.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-sm font-bold text-slate-500"
                >
                  Aucune operation liee a cette intervention.
                </td>
              </tr>
            ) : (
              operations.map((operation) => (
                <tr key={operation.idOperation} className="text-sm">
                  <td className="py-3 pr-4 align-middle font-bold text-slate-700">
                    {operation.ordre ?? '-'}
                  </td>

                  <td className="max-w-[260px] py-3 pr-4 align-middle font-black text-slate-950">
                    <span className="block truncate">
                      {operation.libelle || '-'}
                    </span>
                  </td>

                  <td className="max-w-[420px] py-3 pr-4 align-middle font-semibold text-slate-600">
                    <span className="block truncate">
                      {operation.description || '-'}
                    </span>
                  </td>

                  <td className="py-3 pr-4 align-middle font-bold text-slate-700">
                    {formatNumber(operation.tempsPasse)}
                  </td>

                  <td className="py-3 pr-4 align-middle font-bold text-slate-700">
                    {operation.obligatoire ? 'Oui' : 'Non'}
                  </td>

                  <td className="py-3 pr-4 text-right align-middle">
                    {canEdit && onDelete ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(operation.idOperation)}
                        disabled={loading}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppSection>
  );
}