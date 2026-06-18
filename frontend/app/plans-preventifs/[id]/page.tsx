'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

import { PlanPreventifEditor } from '@/features/plans-preventifs/components/PlanPreventifEditor';
import { getPlanPreventifById } from '@/features/plans-preventifs/services/plan-preventif.service';
import type { PlanPreventif } from '@/features/plans-preventifs/types/plan-preventif.types';

export default function DetailPlanPreventifPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = Number(params?.id);

  const [item, setItem] = useState<PlanPreventif | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadPlan() {
      if (!Number.isFinite(id)) {
        setError('Identifiant du plan préventif invalide.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await getPlanPreventifById(id);

        if (mounted) setItem(data);
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erreur lors du chargement du plan préventif.',
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPlan();

    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1250px] space-y-5">
        {loading && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
            Chargement du plan préventif...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[28px] border border-red-100 bg-red-50 p-7 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />

              <div>
                <p className="text-base font-black">
                  Impossible de charger le plan préventif
                </p>

                <p className="mt-1 text-sm font-bold">{error}</p>

                <Link
                  href="/plans-preventifs"
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
          <PlanPreventifEditor
            mode="detail"
            initialPlan={item}
            onCancel={() => router.push('/plans-preventifs')}
            onSaved={() => undefined}
          />
        )}
      </section>
    </main>
  );
}