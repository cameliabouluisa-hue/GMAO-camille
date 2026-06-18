'use client';

import { useEffect, useState } from 'react';

import { deleteGamme, getGammeById } from '../services/gamme.service';
import type { Gamme } from '../types/gamme.types';

type UseGammeDetailOptions = {
  gammeId: string;
  onDeleteSuccess?: () => void;
};

export function useGammeDetail(options: UseGammeDetailOptions) {
  const [gamme, setGamme] = useState<Gamme | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchGamme() {
    try {
      setLoading(true);
      setError(null);
      const data = await getGammeById(Number(options.gammeId));
      setGamme(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement de la gamme.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!options.gammeId) return;
    fetchGamme();
  }, [options.gammeId]);

  async function handleDelete() {
    if (!gamme) return;

    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette gamme ?',
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);

      await deleteGamme(gamme.idGamme);
      options.onDeleteSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression de la gamme.',
      );
    } finally {
      setDeleting(false);
    }
  }

  return {
    gamme,
    loading,
    deleting,
    error,
    handleDelete,
  };
}