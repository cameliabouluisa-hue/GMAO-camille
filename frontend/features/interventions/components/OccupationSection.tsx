'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

import { Select } from '@/components/select';
import {
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
} from '@/components/app-section-layout';

import { getApiErrorMessage } from '../services/intervention.service';
import type {
  AffectationTechnicien,
  CreateOccupationInterventionDto,
  OccupationIntervention,
  OperationIntervention,
} from '../types/intervention.types';
import { formatDateTime, formatNumber } from './InterventionTable';

type Props = {
  interventionEtat?: string | null;
  occupations?: OccupationIntervention[];
  affectations?: AffectationTechnicien[];
  operations?: OperationIntervention[];
  loading?: boolean;
  onCreate: (data: CreateOccupationInterventionDto) => void | Promise<void>;
  onDelete: (idOccupation: number) => void | Promise<void>;
};

type SelectItem = {
  label: string;
  value: string;
};

const EMPTY_SELECT_VALUE = '__EMPTY_VALUE__';

const EMPTY_FORM = {
  idTechnicien: '',
  idOperation: '',
  dateOccupation: '',
  duree: '',
  natureOccupation: 'NORMAL',
  typeHoraire: 'JOURNEE',
  commentaire: '',
};

export function OccupationSection({
  interventionEtat,
  occupations = [],
  affectations = [],
  operations = [],
  loading = false,
  onCreate,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const etat = (interventionEtat || '').toUpperCase();
  const canCreate = etat === 'EN_COURS';

  const techniciensAffectes = affectations
    .map((affectation) => affectation.technicien)
    .filter(Boolean);

  const technicienItems: SelectItem[] = techniciensAffectes.map(
    (technicien) => ({
      value: String(technicien!.idTechnicien),
      label:
        [technicien!.nom, technicien!.matricule].filter(Boolean).join(' - ') ||
        `Technicien #${technicien!.idTechnicien}`,
    }),
  );

  const operationItems: SelectItem[] = operations.map((operation) => ({
    value: String(operation.idOperation),
    label:
      [
        operation.ordre ? `#${operation.ordre}` : null,
        operation.libelle,
      ]
        .filter(Boolean)
        .join(' - ') || `Opération #${operation.idOperation}`,
  }));

  async function handleSubmit() {
    if (!form.idTechnicien) {
      setError('Veuillez sélectionner un technicien affecté à cette OT.');
      return;
    }

    if (!form.dateOccupation) {
      setError('Veuillez saisir la date d’occupation.');
      return;
    }

    const duree = parseOptionalNumber(form.duree);

    if (!duree || duree <= 0) {
      setError('Veuillez saisir une durée valide.');
      return;
    }

    try {
      setError('');

      await onCreate({
        idTechnicien: Number(form.idTechnicien),
        idOperation: form.idOperation ? Number(form.idOperation) : undefined,
        dateOccupation: form.dateOccupation,
        duree,
        natureOccupation: form.natureOccupation,
        typeHoraire: form.typeHoraire,
        commentaire: form.commentaire.trim() || undefined,
      });

      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Impossible d'ajouter l'occupation."),
      );
    }
  }

  async function executeDelete(idOccupation: number) {
    try {
      setError('');
      await onDelete(idOccupation);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Impossible de supprimer l'occupation."),
      );
    }
  }

  return (
    <AppSection title="Occupations">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-bold text-slate-500">
          Saisie du temps réel passé par les techniciens affectés.
          Autorisée uniquement en EN_COURS.
        </p>

        {canCreate && (
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            disabled={loading}
            className={`${appSecondaryButtonClassName} w-fit disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}
            {showForm ? 'Fermer' : 'Ajouter occupation'}
          </button>
        )}
      </div>

      {!canCreate && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500">
          Les occupations sont saisies uniquement lorsque l’OT est en cours.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {showForm && canCreate && (
        <div className="mb-5 rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_180px_130px_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <SelectControl
              value={form.idTechnicien}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  idTechnicien: value,
                }))
              }
              disabled={loading}
              placeholder="Sélectionner un technicien"
              clearLabel="Sélectionner un technicien affecté"
              items={technicienItems}
            />

            <SelectControl
              value={form.idOperation}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  idOperation: value,
                }))
              }
              disabled={loading}
              placeholder="Opération optionnelle"
              clearLabel="Opération optionnelle"
              items={operationItems}
            />

            <input
              type="datetime-local"
              value={form.dateOccupation}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  dateOccupation: event.target.value,
                }))
              }
              disabled={loading}
              className={`${appInputClassName} min-w-0`}
            />

            <input
              type="text"
              inputMode="decimal"
              value={form.duree}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  duree: event.target.value,
                }))
              }
              disabled={loading}
              className={`${appInputClassName} min-w-0`}
              placeholder="Durée h"
            />

            <SelectControl
              value={form.natureOccupation}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  natureOccupation: value,
                }))
              }
              disabled={loading}
              placeholder="Nature"
              items={[
                { value: 'NORMAL', label: 'Normal' },
                { value: 'DEPANNAGE', label: 'Dépannage' },
                { value: 'DEPLACEMENT', label: 'Déplacement' },
                { value: 'CONTROLE', label: 'Contrôle' },
              ]}
            />

            <SelectControl
              value={form.typeHoraire}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  typeHoraire: value,
                }))
              }
              disabled={loading}
              placeholder="Type horaire"
              items={[
                { value: 'JOURNEE', label: 'Journée' },
                { value: 'NUIT', label: 'Nuit' },
                { value: 'HEURE_SUP', label: 'Heure supplémentaire' },
              ]}
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`${appPrimaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Ajouter
            </button>

            <input
              type="text"
              value={form.commentaire}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  commentaire: event.target.value,
                }))
              }
              disabled={loading}
              className={`${appInputClassName} min-w-0 md:col-span-2 xl:col-span-7`}
              placeholder="Commentaire"
            />
          </div>

          {techniciensAffectes.length === 0 && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Aucun technicien n’est affecté à cette intervention.
              Affectez d’abord les techniciens avant de saisir les occupations.
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left">
            <thead>
              <tr className="bg-[#06475a] text-sm font-black text-white">
                <th className="px-5 py-4 align-middle">Date</th>
                <th className="px-5 py-4 align-middle">Technicien</th>
                <th className="px-5 py-4 align-middle">Opération</th>
                <th className="px-5 py-4 align-middle">Durée</th>
                <th className="px-5 py-4 align-middle">Nature</th>
                <th className="px-5 py-4 align-middle">Type horaire</th>
                <th className="px-5 py-4 text-right align-middle">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {occupations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-7 text-center text-sm font-bold text-slate-500"
                  >
                    Aucune occupation saisie pour cette intervention.
                  </td>
                </tr>
              ) : (
                occupations.map((occupation) => (
                  <tr key={occupation.idOccupation} className="text-sm">
                    <td className="px-5 py-4 align-middle font-bold text-slate-700">
                      {formatDateTime(occupation.dateOccupation)}
                    </td>

                    <td className="max-w-[220px] px-5 py-4 align-middle font-black text-slate-950">
                      <span className="block truncate">
                        {occupation.technicien?.nom ||
                          occupation.idTechnicien ||
                          '-'}
                      </span>
                    </td>

                    <td className="max-w-[260px] px-5 py-4 align-middle font-bold text-slate-700">
                      <span className="block truncate">
                        {occupation.operation?.libelle ||
                          occupation.idOperation ||
                          '-'}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle font-bold text-slate-700">
                      {formatNumber(occupation.duree)} h
                    </td>

                    <td className="px-5 py-4 align-middle font-bold text-slate-700">
                      {occupation.natureOccupation || '-'}
                    </td>

                    <td className="px-5 py-4 align-middle font-bold text-slate-700">
                      {occupation.typeHoraire || '-'}
                    </td>

                    <td className="px-5 py-4 text-right align-middle">
                      {canCreate ? (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDeleteId(occupation.idOccupation)
                          }
                          disabled={loading}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Supprimer l’occupation"
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
      </div>

      {confirmDeleteId !== null && (
        <ConfirmDialog
          title="Supprimer l’occupation"
          message="Voulez-vous supprimer cette occupation ?"
          confirmLabel="Supprimer"
          loading={loading}
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => executeDelete(confirmDeleteId)}
        />
      )}
    </AppSection>
  );
}

function SelectControl({
  value,
  onChange,
  placeholder,
  clearLabel,
  items,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearLabel?: string;
  items: SelectItem[];
  disabled?: boolean;
}) {
  const normalizedValue = value || EMPTY_SELECT_VALUE;

  const normalizedItems = clearLabel
    ? [{ value: EMPTY_SELECT_VALUE, label: clearLabel }, ...items]
    : items;

  if (disabled) {
    return (
      <div className="flex h-11 w-full min-w-0 items-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400">
        <span className="truncate">{clearLabel || placeholder}</span>
      </div>
    );
  }

  return (
    <Select
      value={normalizedValue}
      onValueChange={(nextValue) =>
        onChange(nextValue === EMPTY_SELECT_VALUE ? '' : nextValue)
      }
      placeholder={placeholder}
      items={normalizedItems}
    />
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-lg font-black text-slate-950">{title}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap justify-end gap-3 px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function parseOptionalNumber(value: string) {
  const normalized = value.trim().replace(',', '.');

  if (!normalized) return undefined;

  const number = Number(normalized);

  return Number.isFinite(number) ? number : undefined;
}