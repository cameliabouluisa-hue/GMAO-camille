'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'RESPONSABLE_MAINTENANCE' | 'TECHNICIEN' | 'DEMANDEUR' | 'MAGASINIER';
  status: 'active' | 'inactive';
  password: string;
  confirmPassword: string;
}

export default function NouvelUtilisateurPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'DEMANDEUR',
    status: 'active',
    password: '',
    confirmPassword: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation basique
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // À connecter à une API réelle
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirection après succès
      router.push('/admin/utilisateurs');
    } catch (err) {
      setError('Erreur lors de la création de l\'utilisateur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[900px] space-y-6">
        <PageHeader
          module="Administration"
          title="Nouvel utilisateur"
          description="Créez un nouveau compte utilisateur avec les droits appropriés."
          actions={[
            {
              type: 'link',
              label: 'Retour',
              href: '/admin/utilisateurs',
              icon: <ArrowLeft size={18} />,
              variant: 'secondary',
            },
          ]}
        />

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <SectionCard>
            <h2 className="mb-4 text-lg font-black text-slate-950">
              Informations personnelles
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-black text-slate-600 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#0b3d4f] focus:ring-4 focus:ring-[#0b3d4f]/10"
                  placeholder="Mohammed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-600 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#0b3d4f] focus:ring-4 focus:ring-[#0b3d4f]/10"
                  placeholder="Saïdi"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-600 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#0b3d4f] focus:ring-4 focus:ring-[#0b3d4f]/10"
                  placeholder="mohammed.saidi@port.tn"
                  required
                />
              </div>
            </div>
          </SectionCard>

          {/* Accès et permissions */}
          <SectionCard>
            <h2 className="mb-4 text-lg font-black text-slate-950">
              Accès et permissions
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-black text-slate-600 mb-2">
                  Rôle *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserFormData['role'],
                    })
                  }
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#0b3d4f] focus:ring-4 focus:ring-[#0b3d4f]/10"
                  required
                >
                  <option value="DEMANDEUR">Demandeur</option>
                  <option value="TECHNICIEN">Technicien</option>
                  <option value="RESPONSABLE_MAINTENANCE">
                    Responsable Maintenance
                  </option>
                  <option value="MAGASINIER">Magasinier</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-600 mb-2">
                  Statut *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#0b3d4f] focus:ring-4 focus:ring-[#0b3d4f]/10"
                  required
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Identifiants */}
          <SectionCard>
            <h2 className="mb-4 text-lg font-black text-slate-950">
              Identifiants
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-black text-slate-600 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#0b3d4f] focus:ring-4 focus:ring-[#0b3d4f]/10"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-600 mb-2">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#0b3d4f] focus:ring-4 focus:ring-[#0b3d4f]/10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </SectionCard>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0b3d4f] px-8 text-sm font-bold text-white shadow-sm transition hover:bg-[#082f3d] disabled:opacity-60"
            >
              {loading ? 'Création en cours...' : 'Créer l\'utilisateur'}
            </button>
            <Link
              href="/admin/utilisateurs"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Annuler
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
