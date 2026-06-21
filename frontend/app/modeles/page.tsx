  'use client';

  import Link from 'next/link';
  import { useCallback, useEffect, useMemo, useState } from 'react';
  import type { ReactNode } from 'react';
  import {
    Boxes,
    CheckCircle2,
    Eye,
    Pencil,
    Plus,
    RefreshCcw,
    Trash2,
    Wrench,
  } from 'lucide-react';

  import { Select } from '@/components/select';
  import { PageHeader } from '@/components/page-header';
  import { SearchFilterBar } from '@/components/search-filter-bar';
  import { KpiCard } from '@/components/kpi-card';
  import { DataTableCard } from '@/components/data-table-card';
  import { EmptyState } from '@/components/empty-state';
  import { LoadingSpinner } from '@/components/loading-spinner';
  import {
    deleteModele,
    getModeles,
  } from '@/features/modeles/services/modele.service';
import PermissionRoute from '@/components/PermissionRoute';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types/auth';
  import type { ModeleApi } from '@/features/modeles/types/modele';

  type TypeFilter = 'TOUS' | string;
  type EtatFilter = 'TOUS' | string;

  function getText(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  export default function ModelesPage() {
    const { hasPermission } = useAuth();
    const [modeles, setModeles] = useState<ModeleApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('TOUS');
    const [etatFilter, setEtatFilter] = useState<EtatFilter>('TOUS');

    const loadModeles = useCallback(async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getModeles();
        setModeles(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des modèles.',
        );
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      loadModeles();
    }, [loadModeles]);

    const typeOptions = useMemo(() => {
      const map = new Map<number, string>();

      modeles.forEach((modele) => {
        if (modele.idTypeEquipement && modele.type_equipement) {
          map.set(
            modele.idTypeEquipement,
            modele.type_equipement.libelle ||
              modele.type_equipement.code ||
              `Type ${modele.idTypeEquipement}`,
          );
        }
      });

      return Array.from(map.entries()).map(([id, label]) => ({
        value: String(id),
        label,
      }));
    }, [modeles]);

    const etatOptions = useMemo(() => {
      const map = new Map<number, string>();

      modeles.forEach((modele) => {
        if (modele.idEtat && modele.etat_modele) {
          map.set(
            modele.idEtat,
            modele.etat_modele.libelle ||
              modele.etat_modele.code ||
              `État ${modele.idEtat}`,
          );
        }
      });

      return Array.from(map.entries()).map(([id, label]) => ({
        value: String(id),
        label,
      }));
    }, [modeles]);

    const filteredModeles = useMemo(() => {
      const normalizedSearch = search.trim().toLowerCase();

      return modeles.filter((modele) => {
        const searchable = [
          modele.code,
          modele.libelle,
          modele.type_equipement?.code,
          modele.type_equipement?.libelle,
          modele.etat_modele?.code,
          modele.etat_modele?.libelle,
        ]
          .map(getText)
          .join(' ')
          .toLowerCase();

        const matchSearch =
          !normalizedSearch || searchable.includes(normalizedSearch);

        const matchType =
          typeFilter === 'TOUS' ||
          String(modele.idTypeEquipement) === typeFilter;

        const matchEtat =
          etatFilter === 'TOUS' || String(modele.idEtat) === etatFilter;

        return matchSearch && matchType && matchEtat;
      });
    }, [modeles, search, typeFilter, etatFilter]);

    const stats = useMemo(() => {
      const types = new Set(
        modeles
          .map((modele) => modele.idTypeEquipement)
          .filter((id): id is number => id !== null && id !== undefined),
      );

      const actifs = modeles.filter((modele) => {
        const etat =
          `${modele.etat_modele?.libelle || ''} ${modele.etat_modele?.code || ''}`.toLowerCase();

        return etat.includes('actif') || etat.includes('valid');
      }).length;

      return {
        total: modeles.length,
        types: types.size,
        actifs,
      };
    }, [modeles]);

    function resetFilters() {
      setSearch('');
      setTypeFilter('TOUS');
      setEtatFilter('TOUS');
    }

    async function handleDelete(modele: ModeleApi) {
      const label = modele.libelle || modele.code || `#${modele.idModele}`;

      const ok = window.confirm(
        `Voulez-vous vraiment supprimer le modèle "${label}" ?`,
      );

      if (!ok) return;

      try {
        setActionLoading(true);
        setError('');

        await deleteModele(modele.idModele);
        await loadModeles();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors de la suppression du modèle.',
        );
      } finally {
        setActionLoading(false);
      }
    }

  return (
  <PermissionRoute permission={Permission.MODELE_VIEW}>
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
        <section className="mx-auto max-w-[1450px] space-y-6">
          <PageHeader
            module="Module équipements"
            title="Modèles"
            description="Gérez le référentiel des modèles utilisés pour vos équipements."
            actions={[
  {
    type: 'button',
    label: 'Actualiser',
    icon: <RefreshCcw size={18} />,
    onClick: loadModeles,
    variant: 'secondary',
    loading: loading || actionLoading,
  },
  ...(hasPermission(Permission.MODELE_CREATE)
    ? [
        {
          type: 'link' as const,
          label: 'Nouveau modèle',
          href: '/modeles/nouveau',
          icon: <Plus size={18} />,
          variant: 'primary' as const,
        },
      ]
    : []),
]}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <KpiCard
              icon={<Boxes size={20} />}
              label="Modèles"
              value={stats.total}
              tone="blue"
            />

            <KpiCard
              icon={<Wrench size={20} />}
              label="Types"
              value={stats.types}
              tone="orange"
            />

            <KpiCard
              icon={<CheckCircle2 size={20} />}
              label="Actifs"
              value={stats.actifs}
              tone="violet"
            />
          </div>

          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            onReset={resetFilters}
          >
            <Select
              value={typeFilter}
              onValueChange={(value: string) => setTypeFilter(value)}
              items={[
                { label: 'Tous les types', value: 'TOUS' },
                ...typeOptions,
              ]}
            />

            <Select
              value={etatFilter}
              onValueChange={(value: string) => setEtatFilter(value)}
              items={[
                { label: 'Tous les états', value: 'TOUS' },
                ...etatOptions,
              ]}
            />
          </SearchFilterBar>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <DataTableCard
            title="Liste des modèles"
            subtitle={`${filteredModeles.length} modèle(s) affiché(s)`}
          >
            {loading ? (
              <LoadingSpinner message="Chargement des modèles..." />
            ) : filteredModeles.length === 0 ? (
              <EmptyState
                icon={<Boxes className="h-8 w-8" />}
                title="Aucun modèle trouvé"
                description="Modifiez les filtres ou créez un nouveau modèle."
                action={
  hasPermission(Permission.MODELE_CREATE) ? (
    <Link
      href="/modeles/nouveau"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0b3d4f] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#082f3d]"
    >
      <Plus size={18} />
      Nouveau modèle
    </Link>
  ) : undefined
}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                      <th className="px-6 py-4 font-black">Code</th>
                      <th className="px-6 py-4 font-black">Libellé</th>
                      <th className="px-6 py-4 font-black">Type</th>
                      <th className="px-6 py-4 font-black">Statut</th>
                    <th className="px-4 py-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredModeles.map((modele) => (
                     <ModeleRow
  key={modele.idModele}
  modele={modele}
  actionLoading={actionLoading}
  onDelete={handleDelete}
  canUpdate={hasPermission(Permission.MODELE_UPDATE)}
  canDelete={hasPermission(Permission.MODELE_DELETE)}
/>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DataTableCard>
        </section>
        </main>
  </PermissionRoute>
);
}

 function ModeleRow({
  modele,
  actionLoading,
  onDelete,
  canUpdate,
  canDelete,
}: {
  modele: ModeleApi;
  actionLoading: boolean;
  onDelete: (modele: ModeleApi) => void;
  canUpdate: boolean;
  canDelete: boolean;
}) {
    return (
      <tr className="border-b border-slate-100 transition hover:bg-slate-50/70">
        <td className="px-6 py-5">
          <span className="inline-flex max-w-[170px] items-center rounded-2xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-900">
            <span className="truncate">
              {modele.code || `MOD-${modele.idModele}`}
            </span>
          </span>
        </td>

        <td className="px-6 py-5">
          <p className="text-base font-black text-slate-950">
            {modele.libelle || 'Modèle sans libellé'}
          </p>
        </td>

        <td className="px-6 py-5">
          <ModelesBadge tone="blue">
            {modele.type_equipement?.libelle ||
              modele.type_equipement?.code ||
              'Non défini'}
          </ModelesBadge>
        </td>

        <td className="px-6 py-5">
          <ModelesBadge tone="green">
            {modele.etat_modele?.libelle ||
              modele.etat_modele?.code ||
              'Non défini'}
          </ModelesBadge>
        </td>

        <td className="px-6 py-5">
          <div className="flex justify-end gap-2">
              <Link
      href={`/modeles/${modele.idModele}`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#0b3d4f]"
      title="Voir"
    >
      <Eye size={18} />
    </Link>
           {canUpdate && (
  <Link
    href={`/modeles/${modele.idModele}/modifier`}
    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#0b3d4f]"
    title="Modifier"
  >
    <Pencil size={18} />
  </Link>
)}

{canDelete && (
  <button
    type="button"
    disabled={actionLoading}
    onClick={() => onDelete(modele)}
    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-60"
    title="Supprimer"
  >
    <Trash2 size={18} />
  </button>
)}
          </div>
        </td>
      </tr>
    );
  }

  function ModelesBadge({
    children,
    tone,
  }: {
    children: ReactNode;
    tone: 'blue' | 'green';
  }) {
    const className =
      tone === 'green'
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-blue-50 text-blue-700';

    return (
      <span
        className={`inline-flex max-w-[210px] items-center rounded-full px-3 py-1.5 text-xs font-black ${className}`}
      >
        <span className="truncate">{children}</span>
      </span>
    );
  }
