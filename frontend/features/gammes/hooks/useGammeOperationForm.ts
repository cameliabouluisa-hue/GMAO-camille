'use client';

import { useState } from 'react';

import { createGammeOperation } from '../services/gamme.service';

type GammeOperationFormValues = {
  ordre: string;
  libelle: string;
  description: string;
  tempsStandard: string;
  obligatoire: boolean;
};

type UseGammeOperationFormOptions = {
  gammeId: string;
  onSuccess?: () => void;
};

export function useGammeOperationForm(
  options: UseGammeOperationFormOptions,
) {
  const [values, setValues] = useState<GammeOperationFormValues>({
    ordre: '',
    libelle: '',
    description: '',
    tempsStandard: '',
    obligatoire: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function setField<K extends keyof GammeOperationFormValues>(
    field: K,
    value: GammeOperationFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!values.libelle.trim()) {
      setError("Le libellé de l'opération est obligatoire.");
      setSuccess(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await createGammeOperation(Number(options.gammeId), {
        ordre: values.ordre ? Number(values.ordre) : undefined,
        libelle: values.libelle.trim(),
        description: values.description.trim() || undefined,
        tempsStandard: values.tempsStandard
          ? Number(values.tempsStandard)
          : undefined,
        obligatoire: values.obligatoire,
      });

      setSuccess("L'opération a été ajoutée avec succès.");

      setValues({
        ordre: '',
        libelle: '',
        description: '',
        tempsStandard: '',
        obligatoire: false,
      });

      if (options.onSuccess) {
        setTimeout(() => {
          options.onSuccess?.();
        }, 900);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout de l'opération.",
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