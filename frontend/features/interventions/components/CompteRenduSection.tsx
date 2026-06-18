'use client';

import { useMemo, useState } from 'react';
import {
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSelectClassName,
  appTextareaClassName,
} from '@/components/app-section-layout';

import type {
  CompteRenduIntervention,
  UpsertCompteRenduInterventionDto,
} from '../types/intervention.types';
import { formatDateTime, formatNumber } from './InterventionTable';

type Props = {
  interventionEtat?: string | null;
  compteRendu?: CompteRenduIntervention | null;
  loading?: boolean;
  onSave: (data: UpsertCompteRenduInterventionDto) => void;
};

export function CompteRenduSection({
  interventionEtat,
  compteRendu,
  loading = false,
  onSave,
}: Props) {
  const initialValues = useMemo(
    () => ({
      dateCompteRendu: toDateTimeLocal(compteRendu?.dateCompteRendu),
      saisiPar: compteRendu?.saisiPar ?? 'Admin',
      travauxEffectues: compteRendu?.travauxEffectues ?? '',
      diagnostic: compteRendu?.diagnostic ?? '',
      cause: compteRendu?.cause ?? '',
      remede: compteRendu?.remede ?? '',
      observation: compteRendu?.observation ?? '',
      resultat: compteRendu?.resultat ?? 'REPARE',
      tempsArret: toInputValue(compteRendu?.tempsArret),
      dureeReelle: toInputValue(compteRendu?.dureeReelle),
    }),
    [compteRendu],
  );

  const [values, setValues] = useState(initialValues);
  const canWrite = interventionEtat === 'EN_COURS' || interventionEtat === 'TERMINE';

  function updateValue(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSave({
      dateCompteRendu: localDateToIso(values.dateCompteRendu),
      saisiPar: values.saisiPar || undefined,
      travauxEffectues: values.travauxEffectues || undefined,
      diagnostic: values.diagnostic || undefined,
      cause: values.cause || undefined,
      remede: values.remede || undefined,
      observation: values.observation || undefined,
      resultat: values.resultat || undefined,
      tempsArret: parseOptionalNumber(values.tempsArret),
      dureeReelle: parseOptionalNumber(values.dureeReelle),
    });
  }

  return (
    <AppSection title="Compte rendu">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Info label="Derniere saisie" value={formatDateTime(compteRendu?.dateCompteRendu)} />
        <Info label="Saisi par" value={compteRendu?.saisiPar || '-'} />
        <Info label="Duree reelle" value={`${formatNumber(compteRendu?.dureeReelle)} h`} />
      </div>

      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <input
          type="datetime-local"
          value={values.dateCompteRendu}
          onChange={(event) => updateValue('dateCompteRendu', event.target.value)}
          className={appInputClassName}
          disabled={!canWrite || loading}
        />
        <input
          value={values.saisiPar}
          onChange={(event) => updateValue('saisiPar', event.target.value)}
          className={appInputClassName}
          placeholder="Saisi par"
          disabled={!canWrite || loading}
        />
        <select
          value={values.resultat}
          onChange={(event) => updateValue('resultat', event.target.value)}
          className={appSelectClassName}
          disabled={!canWrite || loading}
        >
          <option value="REPARE">Repare</option>
          <option value="NON_REPARE">Non repare</option>
          <option value="PARTIEL">Partiel</option>
        </select>
        <input
          type="number"
          step="0.01"
          value={values.dureeReelle}
          onChange={(event) => updateValue('dureeReelle', event.target.value)}
          className={appInputClassName}
          placeholder="Duree reelle"
          disabled={!canWrite || loading}
        />
        <input
          type="number"
          step="0.01"
          value={values.tempsArret}
          onChange={(event) => updateValue('tempsArret', event.target.value)}
          className={appInputClassName}
          placeholder="Temps arret"
          disabled={!canWrite || loading}
        />
        <input
          value={values.cause}
          onChange={(event) => updateValue('cause', event.target.value)}
          className={appInputClassName}
          placeholder="Cause"
          disabled={!canWrite || loading}
        />
        <input
          value={values.remede}
          onChange={(event) => updateValue('remede', event.target.value)}
          className={appInputClassName}
          placeholder="Remede"
          disabled={!canWrite || loading}
        />
        <textarea
          value={values.diagnostic}
          onChange={(event) => updateValue('diagnostic', event.target.value)}
          className={appTextareaClassName}
          placeholder="Diagnostic"
          disabled={!canWrite || loading}
        />
        <textarea
          value={values.travauxEffectues}
          onChange={(event) =>
            updateValue('travauxEffectues', event.target.value)
          }
          className={appTextareaClassName}
          placeholder="Travaux effectues"
          disabled={!canWrite || loading}
        />
        <textarea
          value={values.observation}
          onChange={(event) => updateValue('observation', event.target.value)}
          className={`${appTextareaClassName} md:col-span-2`}
          placeholder="Observation"
          disabled={!canWrite || loading}
        />
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!canWrite || loading}
            className={appPrimaryButtonClassName}
          >
            Enregistrer le compte rendu
          </button>
        </div>
      </form>
    </AppSection>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <div className="mt-2 text-sm font-black text-slate-950">
        {value || '-'}
      </div>
    </div>
  );
}

function toInputValue(value?: number | string | null) {
  return value === null || value === undefined ? '' : String(value);
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function localDateToIso(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}
