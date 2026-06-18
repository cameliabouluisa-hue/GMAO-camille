'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { InterventionForm } from '@/features/interventions/components/InterventionForm';
import { createIntervention } from '@/features/interventions/services/intervention.service';
import type { CreateInterventionDto } from '@/features/interventions/types/intervention.types';

export default function NouvelleInterventionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(data: CreateInterventionDto) {
    try {
      setLoading(true);
      setError('');

      const created = await createIntervention(data);

      router.push(`/maintenance/interventions/${created.idIntervention}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer l'intervention.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1250px] space-y-5">
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700 shadow-sm">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <InterventionForm
          showHeader
          loading={loading}
          submitLabel="Créer intervention"
          onCancel={() => router.push('/maintenance/interventions')}
          onSubmit={(data) => handleSubmit(data as CreateInterventionDto)}
        />
      </section>
    </main>
  );
}