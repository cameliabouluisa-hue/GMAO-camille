'use client';

import { useEffect, useState } from 'react';

import {
  cloturerIntervention,
  getInterventionById,
  realiserIntervention,
} from '../services/maintenance.service';
import type { Intervention } from '../types/maintenance.types';

type UseInterventionDetailOptions = {
  interventionId: string;
};

export function useInterventionDetail(options: UseInterventionDetailOptions) {
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchIntervention() {
    const id = Number(options.interventionId);

    if (!options.interventionId || Number.isNaN(id)) {
      setLoading(false);
      setError("Identifiant d'OT invalide.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getInterventionById(id);
      setIntervention(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du détail de l'OT.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRealiser() {
    const id = Number(options.interventionId);

    if (Number.isNaN(id)) {
      setError("Identifiant d'OT invalide.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const updatedIntervention = await realiserIntervention(id);

      setIntervention(updatedIntervention);
      setSuccess("L'OT a été marqué comme réalisé.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la réalisation de l'OT.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCloturer() {
    const id = Number(options.interventionId);

    if (Number.isNaN(id)) {
      setError("Identifiant d'OT invalide.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const updatedIntervention = await cloturerIntervention(
        id,
        'Chef Equipe A',
      );

      setIntervention(updatedIntervention);
      setSuccess("L'OT a été clôturé avec succès.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la clôture de l'OT.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    fetchIntervention();
  }, [options.interventionId]);

  return {
    intervention,
    loading,
    actionLoading,
    error,
    success,
    refetch: fetchIntervention,
    handleRealiser,
    handleCloturer,
  };
}