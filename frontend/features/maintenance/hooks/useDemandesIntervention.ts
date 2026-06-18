'use client';

import { useEffect, useState } from 'react';

import { getDemandesIntervention } from '../services/maintenance.service';
import type { DemandeIntervention } from '../types/maintenance.types';

export function useDemandesIntervention() {
  const [demandes, setDemandes] = useState<DemandeIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDemandes() {
    try {
      setLoading(true);
      setError(null);

      const data = await getDemandesIntervention();
      setDemandes(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des demandes.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDemandes();
  }, []);

  return {
    demandes,
    loading,
    error,
    refetch: fetchDemandes,
  };
}