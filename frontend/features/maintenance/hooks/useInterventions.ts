'use client';

import { useEffect, useState } from 'react';

import {
  getInterventions,
  getInterventionsByEtat,
  getInterventionsByType,
} from '../services/maintenance.service';
import type { Intervention } from '../types/maintenance.types';

type InterventionFilter = {
  typeMaintenance: string;
  etat: string;
};

export function useInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [filters, setFilters] = useState<InterventionFilter>({
    typeMaintenance: 'TOUS',
    etat: 'TOUS',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchInterventions(nextFilters = filters) {
    try {
      setLoading(true);
      setError(null);

      let data: Intervention[];

      if (nextFilters.typeMaintenance !== 'TOUS') {
        data = await getInterventionsByType(nextFilters.typeMaintenance);
      } else if (nextFilters.etat !== 'TOUS') {
        data = await getInterventionsByEtat(nextFilters.etat);
      } else {
        data = await getInterventions();
      }

      if (
        nextFilters.typeMaintenance !== 'TOUS' &&
        nextFilters.etat !== 'TOUS'
      ) {
        data = data.filter((intervention) => intervention.etat === nextFilters.etat);
      }

      setInterventions(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des interventions.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInterventions();
  }, []);

  function setTypeMaintenance(typeMaintenance: string) {
    const nextFilters = {
      ...filters,
      typeMaintenance,
    };

    setFilters(nextFilters);
    fetchInterventions(nextFilters);
  }

  function setEtat(etat: string) {
    const nextFilters = {
      ...filters,
      etat,
    };

    setFilters(nextFilters);
    fetchInterventions(nextFilters);
  }

  function resetFilters() {
    const nextFilters = {
      typeMaintenance: 'TOUS',
      etat: 'TOUS',
    };

    setFilters(nextFilters);
    fetchInterventions(nextFilters);
  }

  return {
    interventions,
    filters,
    loading,
    error,
    setTypeMaintenance,
    setEtat,
    resetFilters,
    refetch: () => fetchInterventions(),
  };
}