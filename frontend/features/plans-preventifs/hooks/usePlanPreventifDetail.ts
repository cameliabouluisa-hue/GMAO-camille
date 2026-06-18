'use client';

import { useEffect, useState } from 'react';

import {
  deletePlanPreventif,
  generateOtPreventifFromDeclencheur,
  getGammesForPlanPreventif,
  getPlanPreventifById,
  regeneratePlanPreventifDeclencheurs,
} from '../services/plan-preventif.service';
import type { Gamme, PlanPreventif } from '../types/plan-preventif.types';

type Options = {
  planId: string;
  onDeleteSuccess?: () => void;
};

export function usePlanPreventifDetail(options: Options) {
  const [plan, setPlan] = useState<PlanPreventif | null>(null);
  const [gammes, setGammes] = useState<Gamme[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchPlan() {
    const id = Number(options.planId);

    if (!options.planId || Number.isNaN(id)) {
      setLoading(false);
      setError('Identifiant du plan invalide.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [planData, gammesData] = await Promise.all([
        getPlanPreventifById(id),
        getGammesForPlanPreventif(),
      ]);

      setPlan(planData);
      setGammes(gammesData);
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
    fetchPlan();
  }, [options.planId]);

  async function handleDelete() {
    if (!window.confirm('Supprimer ce plan préventif ?')) return;

    const id = Number(options.planId);

    try {
      setDeleting(true);
      setError(null);

      await deletePlanPreventif(id);
      options.onDeleteSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression du plan préventif.',
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleRegenerateDeclencheurs() {
    const id = Number(options.planId);

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      await regeneratePlanPreventifDeclencheurs(id);
      setSuccess('Déclencheurs régénérés avec succès.');
      await fetchPlan();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la régénération des déclencheurs.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleGenerateOt(idDeclencheur: number) {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const result = await generateOtPreventifFromDeclencheur(idDeclencheur);
      setSuccess(result.message || 'OT préventif généré avec succès.');
      await fetchPlan();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la génération de l'OT préventif.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return {
    plan,
    gammes,
    loading,
    deleting,
    actionLoading,
    error,
    success,
    refetch: fetchPlan,
    handleDelete,
    handleRegenerateDeclencheurs,
    handleGenerateOt,
  };
}