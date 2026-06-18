'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  ListChecks,
  Save,
  Wrench,
} from 'lucide-react';

import GammeForm from '@/features/gammes/components/GammeForm';
import GammeOperationsPanel from '@/features/gammes/components/GammeOperationsPanel';

import {
  createGamme,
  createGammeOperation,
} from '@/features/gammes/services/gamme.service';

import type {
  CreateGammeOperationPayload,
  CreateGammePayload,
} from '@/features/gammes/types/gamme.types';

import type { GammeOperationDraft } from '@/features/gammes/components/GammeOperationsPanel';

type ActiveTab = 'general' | 'operations';

const FORM_ID = 'create-gamme-form';

function buildOperationPayload(
  operation: GammeOperationDraft,
): CreateGammeOperationPayload {
  return {
    ordre:
      operation.ordre !== null &&
      operation.ordre !== undefined &&
      operation.ordre !== ''
        ? Number(operation.ordre)
        : undefined,

    libelle: operation.libelle?.trim() || undefined,

    description: operation.description?.trim() || undefined,

    tempsStandard:
      operation.tempsStandard !== null &&
      operation.tempsStandard !== undefined &&
      operation.tempsStandard !== ''
        ? Number(operation.tempsStandard)
        : undefined,

    obligatoire: Boolean(operation.obligatoire),

    idPointStructure: operation.idPointStructure ?? undefined,
    idMateriel: operation.idMateriel ?? undefined,
    idModele: operation.idModele ?? undefined,
    idFamille: operation.idFamille ?? undefined,
  };
}

export default function NouveauGammePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [operations, setOperations] = useState<GammeOperationDraft[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload: CreateGammePayload) {
    try {
      setSubmitting(true);
      setError('');

      const created = await createGamme(payload);

      for (const operation of operations) {
        if (!operation.libelle?.trim()) continue;

        await createGammeOperation(
          created.idGamme,
          buildOperationPayload(operation),
        );
      }

      router.push(`/gammes/${created.idGamme}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création de la gamme.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1280px] space-y-5">
        <button
          type="button"
          onClick={() => router.push('/gammes')}
          className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#06475a]"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#0a556b] to-[#0d6f87] px-6 py-6 text-white">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Wrench size={28} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                    Gamme de maintenance
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight">
                    Nouvelle gamme
                  </h1>

                  <p className="mt-2 text-sm font-semibold text-white/85">
                    Créez une gamme et définissez ses opérations associées.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                form={FORM_ID}
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} className={submitting ? 'animate-pulse' : ''} />
                Créer la gamme
              </button>
            </div>
          </div>

          <div className="border-b border-slate-100 bg-white px-6">
            <div className="flex flex-wrap gap-2 py-3">
              <TabButton
                active={activeTab === 'general'}
                icon={<ClipboardList size={18} />}
                label="Général"
                onClick={() => setActiveTab('general')}
              />

              <TabButton
                active={activeTab === 'operations'}
                icon={<ListChecks size={18} />}
                label={`Opérations ${
                  operations.length > 0 ? `(${operations.length})` : ''
                }`}
                onClick={() => setActiveTab('operations')}
              />
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'general' ? (
              <GammeForm
                formId={FORM_ID}
                submitting={submitting}
                submitLabel="Créer la gamme"
                showHeader={false}
                showFooterActions={false}
                onSubmit={(payload) =>
                  handleSubmit(payload as CreateGammePayload)
                }
              />
            ) : (
              <GammeOperationsPanel
                operations={operations}
                onOperationsChange={setOperations}
                title="Opérations"
                description="Ajoutez les opérations à exécuter dans cette gamme. Elles seront créées automatiquement après l’enregistrement de la gamme."
              />
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black transition',
        active
          ? 'border border-slate-200 bg-white text-[#06475a] shadow-sm'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}