'use client';

import { useState } from 'react';

import { createGamme } from '../services/gamme.service';

type GammeFormValues = {
  code: string;
  libelle: string;
  typeMaintenance: string;
  etat: string;
  organisation: string;
  jourFin: string;
  chargePrevue: string;
  tempsArret: string;
  receptionTravaux: boolean;
  actif: boolean;
};

type UseGammeFormOptions = {
  onSuccess?: () => void;
};

export function useGammeForm(options?: UseGammeFormOptions) {
  const [values, setValues] = useState<GammeFormValues>({
    code: '',
    libelle: '',
    typeMaintenance: '',
    etat: '',
    organisation: '',
    jourFin: '',
    chargePrevue: '',
    tempsArret: '',
    receptionTravaux: false,
    actif: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function setField<K extends keyof GammeFormValues>(
    field: K,
    value: GammeFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!values.libelle.trim()) {
      setError('Le libellé de la gamme est obligatoire.');
      setSuccess(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await createGamme({
        code: values.code.trim() || undefined,
        libelle: values.libelle.trim(),
        typeMaintenance: values.typeMaintenance || undefined,
        etat: values.etat || undefined,
        organisation: values.organisation.trim() || undefined,
        jourFin: values.jourFin ? Number(values.jourFin) : undefined,
        chargePrevue: values.chargePrevue
          ? Number(values.chargePrevue)
          : undefined,
        tempsArret: values.tempsArret ? Number(values.tempsArret) : undefined,
        receptionTravaux: values.receptionTravaux,
        actif: values.actif,
      });

      setSuccess('La gamme a été ajoutée avec succès.');

      setValues({
        code: '',
        libelle: '',
        typeMaintenance: '',
        etat: '',
        organisation: '',
        jourFin: '',
        chargePrevue: '',
        tempsArret: '',
        receptionTravaux: false,
        actif: true,
      });

      if (options?.onSuccess) {
        setTimeout(() => {
          options.onSuccess?.();
        }, 900);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout de la gamme.",
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