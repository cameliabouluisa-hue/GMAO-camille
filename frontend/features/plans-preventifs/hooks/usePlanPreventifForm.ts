'use client';

import { useEffect, useState } from 'react';

import {
  createPlanPreventif,
  getMaterielsForPlanPreventif,
  getPlanPreventifsPredefinis,
} from '../services/plan-preventif.service';
import type { Materiel, PlanPreventifPredefini } from '../types/plan-preventif.types';

type FormValues = {
  code: string;
  libelle: string;
  etat: string;
  typeDeclenchement: string;
  idMateriel: string;
  idPlanPreventifPredefiniSource: string;
  organisation: string;
  masquerLignesInactives: boolean;
  actif: boolean;
};

type Options = {
  onSuccess?: (idPlanPreventif: number) => void;
};

export function usePlanPreventifForm(options?: Options) {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [plansPredefinis, setPlansPredefinis] = useState<
    PlanPreventifPredefini[]
  >([]);

  const [values, setValues] = useState<FormValues>({
    code: '',
    libelle: '',
    etat: 'ACTIF',
    typeDeclenchement: 'AUTOMATIQUE',
    idMateriel: '',
    idPlanPreventifPredefiniSource: '',
    organisation: 'BMT',
    masquerLignesInactives: true,
    actif: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const [materielsData, plansPredefinisData] = await Promise.all([
        getMaterielsForPlanPreventif(),
        getPlanPreventifsPredefinis(),
      ]);

      setMateriels(materielsData);
      setPlansPredefinis(plansPredefinisData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des données.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function setField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!values.libelle.trim()) {
      setError('Le libellé du plan est obligatoire.');
      return;
    }

    if (!values.idMateriel) {
      setError('Le matériel est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const created = await createPlanPreventif({
        code: values.code.trim() || undefined,
        libelle: values.libelle.trim(),
        etat: values.etat,
        typeDeclenchement: values.typeDeclenchement,
        idMateriel: Number(values.idMateriel),
        idPlanPreventifPredefiniSource: values.idPlanPreventifPredefiniSource
          ? Number(values.idPlanPreventifPredefiniSource)
          : undefined,
        organisation: values.organisation.trim() || 'BMT',
        masquerLignesInactives: values.masquerLignesInactives,
        actif: values.actif,
      });

      options?.onSuccess?.(created.idPlanPreventif);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création du plan préventif.',
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    materiels,
    plansPredefinis,
    values,
    loading,
    saving,
    error,
    setField,
    handleSubmit,
  };
}