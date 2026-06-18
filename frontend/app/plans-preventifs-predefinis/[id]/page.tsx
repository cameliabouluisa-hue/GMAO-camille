'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

import { PlanPreventifPredefiniEditor } from '@/features/plans-preventifs-predefinis/components/PlanPreventifPredefiniEditor';
import { usePlanPreventifPredefiniDetail } from '@/features/plans-preventifs-predefinis/hooks/usePlanPreventifPredefiniDetail';

export default function DetailPlanPreventifPredefiniPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = Number(params?.id);
  const { item, loading, error } = usePlanPreventifPredefiniDetail(id);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1250px] space-y-5">
        {loading && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
            Chargement du plan préventif prédéfini...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[28px] border border-red-100 bg-red-50 p-7 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />

              <div>
                <p className="text-base font-black">
                  Impossible de charger le plan préventif prédéfini
                </p>

                <p className="mt-1 text-sm font-bold">{error}</p>

                <Link
                  href="/plans-preventifs-predefinis"
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-red-700 shadow-sm transition hover:bg-red-50"
                >
                  <ArrowLeft size={18} />
                  Retour à la liste
                </Link>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && item && (
          <PlanPreventifPredefiniEditor
            mode="detail"
            initialPlan={item}
            onCancel={() => router.push('/plans-preventifs-predefinis')}
            onSaved={() => undefined}
          />
        )}
      </section>
    </main>
  );
}