'use client';

import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';

import { ModeleForm, useEditModeleForm } from '@/features/modeles';
import type { UpdateModelePayload } from '@/features/modeles/types/modele';


import PermissionRoute from '@/components/PermissionRoute';
import { Permission } from '@/types/auth';
function ModifierModelePermissionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionRoute permission={Permission.MODELE_UPDATE}>
      {children}
    </PermissionRoute>
  );
}
export default function ModifierModelePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const modeleId = params?.id;

  const {
    modele,
    familles,
    etats,
    typesEquipement,
    fabricants,
    marques,
    plansPreventifsPredefinis,
    loading,
    error,
    submitModele,
  } = useEditModeleForm({
    modeleId: modeleId || '',
  });

  if (!modeleId) {
    return (
        <ModifierModelePermissionWrapper>
      <main className="min-h-screen bg-[#f5f7fb] px-6 py-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-[24px] border border-red-200 bg-red-50 px-6 py-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-lg font-extrabold text-red-700">
                  Modèle introuvable
                </h1>

                <p className="mt-1 text-sm font-semibold text-red-600">
                  L’identifiant du modèle est manquant dans l’URL.
                </p>

                <button
                  type="button"
                  onClick={() => router.push('/modeles')}
                  className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Retour aux modèles
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      </ModifierModelePermissionWrapper>
    );
  }

  if (loading) {
    return (
        <ModifierModelePermissionWrapper>

      <main className="min-h-screen bg-[#f5f7fb] px-6 py-8">
        <div className="mx-auto flex min-h-[420px] max-w-[1180px] items-center justify-center">
          <div className="rounded-[24px] border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef7fa] text-[#06475a]">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>

            <h1 className="mt-4 text-xl font-extrabold text-slate-950">
              Chargement du modèle
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Préparation des informations du modèle, des familles, états,
              types, fabricants, marques et plans préventifs prédéfinis.
            </p>
          </div>
        </div>
      </main>
            </ModifierModelePermissionWrapper>

    );
  }

  if (error || !modele) {
    return (
        <ModifierModelePermissionWrapper>

      <main className="min-h-screen bg-[#f5f7fb] px-6 py-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-[24px] border border-red-200 bg-red-50 px-6 py-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-lg font-extrabold text-red-700">
                  Impossible de charger le modèle
                </h1>

                <p className="mt-1 text-sm font-semibold text-red-600">
                  {error || 'Le modèle demandé est introuvable.'}
                </p>

                <button
                  type="button"
                  onClick={() => router.push('/modeles')}
                  className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Retour aux modèles
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
                  </ModifierModelePermissionWrapper>

    );
  }

  return (
  <ModifierModelePermissionWrapper>
    <ModeleForm
      mode="edit"
      initialData={modele}
      familles={familles}
      etats={etats}
      typesEquipement={typesEquipement}
      fabricants={fabricants}
      marques={marques}
      plansPreventifsPredefinis={plansPreventifsPredefinis}
      onSubmit={async (payload) => {
        await submitModele(payload as UpdateModelePayload);
      }}
    />
  </ModifierModelePermissionWrapper>
);
}