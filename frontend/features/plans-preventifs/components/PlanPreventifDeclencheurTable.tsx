import { Zap } from 'lucide-react';

import type { PlanPreventifDeclencheur } from '../types/plan-preventif.types';

type Props = {
  declencheurs: PlanPreventifDeclencheur[];
  actionLoading: boolean;
  onGenerateOt: (idDeclencheur: number) => void;
};

function formatDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR').format(date);
}

function display(value?: string | number | boolean | null) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return String(value);
}

function displayGamme(declencheur: PlanPreventifDeclencheur) {
  if (declencheur.gamme) {
    return `${declencheur.gamme.code} · ${declencheur.gamme.libelle}`;
  }

  return declencheur.idGamme ? `Gamme #${declencheur.idGamme}` : '-';
}

function displayRegle(declencheur: PlanPreventifDeclencheur) {
  const type = declencheur.typeDeclencheur;

  if (type === 'CALENDAIRE') {
    if (declencheur.periodiciteValeur && declencheur.periodiciteUnite) {
      return `${declencheur.periodiciteValeur} ${declencheur.periodiciteUnite}`;
    }

    return '-';
  }

  if (type === 'COMPTEUR' || type === 'CONDITIONNEL') {
    const pointMesure = declencheur.point_mesure
      ? `${declencheur.point_mesure.code} · ${declencheur.point_mesure.libelle}`
      : declencheur.idPointMesure
        ? `Point de mesure #${declencheur.idPointMesure}`
        : 'Point de mesure non défini';

    const unite = declencheur.point_mesure?.unite
      ? ` ${declencheur.point_mesure.unite}`
      : '';

    const operateur = declencheur.operateur ?? '';
    const seuil = declencheur.seuilValeur ?? '';

    return `${pointMesure} ${operateur} ${seuil}${unite}`;
  }

  return '-';
}

function displayProchainLancement(declencheur: PlanPreventifDeclencheur) {
  if (declencheur.typeDeclencheur === 'CALENDAIRE') {
    return formatDate(declencheur.prochainLancementDate);
  }

  if (
    declencheur.typeDeclencheur === 'COMPTEUR' ||
    declencheur.typeDeclencheur === 'CONDITIONNEL'
  ) {
    const derniereValeur = declencheur.point_mesure?.derniereValeur;

    if (derniereValeur === null || derniereValeur === undefined) {
      return 'Aucun relevé';
    }

    const unite = declencheur.point_mesure?.unite
      ? ` ${declencheur.point_mesure.unite}`
      : '';

    return `Dernière valeur : ${derniereValeur}${unite}`;
  }

  return '-';
}

export default function PlanPreventifDeclencheurTable({
  declencheurs,
  actionLoading,
  onGenerateOt,
}: Props) {
  return (
    <div className="max-w-full overflow-x-auto pb-2">
      <table className="w-full min-w-[1120px] border-collapse text-left">
        <thead>
          <tr
            className="border-b text-[11px] uppercase tracking-[0.16em]"
            style={{ borderColor: '#E6EDF2', color: '#6E8CA0' }}
          >
            <th className="py-3 pr-4 font-semibold">ID</th>
            <th className="py-3 pr-4 font-semibold">Type</th>
            <th className="py-3 pr-4 font-semibold">État</th>
            <th className="py-3 pr-4 font-semibold">Gamme</th>
            <th className="py-3 pr-4 font-semibold">Règle</th>
            <th className="py-3 pr-4 font-semibold">Suivi</th>
            <th className="py-3 pr-4 font-semibold">Actif</th>
            <th className="py-3 pr-4 text-right font-semibold">Action</th>
          </tr>
        </thead>

        <tbody>
          {declencheurs.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="py-6 text-center text-[13px]"
                style={{ color: '#6B8596' }}
              >
                Aucun déclencheur trouvé.
              </td>
            </tr>
          )}

          {declencheurs.map((declencheur) => (
            <tr
              key={declencheur.idPlanPreventifDeclencheur}
              className="border-b text-[13px]"
              style={{ borderColor: '#EEF3F6', color: '#183B56' }}
            >
              <td className="py-3 pr-4 font-semibold">
                {declencheur.idPlanPreventifDeclencheur}
              </td>

              <td className="py-3 pr-4">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: '#EEF6F8',
                    color: '#0F5F78',
                  }}
                >
                  {display(declencheur.typeDeclencheur)}
                </span>
              </td>

              <td className="py-3 pr-4">{display(declencheur.etat)}</td>

              <td className="py-3 pr-4">{displayGamme(declencheur)}</td>

              <td className="max-w-[360px] py-3 pr-4">
                <span className="line-clamp-2">
                  {displayRegle(declencheur)}
                </span>
              </td>

              <td className="py-3 pr-4">
                {displayProchainLancement(declencheur)}
              </td>

              <td className="py-3 pr-4">{display(declencheur.actif)}</td>

              <td className="py-3 pr-4 text-right">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    onGenerateOt(declencheur.idPlanPreventifDeclencheur)
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-[12px] font-semibold text-white transition disabled:opacity-60"
                  style={{ backgroundColor: '#0F5F78' }}
                >
                  <Zap size={14} />
                  Générer OT
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}