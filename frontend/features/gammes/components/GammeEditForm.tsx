'use client';

type GammeEditFormProps = {
  values: {
    code: string;
    libelle: string;
    typeMaintenance: string;
    etat: string;
    organisation: string;
    jourFin: string;
    chargePrevue: string;
    tempsArret: string;
    receptionTravaux: boolean;
    actif: boolean;
  };
  saving: boolean;
  error: string | null;
  success: string | null;
  setField: <K extends keyof GammeEditFormProps['values']>(
    field: K,
    value: GammeEditFormProps['values'][K],
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function GammeEditForm({
  values,
  saving,
  error,
  success,
  setField,
  onSubmit,
}: GammeEditFormProps) {
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
            Modifier la gamme
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
            Mets à jour les informations principales de la gamme.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Code
            </label>
            <input
              type="text"
              value={values.code}
              onChange={(e) => setField('code', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
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
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Type de maintenance
            </label>
            <select
              value={values.typeMaintenance}
              onChange={(e) => setField('typeMaintenance', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="">Sélectionner</option>
              <option value="PREVENTIF">Préventif</option>
              <option value="CORRECTIF">Correctif</option>
            </select>
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              État
            </label>
            <select
              value={values.etat}
              onChange={(e) => setField('etat', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="">Sélectionner</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="VALIDE">Validé</option>
              <option value="INACTIF">Inactif</option>
            </select>
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Organisation
            </label>
            <input
              type="text"
              value={values.organisation}
              onChange={(e) => setField('organisation', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Jour de fin
            </label>
            <input
              type="number"
              value={values.jourFin}
              onChange={(e) => setField('jourFin', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Charge prévue
            </label>
            <input
              type="number"
              step="0.01"
              value={values.chargePrevue}
              onChange={(e) => setField('chargePrevue', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: '#183B56' }}
            >
              Temps d’arrêt
            </label>
            <input
              type="number"
              step="0.01"
              value={values.tempsArret}
              onChange={(e) => setField('tempsArret', e.target.value)}
              className="h-[50px] w-full rounded-[14px] border px-4 text-[14px] outline-none"
              style={{
                borderColor: '#E4EBF0',
                color: '#183B56',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <label
            className="inline-flex items-center gap-3 text-[14px]"
            style={{ color: '#183B56' }}
          >
            <input
              type="checkbox"
              checked={values.receptionTravaux}
              onChange={(e) => setField('receptionTravaux', e.target.checked)}
            />
            Réception travaux
          </label>

          <label
            className="inline-flex items-center gap-3 text-[14px]"
            style={{ color: '#183B56' }}
          >
            <input
              type="checkbox"
              checked={values.actif}
              onChange={(e) => setField('actif', e.target.checked)}
            />
            Actif
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-[46px] items-center justify-center rounded-[14px] px-5 text-[14px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          style={{ backgroundColor: '#1D5C83' }}
        >
          {saving ? 'Enregistrement...' : 'Mettre à jour la gamme'}
        </button>
      </div>
    </form>
  );
}