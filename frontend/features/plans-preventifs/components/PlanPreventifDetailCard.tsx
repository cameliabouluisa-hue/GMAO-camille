
import { Pencil, RefreshCcw, Trash2 } from 'lucide-react';

import type { PlanPreventif } from '../types/plan-preventif.types';
import PlanPreventifDeclencheurTable from './PlanPreventifDeclencheurTable';

type Props = {
  plan: PlanPreventif;
  deleting: boolean;
  actionLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRegenerateDeclencheurs: () => void;
  onGenerateOt: (idDeclencheur: number) => void;
};

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: '#6E8CA0' }}
      >
        {label}
      </p>
      <p className="mt-1 text-[14px] font-semibold" style={{ color: '#183B56' }}>
        {value || '-'}
      </p>
    </div>
  );
}

export default function PlanPreventifDetailCard({
  plan,
  deleting,
  actionLoading,
  onEdit,
  onDelete,
  onRegenerateDeclencheurs,
  onGenerateOt,
}: Props) {
  return (
    <div className="space-y-5">
      <div
        className="rounded-[18px] border p-5 shadow-sm"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E6EDF2' }}
      >
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-[18px] font-bold" style={{ color: '#183B56' }}>
              Informations générales
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
              Consultation des informations principales du plan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRegenerateDeclencheurs}
              disabled={actionLoading}
              className="inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-[12px] font-semibold"
              style={{
                borderColor: '#E6EDF2',
                backgroundColor: '#FFFFFF',
                color: '#183B56',
              }}
            >
              <RefreshCcw size={14} />
              Régénérer
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-[12px] font-semibold"
              style={{
                borderColor: '#E6EDF2',
                backgroundColor: '#FFFFFF',
                color: '#183B56',
              }}
            >
              <Pencil size={14} />
              Modifier
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-[12px] font-semibold disabled:opacity-60"
              style={{
                borderColor: '#E8B4B4',
                backgroundColor: '#FFFFFF',
                color: '#8A1F1F',
              }}
            >
              <Trash2 size={14} />
              Supprimer
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <InfoItem label="Code" value={plan.code} />
          <InfoItem label="Libellé" value={plan.libelle} />
          <InfoItem label="État" value={plan.etat} />
          <InfoItem label="Déclenchement" value={plan.typeDeclenchement} />
          <InfoItem label="Organisation" value={plan.organisation} />
          <InfoItem label="Matériel" value={plan.materiel?.code} />
          <InfoItem label="Modèle" value={plan.materiel?.modele?.libelle} />
          <InfoItem label="Source" value={plan.plan_preventif_predefini?.code} />
          <InfoItem
            label="Actif"
            value={plan.actif ? 'Oui' : 'Non'}
          />
        </div>
      </div>

      <div
        className="rounded-[18px] border p-5 shadow-sm"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E6EDF2' }}
      >
        <div className="mb-4">
          <h2 className="text-[18px] font-bold" style={{ color: '#183B56' }}>
            Déclencheurs
          </h2>

          <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
            Déclencheurs liés au plan préventif.
          </p>
        </div>

        <PlanPreventifDeclencheurTable
          declencheurs={plan.plan_preventif_declencheur || []}
          actionLoading={actionLoading}
          onGenerateOt={onGenerateOt}
        />
      </div>
    </div>
  );
}