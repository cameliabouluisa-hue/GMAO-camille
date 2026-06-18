'use client';

import { useEffect, useState } from 'react';

import {
  generateOtCorrectiveFromDemande,
  getDemandeInterventionById,
  getGammesForMaintenance,
  refuserDemandeIntervention,
  validerDemandeIntervention,
} from '../services/maintenance.service';
import type {
  DemandeIntervention,
  Gamme,
  Intervention,
} from '../types/maintenance.types';

type Options = {
  demandeId: string;
};

export function useDemandeInterventionDetail(options: Options) {
  const [demande, setDemande] = useState<DemandeIntervention | null>(null);
  const [gammes, setGammes] = useState<Gamme[]>([]);
  const [selectedGammeId, setSelectedGammeId] = useState('');
  const [generatedIntervention, setGeneratedIntervention] =
    useState<Intervention | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchData() {
    const id = Number(options.demandeId);

    if (!options.demandeId || Number.isNaN(id)) {
      setLoading(false);
      setError('Identifiant DI invalide.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [demandeData, gammesData] = await Promise.all([
        getDemandeInterventionById(id),
        getGammesForMaintenance(),
      ]);

      setDemande(demandeData);
      setGammes(gammesData);

      if (demandeData.intervention && demandeData.intervention.length > 0) {
        setGeneratedIntervention(demandeData.intervention[0]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement de la DI.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleValider() {
    const id = Number(options.demandeId);

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const updated = await validerDemandeIntervention(
        id,
        'Responsable maintenance',
      );

      setDemande(updated);
      setSuccess('La demande a été validée.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la validation de la DI.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRefuser() {
    const id = Number(options.demandeId);
    const motif = window.prompt('Motif du refus ?');

    if (!motif) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const updated = await refuserDemandeIntervention(
        id,
        'Responsable maintenance',
        motif,
      );

      setDemande(updated);
      setSuccess('La demande a été refusée.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du refus de la DI.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleGenerateOt() {
    const id = Number(options.demandeId);

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const result = await generateOtCorrectiveFromDemande(id, {
        idGamme: selectedGammeId ? Number(selectedGammeId) : undefined,
        createdBy: 'Responsable maintenance',
      });

      setGeneratedIntervention(result.intervention);
      setSuccess(result.message || 'OT correctif généré avec succès.');

      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la génération de l'OT correctif.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [options.demandeId]);

  return {
    demande,
    gammes,
    selectedGammeId,
    generatedIntervention,
    loading,
    actionLoading,
    error,
    success,
    setSelectedGammeId,
    refetch: fetchData,
    handleValider,
    handleRefuser,
    handleGenerateOt,
  };
}