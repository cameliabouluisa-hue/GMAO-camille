'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCcw } from 'lucide-react';

import { PointStructureFormPage } from '@/features/points-structure/components/PointStructureFormPage';
import {
  getPointStructure,
  updatePointStructure,
} from '@/features/points-structure/services/point-structure.service';

import type {
  PointStructureDetail,
  UpdatePointStructureDto,
  CreatePointStructureDto,
} from '@/features/points-structure/types/point-structure.type';

export default function ModifierPointStructurePage() {
  const router = useRouter();
  const params = useParams();

  const idPoint = useMemo(() => {
    const raw = params?.id;
    const value = Array.isArray(raw) ? raw[0] : raw;

    return Number(value);
  }, [params]);

  const [point, setPoint] = useState<PointStructureDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPoint = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getPointStructure(idPoint);

      setPoint(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du point de structure.',
      );
    } finally {
      setLoading(false);
    }
  }, [idPoint]);

  useEffect(() => {
    if (Number.isFinite(idPoint) && idPoint > 0) {
      loadPoint();
    }
  }, [idPoint, loadPoint]);

  async function handleSubmit(
    data: CreatePointStructureDto | UpdatePointStructureDto,
  ) {
    try {
      setSaving(true);
      setError('');

      await updatePointStructure(idPoint, data as UpdatePointStructureDto);

      router.push(`/points-structure/${idPoint}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la modification du point de structure.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <RefreshCcw
            size={26}
            className="mx-auto animate-spin text-slate-400"
          />

          <p className="mt-4 text-sm font-black text-slate-500">
            Chargement du point de structure...
          </p>
        </section>
      </main>
    );
  }

  if (!point) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
          Point de structure introuvable.
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1280px] space-y-5">
        <button
          type="button"
          onClick={() => router.push(`/points-structure/${idPoint}`)}
          className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#06475a]"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <PointStructureFormPage
          mode="edit"
          initialData={point}
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/points-structure/${idPoint}`)}
        />
      </section>
    </main>
  );
}