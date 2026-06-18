'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PointMesureFormPage } from '@/features/points-mesure/components/PointMesureFormPage';
import {
  getPointMesure,
  updatePointMesure,
} from '@/features/points-mesure/services/point-mesure.service';
import type {
  PointMesure,
  UpdatePointMesurePayload,
} from '@/features/points-mesure/types/point-mesure.types';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function ModifierPointMesurePage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);

  const idPointMesure = Number(id);

  const [pointMesure, setPointMesure] = useState<PointMesure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPointMesure() {
      if (Number.isNaN(idPointMesure)) {
        setError('Identifiant du point de mesure invalide.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await getPointMesure(idPointMesure);
        setPointMesure(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement du point de mesure.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadPointMesure();
  }, [idPointMesure]);

  async function handleUpdate(data: UpdatePointMesurePayload) {
    await updatePointMesure(idPointMesure, data);
    router.push(`/points-mesure/${idPointMesure}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
        <section className="mx-auto max-w-[1450px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-base font-semibold text-slate-500 shadow-sm">
            Chargement du point de mesure...
          </div>
        </section>
      </main>
    );
  }

  if (error || !pointMesure) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
        <section className="mx-auto max-w-[1450px]">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-base font-semibold text-red-700">
            {error || 'Point de mesure introuvable.'}
          </div>
        </section>
      </main>
    );
  }

  return (
    <PointMesureFormPage
      mode="edit"
      initialData={pointMesure}
      onSubmit={handleUpdate}
    />
  );
}