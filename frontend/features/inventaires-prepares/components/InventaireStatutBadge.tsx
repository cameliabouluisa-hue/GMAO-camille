import { InventaireStatut } from '../types/inventaire-prepare.types';

type Props = {
  statut: InventaireStatut;
};

export function InventaireStatutBadge({ statut }: Props) {
  const config: Record<
    string,
    { label: string; className: string }
  > = {
    BROUILLON: {
      label: 'Brouillon',
      className: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    EN_COMPTAGE: {
      label: 'En comptage',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    VALIDE: {
      label: 'Validé',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    ANNULE: {
      label: 'Annulé',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };

  const current =
    config[statut] || {
      label: statut,
      className: 'bg-slate-100 text-slate-700 border-slate-200',
    };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${current.className}`}
    >
      {current.label}
    </span>
  );
}