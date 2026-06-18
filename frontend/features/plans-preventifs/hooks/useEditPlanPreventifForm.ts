'use client';

import { useEffect, useState } from 'react';

import {
  getMaterielsForPlanPreventif,
  getPlanPreventifById,
  getPlanPreventifsPredefinis,
  updatePlanPreventif,
} from '../services/plan-preventif.service';
import type { Materiel, PlanPreventif, PlanPreventifPredefini } from '../types/plan-preventif.types';

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
  planId: string;
  onSuccess?: () => void;
};

export function useEditPlanPreventifForm(options: Options) {
  const [plan, setPlan] = useState<PlanPreventif | null>(null);
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
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchData() {
    const id = Number(options.planId);

    if (!options.planId || Number.isNaN(id)) {
      setLoading(false);
      setError('Identifiant du plan invalide.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [planData, materielsData, plansPredefinisData] = await Promise.all([
        getPlanPreventifById(id),
        getMaterielsForPlanPreventif(),
        getPlanPreventifsPredefinis(),
      ]);

      setPlan(planData);
      setMateriels(materielsData);
      setPlansPredefinis(plansPredefinisData);

      setValues({
        code: planData.code || '',
        libelle: planData.libelle || '',
        etat: planData.etat || 'ACTIF',
        typeDeclenchement: planData.typeDeclenchement || 'AUTOMATIQUE',
        idMateriel: planData.idMateriel ? String(planData.idMateriel) : '',
        idPlanPreventifPredefiniSource: planData.idPlanPreventifPredefiniSource
          ? String(planData.idPlanPreventifPredefiniSource)
          : '',
        organisation: planData.organisation || 'BMT',
        masquerLignesInactives: planData.masquerLignesInactives ?? true,
        actif: planData.actif ?? true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du plan préventif.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [options.planId]);

  function setField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const id = Number(options.planId);

    if (!values.libelle.trim()) {
      setError('Le libellé du plan est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await updatePlanPreventif(id, {
        code: values.code.trim() || undefined,
        libelle: values.libelle.trim(),
        etat: values.etat,
        typeDeclenchement: values.typeDeclenchement,
        idMateriel: values.idMateriel ? Number(values.idMateriel) : undefined,
        idPlanPreventifPredefiniSource: values.idPlanPreventifPredefiniSource
          ? Number(values.idPlanPreventifPredefiniSource)
          : undefined,
        organisation: values.organisation.trim() || 'BMT',
        masquerLignesInactives: values.masquerLignesInactives,
        actif: values.actif,
      });

      setSuccess('Le plan préventif a été modifié avec succès.');
      await fetchData();
      options.onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la modification du plan préventif.',
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    plan,
    materiels,
    plansPredefinis,
    values,
    loading,
    saving,
    error,
    success,
    setField,
    handleSubmit,
    refetch: fetchData,
  };
}