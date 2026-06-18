'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import { DetailHero } from '@/components/detail-hero';
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
  linkedTechnicien?: string;
}

// Données mockées
const mockUserDetail: User = {
  id: '1',
  firstName: 'Mohammed',
  lastName: 'Saïdi',
  email: 'mohammed.saidi@port.tn',
  role: 'ADMIN',
  status: 'active',
  createdAt: '2024-01-15',
  lastLogin: '2025-06-16',
  linkedTechnicien: 'Fathi Slimi',
};

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

export default function UtilisateurDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  // En production, charger depuis l'API
  const [user] = useState<User>(mockUserDetail);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1000px] space-y-6">
        <PageHeader
          module="Administration"
          title="Détail utilisateur"
          description={`${user.firstName} ${user.lastName}`}
          actions={[
            {
              type: 'link',
              label: 'Modifier',
              href: `/admin/utilisateurs/${userId}/modifier`,
              variant: 'primary',
            },
            {
              type: 'link',
              label: 'Retour',
              href: '/admin/utilisateurs',
              icon: <ArrowLeft size={18} />,
              variant: 'secondary',
            },
          ]}
        />

        <DetailHero
          title={`${user.firstName} ${user.lastName}`}
          subtitle={user.email}
          status={
            <StatusBadge
              tone={user.status === 'active' ? 'green' : 'red'}
              size="lg"
            >
              {user.status === 'active' ? 'Actif' : 'Inactif'}
            </StatusBadge>
          }
          metadata={[
            {
              label: 'Rôle',
              value: getRoleLabel(user.role),
            },
            {
              label: 'Créé le',
              value: new Date(user.createdAt).toLocaleDateString('fr-FR'),
            },
            {
              label: 'Dernière connexion',
              value: user.lastLogin
                ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                : 'Jamais',
            },
          ]}
        />

        <SectionCard>
          <h2 className="mb-6 text-lg font-black text-slate-950">
            Informations personnelles
          </h2>

          <div className="space-y-6 border-b border-slate-200 pb-6 last:border-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Prénom
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {user.firstName}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Nom
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {user.lastName}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Email
              </p>
              <p className="mt-2 text-sm font-black text-slate-950">
                {user.email}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="mb-6 text-lg font-black text-slate-950">
            Accès et permissions
          </h2>

          <div className="space-y-6 border-b border-slate-200 pb-6 last:border-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Rôle
                </p>
                <div className="mt-2">
                  <StatusBadge tone="blue">{getRoleLabel(user.role)}</StatusBadge>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Statut
                </p>
                <div className="mt-2">
                  <StatusBadge
                    tone={user.status === 'active' ? 'green' : 'red'}
                  >
                    {user.status === 'active' ? 'Actif' : 'Inactif'}
                  </StatusBadge>
                </div>
              </div>
            </div>

            {user.linkedTechnicien && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Technicien lié
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {user.linkedTechnicien}
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="mb-6 text-lg font-black text-slate-950">
            Historique
          </h2>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Compte créé le
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Dernière connexion
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Jamais connecté'}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <Link
            href={`/admin/utilisateurs/${userId}/modifier`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0b3d4f] px-8 text-sm font-bold text-white shadow-sm transition hover:bg-[#082f3d]"
          >
            Modifier
          </Link>
          <Link
            href="/admin/utilisateurs"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Retour
          </Link>
        </div>
      </section>
    </main>
  );
}
