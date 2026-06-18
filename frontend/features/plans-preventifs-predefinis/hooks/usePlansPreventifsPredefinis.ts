'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  deletePlanPreventifPredefini,
  getPlansPreventifsPredefinis,
} from '../services/plan-preventif-predefini.service';
import type { PlanPreventifPredefini } from '../types/plan-preventif-predefini.types';

export function usePlansPreventifsPredefinis() {
  const [items, setItems] = useState<PlanPreventifPredefini[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [etat, setEtat] = useState('');
  const [typeDeclenchement, setTypeDeclenchement] = useState('');

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlansPreventifsPredefinis();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des données.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer ce plan préventif prédéfini ?',
    );

    if (!confirmed) return;

    try {
      await deletePlanPreventifPredefini(id);
      setItems((prev) =>
        prev.filter((item) => item.idPlanPreventifPredefini !== id),
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression.',
      );
    }
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchSearch =
        !q ||
        item.code?.toLowerCase().includes(q) ||
        item.titre?.toLowerCase().includes(q) ||
        item.organisation?.toLowerCase().includes(q) ||
        item.typeDeclenchement?.toLowerCase().includes(q) ||
        item.etat?.toLowerCase().includes(q);

      const matchEtat = !etat || item.etat === etat;
      const matchType =
        !typeDeclenchement || item.typeDeclenchement === typeDeclenchement;

      return matchSearch && matchEtat && matchType;
    });
  }, [items, search, etat, typeDeclenchement]);

  const etatsOptions = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.etat).filter(Boolean)),
    ) as string[];
  }, [items]);

  const typesDeclenchementOptions = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.typeDeclenchement).filter(Boolean)),
    ) as string[];
  }, [items]);

  return {
    items,
    filteredItems,
    loading,
    error,
    search,
    setSearch,
    etat,
    setEtat,
    typeDeclenchement,
    setTypeDeclenchement,
    etatsOptions,
    typesDeclenchementOptions,
    handleDelete,
    refetch: fetchData,
  };
}