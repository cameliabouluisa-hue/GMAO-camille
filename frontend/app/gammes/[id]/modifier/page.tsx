'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  ListChecks,
  RefreshCcw,
  Save,
  Wrench,
} from 'lucide-react';

import GammeForm from '@/features/gammes/components/GammeForm';
import GammeOperationsPanel, {
  GammeOperationDraft,
  normalizeOperations,
} from '@/features/gammes/components/GammeOperationsPanel';

import {
  createGammeOperation,
  deleteGammeOperation,
  getGammeById,
  updateGamme,
  updateGammeOperation,
} from '@/features/gammes/services/gamme.service';

import type {
  CreateGammeOperationPayload,
  Gamme,
  UpdateGammeOperationPayload,
  UpdateGammePayload,
} from '@/features/gammes/types/gamme.types';

type ActiveTab = 'general' | 'operations';

const FORM_ID = 'edit-gamme-form';

function buildOperationPayload(
  operation: GammeOperationDraft,
): CreateGammeOperationPayload | UpdateGammeOperationPayload {
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

export default function ModifierGammePage() {
  const router = useRouter();
  const params = useParams();

  const idGamme = useMemo(() => {
    const raw = params?.id;
    const value = Array.isArray(raw) ? raw[0] : raw;

    return Number(value);
  }, [params]);

  const [gamme, setGamme] = useState<Gamme | null>(null);
  const [operations, setOperations] = useState<GammeOperationDraft[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingOperations, setSavingOperations] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadGamme = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const data = await getGammeById(idGamme);

      setGamme(data);
      setOperations(normalizeOperations(data.gamme_operation));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement de la gamme.',
      );
    } finally {
      setLoading(false);
    }
  }, [idGamme]);

  useEffect(() => {
    if (Number.isFinite(idGamme) && idGamme > 0) {
      loadGamme();
    }
  }, [idGamme, loadGamme]);

  async function handleSubmitGeneral(payload: UpdateGammePayload) {
    try {
      setSavingGeneral(true);
      setError('');
      setSuccess('');

      const updated = await updateGamme(idGamme, payload);

      setGamme(updated);
      setOperations(normalizeOperations(updated.gamme_operation));

      setSuccess('Gamme mise à jour avec succès.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la mise à jour de la gamme.',
      );
    } finally {
      setSavingGeneral(false);
    }
  }

  async function handleSaveOperations() {
    if (!gamme) return;

    try {
      setSavingOperations(true);
      setError('');
      setSuccess('');

      const originalOperations = gamme.gamme_operation ?? [];

      const currentExistingIds = new Set(
        operations
          .map((operation) => operation.idOperation)
          .filter((id): id is number => typeof id === 'number'),
      );

      const operationsToDelete = originalOperations.filter(
        (operation) => !currentExistingIds.has(operation.idOperation),
      );

      for (const operation of operationsToDelete) {
        await deleteGammeOperation(operation.idOperation);
      }

      for (const operation of operations) {
        if (!operation.libelle?.trim()) continue;

        const payload = buildOperationPayload(operation);

        if (operation.idOperation) {
          await updateGammeOperation(operation.idOperation, payload);
        } else {
          await createGammeOperation(idGamme, payload as CreateGammeOperationPayload);
        }
      }

      const updated = await getGammeById(idGamme);

      setGamme(updated);
      setOperations(normalizeOperations(updated.gamme_operation));

      setSuccess('Opérations mises à jour avec succès.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la mise à jour des opérations.',
      );
    } finally {
      setSavingOperations(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <RefreshCcw
            size={26}
            className="mx-auto animate-spin text-slate-400"
          />

          <p className="mt-4 text-sm font-black text-slate-500">
            Chargement de la gamme...
          </p>
        </section>
      </main>
    );
  }

  if (!gamme) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
          Gamme introuvable.
        </section>
      </main>
    );
  }

  const isSaving = savingGeneral || savingOperations;

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1280px] space-y-5">
        <button
          type="button"
          onClick={() => router.push(`/gammes/${idGamme}`)}
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

        {success && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700">
            {success}
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
                    Modifier gamme
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight">
                    {gamme.libelle || `Gamme #${gamme.idGamme}`}
                  </h1>

                  <p className="mt-2 text-sm font-semibold text-white/85">
                    Modifiez les informations générales et les opérations de la gamme.
                  </p>
                </div>
              </div>

              {activeTab === 'general' ? (
                <button
                  type="submit"
                  form={FORM_ID}
                  disabled={isSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save
                    size={17}
                    className={savingGeneral ? 'animate-pulse' : ''}
                  />
                  Enregistrer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveOperations}
                  disabled={isSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save
                    size={17}
                    className={savingOperations ? 'animate-pulse' : ''}
                  />
                  Enregistrer opérations
                </button>
              )}
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
                label={`Opérations (${operations.length})`}
                onClick={() => setActiveTab('operations')}
              />
            </div>
          </div>

          <div className="p-6">
            <div className={activeTab === 'general' ? 'block' : 'hidden'}>
              <GammeForm
                formId={FORM_ID}
                initialData={gamme}
                submitting={savingGeneral}
                submitLabel="Enregistrer"
                showHeader={false}
                showFooterActions={false}
                onSubmit={(payload) =>
                  handleSubmitGeneral(payload as UpdateGammePayload)
                }
              />
            </div>

            <div className={activeTab === 'operations' ? 'block' : 'hidden'}>
              <GammeOperationsPanel
                operations={operations}
                onOperationsChange={setOperations}
                title="Opérations"
                description="Ajoutez, modifiez ou supprimez les opérations associées à cette gamme."
              />

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveOperations}
                  disabled={isSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#043747] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save
                    size={17}
                    className={savingOperations ? 'animate-pulse' : ''}
                  />
                  Enregistrer opérations
                </button>
              </div>
            </div>
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