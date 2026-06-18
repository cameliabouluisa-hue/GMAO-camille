'use client';

import { useEffect, useState } from 'react';

import { getGammeById, updateGamme } from '../services/gamme.service';
import type { Gamme } from '../types/gamme.types';

type GammeEditFormValues = {
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

type UseEditGammeFormOptions = {
  gammeId: string;
  onSuccess?: () => void;
};

export function useEditGammeForm(options: UseEditGammeFormOptions) {
  const [gamme, setGamme] = useState<Gamme | null>(null);
  const [values, setValues] = useState<GammeEditFormValues>({
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function refetchGamme() {
    try {
      setLoading(true);
      setError(null);

      const fetchedGamme = await getGammeById(Number(options.gammeId));
      setGamme(fetchedGamme);

      setValues({
        code: fetchedGamme.code || '',
        libelle: fetchedGamme.libelle || '',
        typeMaintenance: fetchedGamme.typeMaintenance || '',
        etat: fetchedGamme.etat || '',
        organisation: fetchedGamme.organisation || '',
        jourFin:
          fetchedGamme.jourFin !== null && fetchedGamme.jourFin !== undefined
            ? String(fetchedGamme.jourFin)
            : '',
        chargePrevue:
          fetchedGamme.chargePrevue !== null &&
          fetchedGamme.chargePrevue !== undefined
            ? String(fetchedGamme.chargePrevue)
            : '',
        tempsArret:
          fetchedGamme.tempsArret !== null &&
          fetchedGamme.tempsArret !== undefined
            ? String(fetchedGamme.tempsArret)
            : '',
        receptionTravaux: fetchedGamme.receptionTravaux ?? false,
        actif: fetchedGamme.actif ?? true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement de la gamme.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (options.gammeId) {
      refetchGamme();
    }
  }, [options.gammeId]);

  function setField<K extends keyof GammeEditFormValues>(
    field: K,
    value: GammeEditFormValues[K],
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

      await updateGamme(Number(options.gammeId), {
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

      setSuccess('La gamme a été mise à jour avec succès.');
      await refetchGamme();

      if (options.onSuccess) {
        options.onSuccess?.();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la mise à jour de la gamme.',
      );
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  }

  return {
    gamme,
    values,
    loading,
    saving,
    error,
    success,
    setField,
    handleSubmit,
    refetchGamme,
  };
}