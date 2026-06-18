'use client';

import { useEffect, useState } from 'react';

import { getPlansPreventifs } from '../services/plan-preventif.service';
import type { PlanPreventif } from '../types/plan-preventif.types';

export function usePlansPreventifs() {
  const [plans, setPlans] = useState<PlanPreventif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPlans() {
    try {
      setLoading(true);
      setError(null);

      const data = await getPlansPreventifs();
      setPlans(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des plans préventifs.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
}