'use client';

import { useEffect, useMemo, useState } from 'react';

import { deleteGamme, getGammes } from '../services/gamme.service';
import type { Gamme } from '../types/gamme.types';

export function useGammes() {
  const [gammes, setGammes] = useState<Gamme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  async function fetchGammes() {
    try {
      setLoading(true);
      setError(null);
      const data = await getGammes();
      setGammes(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des gammes.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGammes();
  }, []);

  async function handleDeleteGamme(idGamme: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette gamme ?',
    );

    if (!confirmed) return;

    try {
      await deleteGamme(idGamme);
      await fetchGammes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression de la gamme.',
      );
    }
  }

  const filteredGammes = useMemo(() => {
    const term = search.trim().toLowerCase();

    let result = gammes.filter((gamme) => {
      if (!term) return true;

      return (
        gamme.libelle?.toLowerCase().includes(term) ||
        gamme.code?.toLowerCase().includes(term) ||
        gamme.typeMaintenance?.toLowerCase().includes(term) ||
        gamme.organisation?.toLowerCase().includes(term) ||
        gamme.etat?.toLowerCase().includes(term)
      );
    });

    switch (filter) {
      case 'PREVENTIF':
        result = result.filter(
          (gamme) =>
            gamme.typeMaintenance?.toLowerCase() === 'preventif' ||
            gamme.typeMaintenance?.toLowerCase() === 'préventif',
        );
        break;

      case 'CORRECTIF':
        result = result.filter(
          (gamme) => gamme.typeMaintenance?.toLowerCase() === 'correctif',
        );
        break;

      case 'ACTIF':
        result = result.filter((gamme) => gamme.actif === true);
        break;

      case 'INACTIF':
        result = result.filter((gamme) => gamme.actif === false);
        break;

      case 'BROUILLON':
        result = result.filter(
          (gamme) => gamme.etat?.toLowerCase() === 'brouillon',
        );
        break;

      case 'VALIDE':
        result = result.filter(
          (gamme) => gamme.etat?.toLowerCase() === 'valide',
        );
        break;

      default:
        break;
    }

    return result;
  }, [gammes, search, filter]);

  return {
    loading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    filteredGammes,
    handleDeleteGamme,
  };
}