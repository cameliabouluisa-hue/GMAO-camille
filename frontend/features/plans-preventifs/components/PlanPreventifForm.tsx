

import type { Materiel, PlanPreventifPredefini } from '../types/plan-preventif.types';

type Values = {
  code: string;
  libelle: string;
  etat: string;
  typeDeclenchement: string;
  idMateriel: string;
  idPlanPreventifPredefiniSource: string;
  organisation: string;
  masquerLignesInactives: boolean;
  actif: boolean;
};

type Props = {
  values: Values;
  materiels: Materiel[];
  plansPredefinis: PlanPreventifPredefini[];
  saving: boolean;
  error: string | null;
  success?: string | null;
  setField: <K extends keyof Values>(field: K, value: Values[K]) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function PlanPreventifForm({
  values,
  materiels,
  plansPredefinis,
  saving,
  error,
  success,
  setField,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[18px] border p-5 shadow-sm"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E6EDF2',
      }}
    >
      {error && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-[13px]"
          style={{
            borderColor: '#E8B4B4',
            color: '#8A1F1F',
            backgroundColor: '#FFF7F7',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-[13px]"
          style={{
            borderColor: '#B9E2C4',
            color: '#1F6B3A',
            backgroundColor: '#F5FFF7',
          }}
        >
          {success}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Code
          </label>
          <input
            value={values.code}
            onChange={(e) => setField('code', e.target.value)}
            placeholder="Ex: PP-CH-001"
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Libellé *
          </label>
          <input
            value={values.libelle}
            onChange={(e) => setField('libelle', e.target.value)}
            placeholder="Ex: Plan chariot CH-001"
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            État
          </label>
          <select
            value={values.etat}
            onChange={(e) => setField('etat', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          >
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="BROUILLON">Brouillon</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Type déclenchement
          </label>
          <select
            value={values.typeDeclenchement}
            onChange={(e) => setField('typeDeclenchement', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          >
            <option value="AUTOMATIQUE">Automatique</option>
            <option value="MANUEL">Manuel</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Matériel *
          </label>
          <select
            value={values.idMateriel}
            onChange={(e) => setField('idMateriel', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          >
            <option value="">Sélectionner un matériel</option>
            {materiels.map((materiel) => (
              <option key={materiel.idMateriel} value={materiel.idMateriel}>
                {materiel.code}
                {materiel.modele?.libelle ? ` · ${materiel.modele.libelle}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Plan prédéfini source
          </label>
          <select
            value={values.idPlanPreventifPredefiniSource}
            onChange={(e) =>
              setField('idPlanPreventifPredefiniSource', e.target.value)
            }
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          >
            <option value="">Aucun</option>
            {plansPredefinis.map((plan) => (
              <option
                key={plan.idPlanPreventifPredefini}
                value={plan.idPlanPreventifPredefini}
              >
                {plan.code} · {plan.titre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#6E8CA0' }}>
            Organisation
          </label>
          <input
            value={values.organisation}
            onChange={(e) => setField('organisation', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
            style={{ borderColor: '#E6EDF2', color: '#183B56' }}
          />
        </div>

        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 text-[13px]" style={{ color: '#183B56' }}>
            <input
              type="checkbox"
              checked={values.masquerLignesInactives}
              onChange={(e) =>
                setField('masquerLignesInactives', e.target.checked)
              }
            />
            Masquer lignes inactives
          </label>

          <label className="flex items-center gap-2 text-[13px]" style={{ color: '#183B56' }}>
            <input
              type="checkbox"
              checked={values.actif}
              onChange={(e) => setField('actif', e.target.checked)}
            />
            Actif
          </label>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-[42px] items-center justify-center rounded-[12px] px-5 text-[13px] font-semibold text-white transition disabled:opacity-60"
          style={{ backgroundColor: '#0F5F78' }}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}