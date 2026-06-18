

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Save, Warehouse, X } from 'lucide-react';

import { Select } from '@/components/select';
import {
  AppFieldGrid,
  AppFormField,
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
} from '@/components/app-section-layout';

import type {
  CreateMagasinDto,
  Magasin,
  UpdateMagasinDto,
} from '@/features/magasins/types/magasin';

type MagasinFormData = {
  code: string;
  libelle: string;
  actif: boolean;
};

type Props = {
  mode?: 'create' | 'edit';
  magasin?: Magasin | null;
  initialData?: Magasin | null;
  loading?: boolean;
  submitting?: boolean;
  onSubmit: (data: CreateMagasinDto | UpdateMagasinDto) => void | Promise<void>;
  onCancel?: () => void;
};

function buildInitialForm(magasin?: Magasin | null): MagasinFormData {
  return {
    code: magasin?.code ?? '',
    libelle: magasin?.libelle ?? '',
    actif: magasin?.actif !== false,
  };
}

export function MagasinForm({
  mode,
  magasin,
  initialData,
  loading = false,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  const currentMagasin = initialData ?? magasin ?? null;
  const isEdit = mode ? mode === 'edit' : Boolean(currentMagasin);

  const [form, setForm] = useState<MagasinFormData>(() =>
    buildInitialForm(currentMagasin),
  );

  const [error, setError] = useState('');

  useEffect(() => {
    setForm(buildInitialForm(currentMagasin));
  }, [currentMagasin]);

  function updateField<K extends keyof MagasinFormData>(
    key: K,
    value: MagasinFormData[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = form.code.trim();
    const libelle = form.libelle.trim();

    if (!code) {
      setError('Le code du magasin est obligatoire.');
      return;
    }

    if (!libelle) {
      setError('Le libellé du magasin est obligatoire.');
      return;
    }

    setError('');

    const payload: CreateMagasinDto | UpdateMagasinDto = {
      code,
      libelle,
      actif: form.actif,
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#06475a] to-[#0b5d73] px-6 py-5 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Warehouse size={29} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">
                  {isEdit ? 'Modification magasin' : 'Nouveau magasin'}
                </p>

                <h1 className="mt-1 min-w-0 break-words text-3xl font-black tracking-tight">
                  {isEdit
                    ? currentMagasin?.code || 'Modifier le magasin'
                    : 'Créer un magasin'}
                </h1>

                <p className="mt-2 min-w-0 break-words text-sm font-semibold text-white/75">
                  {isEdit
                    ? 'Modifiez les informations du magasin sélectionné.'
                    : 'Renseignez les informations nécessaires pour créer un magasin de stock.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={submitting || loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-bold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={16} />
                  Annuler
                </button>
              )}

              <button
                type="submit"
                disabled={submitting || loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#0b3d4f] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
              {error}
            </div>
          )}

          <AppSection title="Généralités">
            <AppFieldGrid>
              <AppFormField label="Code" required>
                <input
                  value={form.code}
                  onChange={(event) => updateField('code', event.target.value)}
                  className={appInputClassName}
                  placeholder="Ex : MAG-001"
                />
              </AppFormField>

              <AppFormField label="Libellé" required>
                <input
                  value={form.libelle}
                  onChange={(event) =>
                    updateField('libelle', event.target.value)
                  }
                  className={appInputClassName}
                  placeholder="Ex : Magasin principal"
                />
              </AppFormField>

              <AppFormField label="Actif">
                <Select
                  value={form.actif ? 'true' : 'false'}
                  onValueChange={(value: string) =>
                    updateField('actif', value === 'true')
                  }
                  items={[
                    { label: 'Actif', value: 'true' },
                    { label: 'Inactif', value: 'false' },
                  ]}
                />
              </AppFormField>
            </AppFieldGrid>
          </AppSection>

          

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting || loading}
                className={appSecondaryButtonClassName}
              >
                <X size={16} />
                Annuler
              </button>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className={appPrimaryButtonClassName}
            >
              <Save size={16} />
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default MagasinForm;