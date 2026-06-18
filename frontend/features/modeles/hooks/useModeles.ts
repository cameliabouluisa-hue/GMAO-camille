'use client';

import { useEffect, useMemo, useState } from 'react';

import { deleteModele, getModeles } from '@/features/modeles/services/modele.service';
import type { ModeleApi } from '@/features/modeles/types/modele';

export function useModeles() {
  const [modeles, setModeles] = useState<ModeleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [familleId, setFamilleId] = useState('');
  const [etatId, setEtatId] = useState('');

  useEffect(() => {
    async function fetchModeles() {
      try {
        setLoading(true);
        setError(null);

        const data = await getModeles();
        setModeles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    fetchModeles();
  }, []);

  const famillesOptions = useMemo(() => {
    const map = new Map<number, NonNullable<ModeleApi['famille']>>();

    for (const modele of modeles) {
      if (modele.famille?.idFamille != null) {
        map.set(modele.famille.idFamille, modele.famille);
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      (a.libelle || '').localeCompare(b.libelle || ''),
    );
  }, [modeles]);

  const etatsOptions = useMemo(() => {
    const map = new Map<number, NonNullable<ModeleApi['etat_modele']>>();

    for (const modele of modeles) {
      if (modele.etat_modele?.idEtat != null) {
        map.set(modele.etat_modele.idEtat, modele.etat_modele);
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      (a.libelle || '').localeCompare(b.libelle || ''),
    );
  }, [modeles]);

  const filteredModeles = useMemo(() => {
    const term = search.toLowerCase().trim();

    return modeles.filter((modele) => {
      const matchesSearch =
        !term ||
        (modele.code || '').toLowerCase().includes(term) ||
        (modele.libelle || '').toLowerCase().includes(term);

      const matchesFamille =
        !familleId || String(modele.famille?.idFamille || '') === familleId;

      const matchesEtat =
        !etatId || String(modele.etat_modele?.idEtat || '') === etatId;

      return matchesSearch && matchesFamille && matchesEtat;
    });
  }, [modeles, search, familleId, etatId]);

  async function handleDeleteModele(idModele: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer ce modèle ?',
    );

    if (!confirmed) return;

    try {
      await deleteModele(idModele);
      setModeles((prev) => prev.filter((m) => m.idModele !== idModele));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }

  function handleExport() {
    const headers = ['Code', 'Libellé', 'Famille', 'État'];

    const rows = filteredModeles.map((modele) => [
      modele.code || '',
      modele.libelle || '',
      modele.famille?.libelle || '',
      modele.etat_modele?.libelle || '',
    ]);

    const csv = [
      headers.join(';'),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'liste_modeles_bmt.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return {
    loading,
    error,
    search,
    setSearch,
    familleId,
    setFamilleId,
    etatId,
    setEtatId,
    filteredModeles,
    famillesOptions,
    etatsOptions,
    handleDeleteModele,
    handleExport,
  };
}