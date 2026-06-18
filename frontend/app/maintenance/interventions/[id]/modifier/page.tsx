'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

import { InterventionForm } from '@/features/interventions/components/InterventionForm';
import {
  getApiErrorMessage,
  getIntervention,
  updateIntervention,
} from '@/features/interventions/services/intervention.service';
import type {
  Intervention,
  UpdateInterventionDto,
} from '@/features/interventions/types/intervention.types';

export default function ModifierInterventionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idIntervention = Number(params.id);

  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadIntervention = useCallback(async () => {
    if (!Number.isFinite(idIntervention)) {
      setError('Identifiant intervention invalide.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await getIntervention(idIntervention);
      setIntervention(data);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Erreur lors du chargement de l'intervention.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [idIntervention]);

  useEffect(() => {
    loadIntervention();
  }, [loadIntervention]);

  async function handleSubmit(data: UpdateInterventionDto) {
    try {
      setSaving(true);
      setError('');
      const updated = await updateIntervention(idIntervention, data);
      router.push(`/maintenance/interventions/${updated.idIntervention}`);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Impossible de modifier l'intervention."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1250px] space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">
              Module maintenance
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">
              Modifier intervention
            </h1>
            <p className="mt-1 text-base text-slate-500">
              Mise a jour des informations de preparation.
            </p>
          </div>
          <Link
            href={`/maintenance/interventions/${idIntervention}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
            Chargement de l&apos;intervention...
          </div>
        ) : intervention ? (
          <InterventionForm
            initialIntervention={intervention}
            loading={saving}
            submitLabel="Enregistrer"
            onCancel={() =>
              router.push(`/maintenance/interventions/${idIntervention}`)
            }
            onSubmit={(data) => handleSubmit(data as UpdateInterventionDto)}
          />
        ) : null}
      </section>
    </main>
  );
}
