'use client';

import { useEffect, useMemo, useState } from 'react';

import { deleteFamille, getFamilles } from '@/features/familles/services/famille.service';
import type {
  FamilleApi,
  FamilleFilterType,
  FamilleFlatRow,
  FamilleNode,
} from '@/features/familles/types/famille';
import { buildFamilleTree, flattenTree } from '@/features/familles/utils/famille-tree';

export function useFamilles() {
  const [familles, setFamilles] = useState<FamilleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [showModeles, setShowModeles] = useState<Record<number, boolean>>({});
  const [filterType, setFilterType] = useState<FamilleFilterType>('all');

  useEffect(() => {
    async function fetchFamilles() {
      try {
        setLoading(true);
        setError(null);

        const data = await getFamilles();
        setFamilles(data);

        const initialExpandedState: Record<number, boolean> = {};
        const initialModelesState: Record<number, boolean> = {};

        for (const item of data) {
          initialExpandedState[item.idFamille] = true;
          initialModelesState[item.idFamille] = true;
        }

        setExpanded(initialExpandedState);
        setShowModeles(initialModelesState);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    fetchFamilles();
  }, []);

  const famillesMap = useMemo(() => {
    const map = new Map<number, FamilleApi>();

    for (const famille of familles) {
      map.set(famille.idFamille, famille);
    }

    return map;
  }, [familles]);

  const filteredFamilles = useMemo(() => {
    const term = search.toLowerCase().trim();

    return familles.filter((famille) => {
      const parent = famille.parent_id ? famillesMap.get(famille.parent_id) : null;

      const matchesSearch =
        !term ||
        (famille.code || '').toLowerCase().includes(term) ||
        (famille.libelle || '').toLowerCase().includes(term) ||
        (parent?.libelle || '').toLowerCase().includes(term) ||
        (famille.modele || []).some(
          (m) =>
            (m.libelle || '').toLowerCase().includes(term) ||
            (m.code || '').toLowerCase().includes(term),
        );

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'parents' && famille.parent_id === null) ||
        (filterType === 'withModels' && (famille.modele?.length || 0) > 0);

      return matchesSearch && matchesFilter;
    });
  }, [familles, famillesMap, search, filterType]);

  const filteredIds = useMemo(
    () => new Set(filteredFamilles.map((f) => f.idFamille)),
    [filteredFamilles],
  );

  const tree = useMemo(() => {
    const fullTree = buildFamilleTree(familles);

    if (!search.trim() && filterType === 'all') return fullTree;

    function keepMatchingBranches(nodes: FamilleNode[]): FamilleNode[] {
      const result: FamilleNode[] = [];

      for (const node of nodes) {
        const filteredChildren = keepMatchingBranches(node.children);
        const selfMatches = filteredIds.has(node.idFamille);

        if (selfMatches || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren,
          });
        }
      }

      return result;
    }

    return keepMatchingBranches(fullTree);
  }, [familles, filteredIds, search, filterType]);

  const flatRows = useMemo(() => flattenTree(tree), [tree]);

  function isVisible(row: FamilleFlatRow) {
    let currentParentId = row.node.parent_id;

    while (currentParentId) {
      if (!expanded[currentParentId]) return false;
      currentParentId = famillesMap.get(currentParentId)?.parent_id ?? null;
    }

    return true;
  }

  const visibleRows = useMemo(
    () => flatRows.filter(isVisible),
    [flatRows, expanded, famillesMap],
  );

  const exportData = useMemo(
    () =>
      visibleRows.map(({ node }) => ({
        famille: node.libelle || '',
        codeFamille: node.code || '',
        parentFamille:
          node.parent_id && famillesMap.has(node.parent_id)
            ? famillesMap.get(node.parent_id)?.libelle || ''
            : '',
        sousFamilles: node.children.length,
        modeles: (node.modele || []).map((m) => m.libelle || '').join(' | '),
      })),
    [visibleRows, famillesMap],
  );

  function toggleRow(id: number) {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function toggleModeles(id: number) {
    setShowModeles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  async function handleDeleteFamille(idFamille: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette famille ?',
    );

    if (!confirmed) return;

    try {
      await deleteFamille(idFamille);
      setFamilles((prev) => prev.filter((f) => f.idFamille !== idFamille));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }

  function handleExport() {
    const headers = [
      'Famille',
      'Code famille',
      'Parent famille',
      'Sous-familles',
      'Modèles',
    ];

    const rows = exportData.map((item) => [
      item.famille,
      item.codeFamille,
      item.parentFamille,
      String(item.sousFamilles),
      item.modeles,
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
    link.setAttribute('download', 'arborescence_familles_bmt.csv');
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
    filterType,
    setFilterType,
    expanded,
    showModeles,
    famillesMap,
    visibleRows,
    toggleRow,
    toggleModeles,
    handleDeleteFamille,
    handleExport,
  };
}