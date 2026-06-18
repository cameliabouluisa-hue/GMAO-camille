'use client';

import { useRouter } from 'next/navigation';

import { PlanPreventifPredefiniEditor } from '@/features/plans-preventifs-predefinis/components/PlanPreventifPredefiniEditor';

export default function NouveauPlanPreventifPredefiniPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1250px]">
        <PlanPreventifPredefiniEditor
          mode="create"
          onCancel={() => router.push('/plans-preventifs-predefinis')}
          onSaved={(plan) =>
            router.push(
              `/plans-preventifs-predefinis/${plan.idPlanPreventifPredefini}`,
            )
          }
        />
      </section>
    </main>
  );
}