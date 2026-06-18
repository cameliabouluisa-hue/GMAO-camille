'use client';

import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

import {
  AppFormField,
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
  appTextareaClassName,
} from '@/components/app-section-layout';

import type { GammeOperation } from '../types/gamme.types';

export type GammeOperationDraft = {
  localId?: string;
  idOperation?: number;
  ordre?: number | string | null;
  libelle?: string | null;
  description?: string | null;
  tempsStandard?: number | string | null;
  obligatoire?: boolean | null;
  idGamme?: number | null;
  idPointStructure?: number | null;
  idMateriel?: number | null;
  idModele?: number | null;
  idFamille?: number | null;
};

type OperationFormState = {
  ordre: string;
  libelle: string;
  description: string;
  tempsStandard: string;
  obligatoire: boolean;
};

type Props = {
  operations: GammeOperationDraft[];
  onOperationsChange?: (operations: GammeOperationDraft[]) => void;
  readOnly?: boolean;
  title?: string;
  description?: string;
};

function makeLocalId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getOperationKey(operation: GammeOperationDraft, index: number) {
  if (operation.localId) return operation.localId;
  if (operation.idOperation) return `db-${operation.idOperation}`;

  return `idx-${index}`;
}

function toFormState(operation?: GammeOperationDraft | null): OperationFormState {
  return {
    ordre:
      operation?.ordre !== null && operation?.ordre !== undefined
        ? String(operation.ordre)
        : '',
    libelle: operation?.libelle ?? '',
    description: operation?.description ?? '',
    tempsStandard:
      operation?.tempsStandard !== null && operation?.tempsStandard !== undefined
        ? String(operation.tempsStandard)
        : '',
    obligatoire: Boolean(operation?.obligatoire),
  };
}

function toDraftOperation(
  form: OperationFormState,
  current?: GammeOperationDraft | null,
): GammeOperationDraft {
  return {
    ...current,
    localId: current?.localId ?? makeLocalId(),
    ordre: form.ordre !== '' ? Number(form.ordre) : null,
    libelle: form.libelle.trim() || null,
    description: form.description.trim() || null,
    tempsStandard: form.tempsStandard !== '' ? Number(form.tempsStandard) : null,
    obligatoire: form.obligatoire,
  };
}

function formatBoolean(value?: boolean | null) {
  if (value === true) return 'Oui';
  if (value === false) return 'Non';

  return '—';
}

function formatValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—';

  return String(value);
}

export function normalizeOperations(
  operations?: GammeOperation[] | null,
): GammeOperationDraft[] {
  return (operations ?? []).map((operation) => ({
    ...operation,
    localId: `db-${operation.idOperation}`,
  }));
}

