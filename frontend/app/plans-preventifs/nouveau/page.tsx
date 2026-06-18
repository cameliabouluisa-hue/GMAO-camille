'use client';

import { useRouter } from 'next/navigation';

import { PlanPreventifEditor } from '@/features/plans-preventifs/components/PlanPreventifEditor';

export default function NouveauPlanPreventifPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1250px]">
        <PlanPreventifEditor
          mode="create"
          onCancel={() => router.push('/plans-preventifs')}
          onSaved={(plan) =>
            router.push(`/plans-preventifs/${plan.idPlanPreventif}`)
          }
        />
      </section>
    </main>
  );
}