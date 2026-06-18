import type { ModeleApi } from '@/features/modeles/types/modele';
import ModeleRow from '@/features/modeles/components/modele-row';

type ModeleTableProps = {
  modeles: ModeleApi[];
  onView: (idModele: number) => void;
  onEdit: (idModele: number) => void;
  onDelete: (idModele: number) => void;
};

export default function ModeleTable({
  modeles,
  onView,
  onEdit,
  onDelete,
}: ModeleTableProps) {
  return (
    <>
      <div
        className="grid grid-cols-12 gap-3 border-b px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{
          borderColor: '#EEF3F6',
          color: '#7B93A4',
          backgroundColor: '#FAFCFD',
        }}
      >
        <div className="col-span-3">Modèle</div>
        <div className="col-span-2">Code modèle</div>
        <div className="col-span-3">Famille</div>
        <div className="col-span-2">État</div>
        <div className="col-span-2 text-center">Actions</div>
      </div>

      {modeles.length === 0 ? (
        <div className="px-5 py-4 text-[13px]" style={{ color: '#183B56' }}>
          Aucun modèle trouvé.
        </div>
      ) : (
        <div>
          {modeles.map((modele) => (
            <ModeleRow
              key={modele.idModele}
              modele={modele}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}