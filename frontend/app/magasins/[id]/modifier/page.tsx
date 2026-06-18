'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';

import MagasinForm from '@/features/magasins/components/MagasinForm';

import {
  getMagasinById,
  updateMagasin,
} from '@/features/magasins/services/magasin.service';

import type {
  CreateMagasinDto,
  Magasin,
  UpdateMagasinDto,
} from '@/features/magasins/types/magasin';

export default function ModifierMagasinPage() {
  const router = useRouter();
  const params = useParams();

  const id = useMemo(() => {
    const rawId = params?.id;
    const value = Array.isArray(rawId) ? rawId[0] : rawId;
    return Number(value);
  }, [params]);

  const [magasin, setMagasin] = useState<Magasin | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setError('Identifiant du magasin invalide.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await getMagasinById(id);
      setMagasin(data);

      if (data.actif === false) {
        setError(
          'Ce magasin est inactif. Vous pouvez le modifier, mais il ne sera pas proposé dans les nouvelles opérations de stock.',
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du magasin.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(data: CreateMagasinDto | UpdateMagasinDto) {
    if (!magasin) return;

    try {
      setSubmitting(true);
      setError('');

      const updated = await updateMagasin(
        magasin.idMagasin,
        data as UpdateMagasinDto,
      );

      router.push(`/magasins/${updated.idMagasin}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la modification du magasin.',
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
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm font-black text-orange-700">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : !magasin ? (
          <ErrorState message="Magasin introuvable." onRetry={loadData} />
        ) : (
          <MagasinForm
            mode="edit"
            magasin={magasin}
            loading={loading}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
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

function LoadingState() {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <RefreshCcw size={24} className="animate-spin" />
      </div>

      <p className="mt-4 text-sm font-black text-slate-500">
        Chargement du formulaire magasin...
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle size={24} />
      </div>

      <h2 className="mt-4 text-lg font-black text-slate-950">
        Impossible de charger le magasin
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
      >
        <RefreshCcw size={16} />
        Réessayer
      </button>
    </div>
  );
}