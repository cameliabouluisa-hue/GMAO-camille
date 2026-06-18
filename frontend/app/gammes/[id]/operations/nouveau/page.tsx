'use client';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import GammeOperationForm from '@/features/gammes/components/GammeOperationForm';
import { useGammeOperationForm } from '@/features/gammes/hooks/useGammeOperationForm';

export default function NouvelleOperationPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const { values, saving, error, success, setField, handleSubmit } =
    useGammeOperationForm({
      gammeId: id,
      onSuccess: () => router.push(`/gammes/${id}`),
    });

  function handleBack() {
    router.push(`/gammes/${id}`);
  }

  return (
    <div
      className="min-h-full p-5"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.26em]"
              style={{ color: '#6E8CA0' }}
            >
              BMT · Maintenance
            </p>

            <h1
              className="mt-2 text-[28px] font-bold leading-tight"
              style={{ color: '#183B56' }}
            >
              Nouvelle opération
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Création d’une opération pour cette gamme de maintenance.
            </p>
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition hover:bg-slate-50"
            style={{
              borderColor: '#E6EDF2',
              backgroundColor: '#FFFFFF',
              color: '#183B56',
            }}
          >
            <ChevronLeft size={16} />
            <span>Retour</span>
          </button>
        </div>

        <GammeOperationForm
          values={values}
          saving={saving}
          error={error}
          success={success}
          setField={setField}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}