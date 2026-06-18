'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';

import MagasinForm from '@/features/magasins/components/MagasinForm';
import { createMagasin } from '@/features/magasins/services/magasin.service';
import type {
  CreateMagasinDto,
  UpdateMagasinDto,
} from '@/features/magasins/types/magasin';

export default function NouveauMagasinPage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(data: CreateMagasinDto | UpdateMagasinDto) {
    try {
      setSubmitting(true);
      setError('');

      const created = await createMagasin(data as CreateMagasinDto);

      router.push(`/magasins/${created.idMagasin}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création du magasin.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1180px] space-y-5">
        <BackButton onClick={() => router.back()} />

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        <MagasinForm
          mode="create"
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </section>
    </main>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#06475a]"
    >
      <ArrowLeft size={18} />
      Retour
    </button>
  );
}