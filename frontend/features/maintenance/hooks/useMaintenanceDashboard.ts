'use client';

import { useEffect, useState } from 'react';

import {
  getDemandesDashboard,
  getInterventionsDashboard,
} from '../services/maintenance.service';
import type { MaintenanceDashboardData } from '../types/maintenance.types';

export function useMaintenanceDashboard() {
  const [data, setData] = useState<MaintenanceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [interventionsDashboard, demandesDashboard] = await Promise.all([
        getInterventionsDashboard(),
        getDemandesDashboard(),
      ]);

      setData({
        interventionsDashboard,
        demandesDashboard,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du tableau de bord maintenance.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch: () => fetchDashboard(true),
  };
}