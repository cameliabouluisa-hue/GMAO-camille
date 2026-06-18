    'use client';

import { useEffect, useState } from 'react';

import {
  deleteModele,
  getModeleById,
} from '@/features/modeles/services/modele.service';
import type { ModeleApi } from '@/features/modeles/types/modele';

type UseModeleDetailOptions = {
  modeleId: string;
  onDeleteSuccess?: () => void;
};

export function useModeleDetail({
  modeleId,
  onDeleteSuccess,
}: UseModeleDetailOptions) {
  const [modele, setModele] = useState<ModeleApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModeleDetail() {
      try {
        setLoading(true);
        setError(null);

        const data = await getModeleById(modeleId);
        setModele(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    if (modeleId) {
      fetchModeleDetail();
    }
  }, [modeleId]);

  async function handleDelete() {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer ce modèle ?',
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteModele(Number(modeleId));
      onDeleteSuccess?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setDeleting(false);
    }
  }

  return {
    modele,
    loading,
    deleting,
    error,
    handleDelete,
  };
}