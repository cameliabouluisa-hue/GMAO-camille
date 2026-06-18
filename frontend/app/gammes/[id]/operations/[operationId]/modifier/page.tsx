'use client';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import GammeOperationEditForm from '@/features/gammes/components/GammeOperationEditForm';
import { useEditGammeOperationForm } from '@/features/gammes/hooks/useEditGammeOperationForm';

export default function ModifierOperationPage() {
  const router = useRouter();
  const params = useParams();

  const id = String(params.id);
  const operationId = String(params.operationId);

  const { values, loading, saving, error, success, setField, handleSubmit } =
    useEditGammeOperationForm({
      gammeId: id,
      operationId,
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
              Modifier l’opération
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Mise à jour d’une opération liée à la gamme.
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

        {loading ? (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement...
          </div>
        ) : (
          <GammeOperationEditForm
            values={values}
            saving={saving}
            error={error}
            success={success}
            setField={setField}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}