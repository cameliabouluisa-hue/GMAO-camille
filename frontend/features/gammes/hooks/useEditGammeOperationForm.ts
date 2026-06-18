'use client';

import { useEffect, useState } from 'react';

import { getGammeById, updateGammeOperation } from '../services/gamme.service';
import type { GammeOperation } from '../types/gamme.types';

type GammeOperationEditValues = {
  ordre: string;
  libelle: string;
  description: string;
  tempsStandard: string;
  obligatoire: boolean;
};

type UseEditGammeOperationFormOptions = {
  gammeId: string;
  operationId: string;
  onSuccess?: () => void;
};

export function useEditGammeOperationForm(
  options: UseEditGammeOperationFormOptions,
) {
  const [values, setValues] = useState<GammeOperationEditValues>({
    ordre: '',
    libelle: '',
    description: '',
    tempsStandard: '',
    obligatoire: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOperation() {
      try {
        setLoading(true);
        setError(null);

        const gamme = await getGammeById(Number(options.gammeId));
        const operation = gamme.gamme_operation?.find(
          (op) => op.idOperation === Number(options.operationId),
        );

        if (!operation) {
          throw new Error('Opération introuvable.');
        }

        setValues({
          ordre:
            operation.ordre !== null && operation.ordre !== undefined
              ? String(operation.ordre)
              : '',
          libelle: operation.libelle || '',
          description: operation.description || '',
          tempsStandard:
            operation.tempsStandard !== null &&
            operation.tempsStandard !== undefined
              ? String(operation.tempsStandard)
              : '',
          obligatoire: operation.obligatoire ?? false,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement de l'opération.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (options.gammeId && options.operationId) {
      fetchOperation();
    }
  }, [options.gammeId, options.operationId]);

  function setField<K extends keyof GammeOperationEditValues>(
    field: K,
    value: GammeOperationEditValues[K],
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

      await updateGammeOperation(Number(options.operationId), {
        ordre: values.ordre ? Number(values.ordre) : undefined,
        libelle: values.libelle.trim(),
        description: values.description.trim() || undefined,
        tempsStandard: values.tempsStandard
          ? Number(values.tempsStandard)
          : undefined,
        obligatoire: values.obligatoire,
      });

      setSuccess("L'opération a été mise à jour avec succès.");

      if (options.onSuccess) {
        setTimeout(() => {
          options.onSuccess?.();
        }, 900);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour de l'opération.",
      );
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  }

  return {
    values,
    loading,
    saving,
    error,
    success,
    setField,
    handleSubmit,
  };
}