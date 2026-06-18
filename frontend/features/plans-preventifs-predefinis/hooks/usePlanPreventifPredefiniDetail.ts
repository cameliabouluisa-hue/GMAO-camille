'use client';

import { useEffect, useState } from 'react';

import { getPlanPreventifPredefiniById } from '../services/plan-preventif-predefini.service';
import type { PlanPreventifPredefini } from '../types/plan-preventif-predefini.types';

export function usePlanPreventifPredefiniDetail(id?: number) {
  const [item, setItem] = useState<PlanPreventifPredefini | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    if (!id || Number.isNaN(id)) {
      setError('Identifiant invalide.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getPlanPreventifPredefiniById(id);
      setItem(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du plan préventif prédéfini.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  return {
    item,
    loading,
    error,
    refetch: fetchData,
  };
}