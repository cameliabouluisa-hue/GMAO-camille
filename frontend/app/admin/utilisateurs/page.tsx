'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  RefreshCcw,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

import { Select } from '@/components/select';
import { PageHeader } from '@/components/page-header';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { KpiCard } from '@/components/kpi-card';
import { DataTableCard } from '@/components/data-table-card';
import { EmptyState } from '@/components/empty-state';
import { LoadingSpinner } from '@/components/loading-spinner';
import { StatusBadge } from '@/components/status-badge';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'RESPONSABLE_MAINTENANCE' | 'TECHNICIEN' | 'DEMANDEUR' | 'MAGASINIER';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

// Données mockées pour référence
const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Mohammed',
    lastName: 'Saïdi',
    email: 'mohammed.saidi@port.tn',
    role: 'ADMIN',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2025-06-16',
  },
  {
    id: '2',
    firstName: 'Jamel',
    lastName: 'Ben Amar',
    email: 'jamel.benamr@port.tn',
    role: 'RESPONSABLE_MAINTENANCE',
    status: 'active',
    createdAt: '2024-02-20',
    lastLogin: '2025-06-15',
  },
  {
    id: '3',
    firstName: 'Fathi',
    lastName: 'Slimi',
    email: 'fathi.slimi@port.tn',
    role: 'TECHNICIEN',
    status: 'active',
    createdAt: '2024-03-10',
    lastLogin: '2025-06-16',
  },
  {
    id: '4',
    firstName: 'Sara',
    lastName: 'Khcharem',
    email: 'sara.khcharem@port.tn',
    role: 'MAGASINIER',
    status: 'active',
    createdAt: '2024-04-05',
    lastLogin: '2025-06-14',
  },
  {
    id: '5',
    firstName: 'Karim',
    lastName: 'Masmoudi',
    email: 'karim.masmoudi@port.tn',
    role: 'DEMANDEUR',
    status: 'inactive',
    createdAt: '2023-12-01',
    lastLogin: '2025-05-20',
  },
];

type RoleFilter = 'TOUS' | User['role'];
type StatusFilter = 'TOUS' | User['status'];

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('TOUS');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TOUS');

  const loadUsers = useCallback(async () => {
    // À connecter à une API réelle plus tard
    setLoading(true);
    try {
      // Simulation d'un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(mockUsers);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchSearch =
        normalizedSearch.length === 0 ||
        [user.firstName, user.lastName, user.email]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      const matchRole = roleFilter === 'TOUS' || user.role === roleFilter;
      const matchStatus = statusFilter === 'TOUS' || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      inactive: users.filter((u) => u.status === 'inactive').length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
    }),
    [users],
  );

  async function handleDelete(user: User) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`,
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(user.id);
      setError('');
      // À connecter à une API réelle
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err) {
      setError('Impossible de supprimer cet utilisateur.');
    } finally {
      setActionLoadingId(null);
    }
  }

  function resetFilters() {
    setSearch('');
    setRoleFilter('TOUS');
    setStatusFilter('TOUS');
  }

  const getRoleLabel = (role: User['role']) => {
    const labels: Record<User['role'], string> = {
      ADMIN: 'Administrateur',
      RESPONSABLE_MAINTENANCE: 'Responsable Maintenance',
      TECHNICIEN: 'Technicien',
      DEMANDEUR: 'Demandeur',
      MAGASINIER: 'Magasinier',
    };
    return labels[role];
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Administration"
          title="Utilisateurs"
          description="Gérez les utilisateurs, rôles et accès à l'application."
          actions={[
            {
              type: 'button',
              label: 'Actualiser',
              icon: <RefreshCcw size={18} />,
              onClick: loadUsers,
              variant: 'secondary',
              loading: loading,
            },
            {
              type: 'link',
              label: 'Nouvel utilisateur',
              href: '/admin/utilisateurs/nouveau',
              icon: <Plus size={18} />,
              variant: 'primary',
            },
          ]}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            icon={<Plus size={20} />}
            label="Total"
            value={stats.total}
            tone="blue"
          />
          <KpiCard
            icon={<Eye size={20} />}
            label="Actifs"
            value={stats.active}
            tone="emerald"
          />
          <KpiCard
            icon={<Pencil size={20} />}
            label="Inactifs"
            value={stats.inactive}
            tone="orange"
          />
          <KpiCard
            icon={<AlertTriangle size={20} />}
            label="Administrateurs"
            value={stats.admins}
            tone="violet"
          />
        </div>

        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          onReset={resetFilters}
        >
          <Select
            value={roleFilter}
            onValueChange={(value: string) => setRoleFilter(value as RoleFilter)}
            items={[
              { label: 'Tous les rôles', value: 'TOUS' },
              { label: 'Administrateur', value: 'ADMIN' },
              { label: 'Responsable Maintenance', value: 'RESPONSABLE_MAINTENANCE' },
              { label: 'Technicien', value: 'TECHNICIEN' },
              { label: 'Demandeur', value: 'DEMANDEUR' },
              { label: 'Magasinier', value: 'MAGASINIER' },
            ]}
          />

          <Select
            value={statusFilter}
            onValueChange={(value: string) =>
              setStatusFilter(value as StatusFilter)
            }
            items={[
              { label: 'Tous les statuts', value: 'TOUS' },
              { label: 'Actifs', value: 'active' },
              { label: 'Inactifs', value: 'inactive' },
            ]}
          />
        </SearchFilterBar>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <DataTableCard
          title="Liste des utilisateurs"
          subtitle={`${filteredUsers.length} utilisateur(s) affiché(s)`}
        >
          {loading ? (
            <LoadingSpinner message="Chargement des utilisateurs..." />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={<Plus className="h-8 w-8" />}
              title="Aucun utilisateur trouvé"
              description="Modifiez les filtres ou créez un nouvel utilisateur."
              action={
                <Link
                  href="/admin/utilisateurs/nouveau"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0b3d4f] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#082f3d]"
                >
                  <Plus size={18} />
                  Nouvel utilisateur
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-6 py-4 font-black">Nom</th>
                    <th className="px-6 py-4 font-black">Email</th>
                    <th className="px-6 py-4 font-black">Rôle</th>
                    <th className="px-6 py-4 font-black">Statut</th>
                    <th className="px-6 py-4 font-black">Créé le</th>
                    <th className="px-4 py-4 text-center font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-slate-950">
                          {user.firstName} {user.lastName}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-600">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge tone="blue" size="sm">
                          {getRoleLabel(user.role)}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge
                          tone={user.status === 'active' ? 'green' : 'red'}
                          size="sm"
                        >
                          {user.status === 'active' ? 'Actif' : 'Inactif'}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/utilisateurs/${user.id}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#0b3d4f]"
                            title="Voir"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            href={`/admin/utilisateurs/${user.id}/modifier`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#0b3d4f]"
                            title="Modifier"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button
                            type="button"
                            disabled={actionLoadingId === user.id}
                            onClick={() => handleDelete(user)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataTableCard>
      </section>
    </main>
  );
}