export default function GammeOperationsPanel({
  operations,
  onOperationsChange,
  readOnly = false,
  title = 'Opérations',
  description = 'Liste des opérations définies dans cette gamme.',
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [deleteCandidateKey, setDeleteCandidateKey] = useState<string | null>(
    null,
  );

  const [form, setForm] = useState<OperationFormState>(() => toFormState());

  const sortedOperations = useMemo(() => {
    return [...operations].sort((a, b) => {
      const ordreA = Number(a.ordre ?? 999999);
      const ordreB = Number(b.ordre ?? 999999);

      return ordreA - ordreB;
    });
  }, [operations]);

  const editingOperation = useMemo(() => {
    if (!editingKey) return null;

    return (
      operations.find(
        (operation, index) => getOperationKey(operation, index) === editingKey,
      ) ?? null
    );
  }, [editingKey, operations]);

  function openCreateForm() {
    setForm(toFormState());
    setEditingKey(null);
    setFormOpen(true);
    setDeleteCandidateKey(null);
  }

  function openEditForm(operation: GammeOperationDraft, index: number) {
    setForm(toFormState(operation));
    setEditingKey(getOperationKey(operation, index));
    setFormOpen(true);
    setDeleteCandidateKey(null);
  }

  function closeForm() {
    setForm(toFormState());
    setEditingKey(null);
    setFormOpen(false);
  }

  function updateForm<K extends keyof OperationFormState>(
    key: K,
    value: OperationFormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function saveOperation() {
    if (!form.libelle.trim()) {
      return;
    }

    if (editingKey) {
      const nextOperations = operations.map((operation, index) => {
        const key = getOperationKey(operation, index);

        if (key !== editingKey) return operation;

        return toDraftOperation(form, operation);
      });

      onOperationsChange?.(nextOperations);
      closeForm();
      return;
    }

    const nextOperation = toDraftOperation(form);

    onOperationsChange?.([...operations, nextOperation]);
    closeForm();
  }

  function deleteOperation(operation: GammeOperationDraft, index: number) {
    const key = getOperationKey(operation, index);

    if (deleteCandidateKey !== key) {
      setDeleteCandidateKey(key);
      return;
    }

    const nextOperations = operations.filter(
      (item, itemIndex) => getOperationKey(item, itemIndex) !== key,
    );

    onOperationsChange?.(nextOperations);
    setDeleteCandidateKey(null);

    if (editingKey === key) {
      closeForm();
    }
  }

  return (
    <AppSection title={title}>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">{description}</p>

          {!readOnly && (
            <button
              type="button"
              onClick={formOpen ? closeForm : openCreateForm}
              className={formOpen ? appSecondaryButtonClassName : appPrimaryButtonClassName}
            >
              {formOpen ? (
                <>
                  <X size={17} />
                  Fermer
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Ajouter opération
                </>
              )}
            </button>
          )}
        </div>

        {formOpen && !readOnly && (
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-x-5 md:grid-cols-[160px_minmax(0,1fr)_180px_190px]">
              <AppFormField label="Ordre">
                <input
                  type="number"
                  min="1"
                  value={form.ordre}
                  onChange={(event) => updateForm('ordre', event.target.value)}
                  placeholder="Ex : 1"
                  className={appInputClassName}
                />
              </AppFormField>

              <AppFormField label="Libellé opération" required>
                <input
                  value={form.libelle}
                  onChange={(event) => updateForm('libelle', event.target.value)}
                  placeholder="Ex : Contrôle visuel"
                  className={appInputClassName}
                />
              </AppFormField>

              <AppFormField label="Temps standard">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.tempsStandard}
                  onChange={(event) =>
                    updateForm('tempsStandard', event.target.value)
                  }
                  placeholder="Ex : 1.5"
                  className={appInputClassName}
                />
              </AppFormField>

              <AppFormField label="Obligatoire">
                <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.obligatoire}
                    onChange={(event) =>
                      updateForm('obligatoire', event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Obligatoire
                </label>
              </AppFormField>
            </div>

            <AppFormField label="Description de l’opération">
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateForm('description', event.target.value)
                }
                placeholder="Décrivez l’opération à réaliser..."
                className={appTextareaClassName}
              />
            </AppFormField>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className={appSecondaryButtonClassName}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={saveOperation}
                className={appPrimaryButtonClassName}
              >
                <Save size={17} />
                {editingOperation ? 'Modifier opération' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#06475a]">
                <tr className="text-left text-xs font-black uppercase tracking-[0.18em] text-white">
                  <th className="px-5 py-4">Ordre</th>
                  <th className="px-5 py-4">Libellé</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Temps standard</th>
                  <th className="px-5 py-4">Obligatoire</th>
                  {!readOnly && (
                    <th className="px-5 py-4 text-center">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sortedOperations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={readOnly ? 5 : 6}
                      className="px-5 py-8 text-sm font-black text-slate-500"
                    >
                      Aucune opération trouvée.
                    </td>
                  </tr>
                ) : (
                  sortedOperations.map((operation, index) => {
                    const key = getOperationKey(operation, index);
                    const confirmDelete = deleteCandidateKey === key;

                    return (
                      <tr key={key} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          {formatValue(operation.ordre)}
                        </td>

                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          {formatValue(operation.libelle)}
                        </td>

                        <td className="max-w-[340px] px-5 py-4">
                          <p className="truncate text-sm font-semibold text-slate-600">
                            {formatValue(operation.description)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          {formatValue(operation.tempsStandard)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              'inline-flex rounded-full px-3 py-1 text-xs font-black',
                              operation.obligatoire
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
                            ].join(' ')}
                          >
                            {formatBoolean(operation.obligatoire)}
                          </span>
                        </td>

                        {!readOnly && (
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(operation, index)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
                                title="Modifier"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteOperation(operation, index)}
                                className={[
                                  'inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-black transition',
                                  confirmDelete
                                    ? 'border-red-200 bg-red-600 text-white hover:bg-red-700'
                                    : 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100',
                                ].join(' ')}
                                title="Supprimer"
                              >
                                {confirmDelete ? (
                                  <>
                                    <Check size={16} />
                                    Confirmer
                                  </>
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppSection>
  );
}