

import {
  Building2,
  GitBranch,
  Hash,
  Info,
  Layers3,
  MapPin,
  Package,
  X,
} from 'lucide-react';

import { PointStructureDetail } from '../types/point-structure.type';

type Props = {
  point: PointStructureDetail;
  onClose: () => void;
  onEdit?: () => void;
};

export function PointStructureDetailModal({
  point,
  onClose,
  onEdit,
}: Props) {
  const isGeo = point.typePoint === 'GEOGRAPHIQUE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-7 py-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                isGeo
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-orange-50 text-orange-700'
              }`}
            >
              {isGeo ? <MapPin size={27} /> : <GitBranch size={27} />}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Fiche point de structure
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {point.libelle || 'Sans libellé'}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  Code : {point.code || '-'}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isGeo
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-orange-50 text-orange-700'
                  }`}
                >
                  {isGeo ? 'Géographique' : 'Technique'}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    point.actif
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {point.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-7 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            <InfoCard
              icon={<Hash size={20} />}
              label="Code"
              value={point.code || '-'}
            />

            <InfoCard
              icon={<Layers3 size={20} />}
              label="Type"
              value={isGeo ? 'Géographique' : 'Technique'}
            />

            <InfoCard
              icon={<Package size={20} />}
              label="Matériels"
              value={String(point.materiels?.length ?? point.nbMateriels ?? 0)}
            />

            <InfoCard
              icon={<Building2 size={20} />}
              label="Statut"
              value={point.actif ? 'Actif' : 'Inactif'}
            />
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Info size={18} className="text-slate-400" />
              <h3 className="font-black text-slate-900">
                Description
              </h3>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              {point.description || 'Aucune description renseignée.'}
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900">
                  Matériels rattachés
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Liste des matériels associés à ce point de structure.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {point.materiels?.length ?? 0}
              </span>
            </div>

            {!point.materiels || point.materiels.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm font-semibold text-slate-500">
                Aucun matériel rattaché à ce point.
              </div>
            ) : (
              <div className="space-y-2">
                {point.materiels.map((materiel) => (
                  <div
                    key={materiel.idMateriel}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-black text-slate-900">
                        {materiel.numeroSerie || materiel.code || '-'}
                      </p>
                      <p className="text-sm text-slate-500">
                        Code : {materiel.code || '-'}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        materiel.actif
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {materiel.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Fermer
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-2xl bg-[#0b3d4f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#082f3d]"
            >
              Modifier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
        {icon}
      </div>

      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}