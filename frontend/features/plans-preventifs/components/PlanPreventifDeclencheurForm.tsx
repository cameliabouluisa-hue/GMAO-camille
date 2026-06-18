

import { useEffect, useMemo, useState } from 'react';

import {
  getPointsMesureForPlanPreventif,
} from '../services/plan-preventif.service';

import type {
  Gamme,
  PointMesure,
} from '../types/plan-preventif.types';

type Values = {
  typeDeclencheur: string;
  etat: string;
  idGamme: string;
  priorite: string;

  periodiciteValeur: string;
  periodiciteUnite: string;
  prochainLancementDate: string;

  idPointMesure: string;
  operateur: string;
  seuilValeur: string;
};

type Props = {
  values: Values;
  gammes: Gamme[];
  saving: boolean;
  error: string | null;
  setField: <K extends keyof Values>(field: K, value: Values[K]) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const OPERATEURS = ['>=', '>', '<=', '<', '='];

export default function PlanPreventifDeclencheurForm({
  values,
  gammes,
  saving,
  error,
  setField,
  onSubmit,
}: Props) {
  const [pointsMesure, setPointsMesure] = useState<PointMesure[]>([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);

  const isCalendaire = values.typeDeclencheur === 'CALENDAIRE';

  const isMesure =
    values.typeDeclencheur === 'COMPTEUR' ||
    values.typeDeclencheur === 'CONDITIONNEL';

  const pointsMesureFiltres = useMemo(() => {
    if (!isMesure) return [];

    return pointsMesure.filter(
      (point) =>
        point.actif !== false && point.type === values.typeDeclencheur,
    );
  }, [pointsMesure, values.typeDeclencheur, isMesure]);

  useEffect(() => {
    async function loadPointsMesure() {
      try {
        setPointsLoading(true);
        setPointsError(null);

        const data = await getPointsMesureForPlanPreventif();
        setPointsMesure(data);
      } catch (err) {
        setPointsError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des points de mesure.',
        );
      } finally {
        setPointsLoading(false);
      }
    }

    loadPointsMesure();
  }, []);

  function inputStyle() {
    return {
      borderColor: '#E6EDF2',
      color: '#183B56',
      backgroundColor: '#FFFFFF',
    } as const;
  }

  function handleTypeChange(type: string) {
    setField('typeDeclencheur', type);

    if (type === 'CALENDAIRE') {
      setField('periodiciteUnite', 'JOUR');
      setField('idPointMesure', '');
      setField('operateur', '');
      setField('seuilValeur', '');
      return;
    }

    if (type === 'COMPTEUR' || type === 'CONDITIONNEL') {
      setField('periodiciteValeur', '');
      setField('periodiciteUnite', '');
      setField('prochainLancementDate', '');
      setField('idPointMesure', '');
      setField('operateur', '>=');
      setField('seuilValeur', '');
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[18px] border p-5 shadow-sm"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E6EDF2' }}
    >
      <h2 className="text-[18px] font-bold" style={{ color: '#183B56' }}>
        Nouveau déclencheur
      </h2>

      <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
        Ajouter un déclencheur calendaire, compteur ou conditionnel au plan
        préventif.
      </p>

      {error && (
        <div
          className="mt-4 rounded-xl border px-4 py-3 text-[13px]"
          style={{
            borderColor: '#E8B4B4',
            color: '#8A1F1F',
            backgroundColor: '#FFF7F7',
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: '#6E8CA0' }}
          >
            Type
          </label>

          <select
            value={values.typeDeclencheur}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={inputStyle()}
          >
            <option value="CALENDAIRE">Calendaire</option>
            <option value="COMPTEUR">Compteur</option>
            <option value="CONDITIONNEL">Conditionnel</option>
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: '#6E8CA0' }}
          >
            État
          </label>

          <select
            value={values.etat}
            onChange={(e) => setField('etat', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={inputStyle()}
          >
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: '#6E8CA0' }}
          >
            Priorité
          </label>

          <input
            type="number"
            min="1"
            value={values.priorite}
            onChange={(e) => setField('priorite', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={inputStyle()}
          />
        </div>

        <div className="md:col-span-3">
          <label
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: '#6E8CA0' }}
          >
            Gamme *
          </label>

          <select
            value={values.idGamme}
            onChange={(e) => setField('idGamme', e.target.value)}
            className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
            style={inputStyle()}
          >
            <option value="">Sélectionner une gamme</option>
            {gammes.map((gamme) => (
              <option key={gamme.idGamme} value={gamme.idGamme}>
                {gamme.code} · {gamme.libelle}
              </option>
            ))}
          </select>
        </div>

        {isCalendaire && (
          <>
            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Périodicité *
              </label>

              <input
                type="number"
                min="1"
                value={values.periodiciteValeur}
                onChange={(e) =>
                  setField('periodiciteValeur', e.target.value)
                }
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
                style={inputStyle()}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Unité *
              </label>

              <select
                value={values.periodiciteUnite}
                onChange={(e) =>
                  setField('periodiciteUnite', e.target.value)
                }
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
                style={inputStyle()}
              >
                <option value="JOUR">Jour</option>
                <option value="SEMAINE">Semaine</option>
                <option value="MOIS">Mois</option>
                <option value="ANNEE">Année</option>
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Prochain lancement
              </label>

              <input
                type="date"
                value={values.prochainLancementDate}
                onChange={(e) =>
                  setField('prochainLancementDate', e.target.value)
                }
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
                style={inputStyle()}
              />
            </div>
          </>
        )}

        {isMesure && (
          <>
            <div className="md:col-span-3">
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Point de mesure *
              </label>

              <select
                value={values.idPointMesure}
                onChange={(e) => setField('idPointMesure', e.target.value)}
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
                style={inputStyle()}
              >
                <option value="">
                  {pointsLoading
                    ? 'Chargement des points de mesure...'
                    : `Sélectionner un point de mesure ${values.typeDeclencheur.toLowerCase()}`}
                </option>

                {pointsMesureFiltres.map((point) => (
                  <option
                    key={point.idPointMesure}
                    value={point.idPointMesure}
                  >
                    {point.code} · {point.libelle}
                    {point.unite ? ` (${point.unite})` : ''}
                  </option>
                ))}
              </select>

              {pointsError && (
                <p className="mt-1 text-[12px]" style={{ color: '#C0392B' }}>
                  {pointsError}
                </p>
              )}

              {!pointsLoading && pointsMesureFiltres.length === 0 && (
                <p className="mt-1 text-[12px]" style={{ color: '#6B8596' }}>
                  Aucun point de mesure de type {values.typeDeclencheur} trouvé.
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Opérateur *
              </label>

              <select
                value={values.operateur}
                onChange={(e) => setField('operateur', e.target.value)}
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
                style={inputStyle()}
              >
                <option value="">Sélectionner</option>
                {OPERATEURS.map((operateur) => (
                  <option key={operateur} value={operateur}>
                    {operateur}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Valeur seuil *
              </label>

              <input
                type="number"
                value={values.seuilValeur}
                onChange={(e) => setField('seuilValeur', e.target.value)}
                placeholder={
                  values.typeDeclencheur === 'COMPTEUR' ? 'Ex : 250' : 'Ex : 90'
                }
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px]"
                style={inputStyle()}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="h-[42px] rounded-[12px] px-5 text-[13px] font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: '#0F5F78' }}
        >
          {saving ? 'Ajout...' : 'Ajouter déclencheur'}
        </button>
      </div>
    </form>
  );
}