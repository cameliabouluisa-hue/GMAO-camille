'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { PointStructureFormPage } from '@/features/points-structure/components/PointStructureFormPage';
import { createPointStructure } from '@/features/points-structure/services/point-structure.service';

import type {
  CreatePointStructureDto,
  UpdatePointStructureDto,
} from '@/features/points-structure/types/point-structure.type';

export default function NouveauPointStructurePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    data: CreatePointStructureDto | UpdatePointStructureDto,
  ) {
    try {
      setSaving(true);
      setError('');

      const created = await createPointStructure(data as CreatePointStructureDto);

      router.push(`/points-structure/${created.idPoint}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création du point de structure.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1280px] space-y-5">
        <button
          type="button"
          onClick={() => router.push('/points-structure')}
          className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#06475a]"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <PointStructureFormPage
          mode="create"
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/points-structure')}
        />
      </section>
    </main>
  );
}