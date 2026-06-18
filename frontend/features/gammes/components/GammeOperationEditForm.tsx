'use client';

type GammeOperationEditFormProps = {
  values: {
    ordre: string;
    libelle: string;
    description: string;
    tempsStandard: string;
    obligatoire: boolean;
  };
  saving: boolean;
  error: string | null;
  success: string | null;
  setField: <K extends keyof GammeOperationEditFormProps['values']>(
    field: K,
    value: GammeOperationEditFormProps['values'][K],
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function GammeOperationEditForm({
  values,
  saving,
  error,
  success,
  setField,
  onSubmit,
}: GammeOperationEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div
          className="rounded-xl border px-4 py-3 text-[13px]"
          style={{
            borderColor: '#E8B4B4',
            color: '#8A1F1F',
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-xl border px-4 py-3 text-[13px]"
          style={{
            borderColor: '#CDE7D8',
            color: '#256B45',
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          {success}
        </div>
      )}

      <div
        className="rounded-[20px] border p-5"
        style={{
          borderColor: '#E4EBF0',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(15, 35, 55, 0.05)',
        }}
      >
        <div className="mb-5">
          <h2
            className="text-[18px] font-semibold"
            style={{ color: '#183B56' }}
          >
            Modifier l’opération
          </h2>

          <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
            Mets à jour les informations de cette opération de maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Ordre
            </label>

            <input
              type="number"
              value={values.ordre}
              onChange={(e) => setField('ordre', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Ex: 1"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Libellé *
            </label>

            <input
              type="text"
              value={values.libelle}
              onChange={(e) => setField('libelle', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Ex: Contrôle niveau d'huile"
            />
          </div>

          <div className="md:col-span-2">
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Description
            </label>

            <textarea
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              className="min-h-[110px] w-full rounded-[14px] border px-4 py-3 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Décris l'opération à réaliser..."
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Temps standard
            </label>

            <input
              type="number"
              value={values.tempsStandard}
              onChange={(e) => setField('tempsStandard', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Ex: 20"
            />
          </div>

          <div className="flex items-end">
            <label
              className="inline-flex items-center gap-3 text-[14px]"
              style={{ color: '#183B56' }}
            >
              <input
                type="checkbox"
                checked={values.obligatoire}
                onChange={(e) => setField('obligatoire', e.target.checked)}
              />
              Opération obligatoire
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-[46px] items-center justify-center rounded-[14px] px-5 text-[14px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          style={{ backgroundColor: '#1D5C83' }}
        >
          {saving ? 'Enregistrement...' : 'Mettre à jour l’opération'}
        </button>
      </div>
    </form>
  );
}