import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { ModeleApi } from '@/features/modeles/types/modele';

type ModeleRowProps = {
  modele: ModeleApi;
  onView: (idModele: number) => void;
  onEdit: (idModele: number) => void;
  onDelete: (idModele: number) => void;
};

export default function ModeleRow({
  modele,
  onView,
  onEdit,
  onDelete,
}: ModeleRowProps) {
  const etatLabel = modele.etat_modele?.libelle || 'Non défini';

  return (
    <div
      className="grid grid-cols-12 gap-3 border-b px-5 py-3 text-[13px] last:border-b-0"
      style={{ borderColor: '#F0F4F7' }}
    >
      <div className="col-span-3 flex items-center">
        <span className="font-medium" style={{ color: '#183B56' }}>
          {modele.libelle || 'Sans libellé'}
        </span>
      </div>

      <div className="col-span-2 flex items-center">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{
            backgroundColor: '#F3F7F9',
            color: '#48667B',
          }}
        >
          {modele.code || '—'}
        </span>
      </div>

      <div className="col-span-3 flex items-center" style={{ color: '#48667B' }}>
        {modele.famille?.libelle || 'Aucune'}
      </div>

      <div className="col-span-2 flex items-center">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{
            backgroundColor:
              etatLabel.toLowerCase() === 'actif' ? '#EAF7EE' : '#F4F5F7',
            color:
              etatLabel.toLowerCase() === 'actif' ? '#2F7A4F' : '#6B7280',
          }}
        >
          {etatLabel}
        </span>
      </div>

      <div className="col-span-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onView(modele.idModele)}
          className="flex h-8 w-8 items-center justify-center rounded-full border"
          style={{
            borderColor: '#E5EDF2',
            backgroundColor: '#FFFFFF',
            color: '#6B8596',
          }}
          title="Voir"
        >
          <Eye size={15} />
        </button>

        <button
          type="button"
          onClick={() => onEdit(modele.idModele)}
          className="flex h-8 w-8 items-center justify-center rounded-full border"
          style={{
            borderColor: '#E5EDF2',
            backgroundColor: '#FFFFFF',
            color: '#6B8596',
          }}
          title="Modifier"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(modele.idModele)}
          className="flex h-8 w-8 items-center justify-center rounded-full border"
          style={{
            borderColor: '#F0D7D7',
            backgroundColor: '#FFF8F8',
            color: '#B75B5B',
          }}
          title="Supprimer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}