'use client';

import { useState } from 'react';

import { createPlanPreventifPredefini } from '../services/plan-preventif-predefini.service';

type UsePlanPreventifPredefiniFormOptions = {
  onSuccess?: () => void;
};

type FormValues = {
  code: string;
  libelle: string;
  etat: string;
  organisation: string;
  typeDeclenchement: string;
  idModele: string;
  actif: boolean;
};

const initialValues: FormValues = {
  code: '',
  libelle: '',
  etat: 'ACTIF',
  organisation: 'BMT',
  typeDeclenchement: 'AUTOMATIQUE',
  idModele: '',
  actif: true,
};

export function usePlanPreventifPredefiniForm(
  options?: UsePlanPreventifPredefiniFormOptions,
) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!values.code.trim()) {
      setError('Le code est obligatoire.');
      setSuccess(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await createPlanPreventifPredefini({
        code: values.code.trim(),
        libelle: values.libelle.trim() || undefined,
        etat: values.etat || undefined,
        organisation: values.organisation.trim() || undefined,
        typeDeclenchement: values.typeDeclenchement || undefined,
        idModele: values.idModele ? Number(values.idModele) : undefined,
        actif: values.actif,
      });

      setSuccess('Plan préventif prédéfini créé avec succès.');

      if (options?.onSuccess) {
        options.onSuccess();
      } else {
        setValues(initialValues);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création du plan préventif prédéfini.',
      );
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  }

  return {
    values,
    saving,
    error,
    success,
    setField,
    handleSubmit,
  };
}