'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';

import { Select } from '@/components/select';
import {
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
} from '@/components/app-section-layout';

import {
  getApiErrorMessage,
  getInterventionReferenceData,
} from '../services/intervention.service';
import type {
  ConsommationIntervention,
  CreateConsommationInterventionDto,
  InterventionReferenceData,
} from '../types/intervention.types';
import { Badge, formatDateTime, formatNumber } from './InterventionTable';

type Props = {
  interventionEtat?: string | null;
  consommations?: ConsommationIntervention[];
  loading?: boolean;
  onCreate: (data: CreateConsommationInterventionDto) => void;
  onCancel: (idConsommation: number) => void;
};

type SelectItem = {
  label: string;
  value: string;
};

const EMPTY_SELECT_VALUE = '__EMPTY_VALUE__';

const emptyReferences: InterventionReferenceData = {
  materiels: [],
  pointsStructure: [],
  demandes: [],
  plansPreventifs: [],
  declencheurs: [],
  gammes: [],
  equipes: [],
  techniciens: [],
  articles: [],
  magasins: [],
};

export function ConsommationSection({
  interventionEtat,
  consommations = [],
  loading = false,
  onCreate,
  onCancel,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [idArticle, setIdArticle] = useState('');
  const [idMagasin, setIdMagasin] = useState('');
  const [quantite, setQuantite] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [error, setError] = useState('');
  const [references, setReferences] =
    useState<InterventionReferenceData>(emptyReferences);
  const [referenceError, setReferenceError] = useState('');

  const canAdd = interventionEtat === 'EN_COURS';

  const articles = useMemo(
    () =>
      references.articles.filter(
        (article) => article.actif !== false && article.gereEnStock !== false,
      ),
    [references.articles],
  );

  const magasins = useMemo(
    () => references.magasins.filter((magasin) => magasin.actif !== false),
    [references.magasins],
  );

  const articleItems: SelectItem[] = articles.map((article) => ({
    value: String(article.idArticle),
    label: formatArticle(article),
  }));

  const magasinItems: SelectItem[] = magasins.map((magasin) => ({
    value: String(magasin.idMagasin),
    label: formatCodeLibelle(magasin.code, magasin.libelle, magasin.idMagasin),
  }));

  useEffect(() => {
    let mounted = true;

    getInterventionReferenceData()
      .then((data) => {
        if (mounted) {
          setReferences(data);
          setReferenceError('');
        }
      })
      .catch((error) => {
        if (mounted) {
          setReferenceError(
            getApiErrorMessage(
              error,
              'Impossible de charger les articles ou magasins.',
            ),
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedQuantite = parseOptionalNumber(quantite);

    if (!idArticle) {
      setError('Veuillez sélectionner un article.');
      return;
    }

    if (!idMagasin) {
      setError('Veuillez sélectionner un magasin.');
      return;
    }

    if (!parsedQuantite || parsedQuantite <= 0) {
      setError('Veuillez saisir une quantité valide.');
      return;
    }

    setError('');

    onCreate({
      idArticle: Number(idArticle),
      idMagasin: Number(idMagasin),
      quantite: parsedQuantite,
      prixUnitaire: parseOptionalNumber(prixUnitaire),
      commentaire: commentaire.trim() || undefined,
      createdBy: 'Admin',
    });

    setShowForm(false);
    setIdArticle('');
    setIdMagasin('');
    setQuantite('');
    setPrixUnitaire('');
    setCommentaire('');
  }

  return (
    <AppSection title="Consommations stock">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-bold text-slate-500">
          La consommation est autorisée seulement lorsque l&apos;intervention est EN_COURS.
        </p>

        <button
          type="button"
          disabled={!canAdd || loading}
          onClick={() => setShowForm((current) => !current)}
          className={`${appSecondaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? 'Fermer' : 'Ajouter consommation'}
        </button>
      </div>

      {referenceError && (
        <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          {referenceError}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-5 grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_130px_130px_auto]"
        >
          <SelectControl
            value={idArticle}
            onChange={setIdArticle}
            placeholder="Sélectionner un article"
            clearLabel="Sélectionner un article"
            items={articleItems}
            disabled={loading}
          />

          <SelectControl
            value={idMagasin}
            onChange={setIdMagasin}
            placeholder="choisir magasin"
            clearLabel=" choisir magasin"
            items={magasinItems}
            disabled={loading}
          />

          <input
            type="text"
            inputMode="decimal"
            value={quantite}
            onChange={(event) => setQuantite(event.target.value)}
            className={`${appInputClassName} min-w-0`}
            placeholder="Quantité"
          />

          <input
            type="text"
            inputMode="decimal"
            value={prixUnitaire}
            onChange={(event) => setPrixUnitaire(event.target.value)}
            className={`${appInputClassName} min-w-0`}
            placeholder="Prix unitaire"
          />

          <button
            type="submit"
            disabled={loading}
            className={appPrimaryButtonClassName}
          >
            Consommer
          </button>

          <input
            value={commentaire}
            onChange={(event) => setCommentaire(event.target.value)}
            className={`${appInputClassName} min-w-0 md:col-span-2 xl:col-span-5`}
            placeholder="Commentaire"
          />
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="bg-[#06475a] text-sm font-black text-white">
                <th className="px-5 py-4 align-middle">Date</th>
                <th className="px-5 py-4 align-middle">Article</th>
                <th className="px-5 py-4 align-middle">Magasin</th>
                <th className="px-5 py-4 align-middle">Quantité</th>
                <th className="px-5 py-4 align-middle">Coût</th>
                <th className="px-5 py-4 align-middle">Statut</th>
                <th className="px-5 py-4 text-right align-middle">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {consommations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-7 text-center text-sm font-bold text-slate-500"
                  >
                    Aucune consommation enregistrée.
                  </td>
                </tr>
              ) : (
                consommations.map((consommation) => (
                  <tr key={consommation.idConsommation} className="text-sm">
                    <td className="px-5 py-4 align-middle font-bold text-slate-700">
                      {formatDateTime(consommation.createdAt)}
                    </td>

                    <td className="max-w-[220px] px-5 py-4 align-middle font-black text-slate-600">
                      <span className="block truncate">
                        {consommation.article?.reference ||
                          consommation.article?.designation ||
                          consommation.idArticle}
                      </span>
                    </td>

                    <td className="max-w-[260px] px-5 py-4 align-middle font-black  text-slate-600">
                      <span className="block truncate">
                        {consommation.magasin?.code ||
                          consommation.magasin?.libelle ||
                          consommation.idMagasin 
                          }
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle font-bold text-slate-700">
                      {formatNumber(consommation.quantite)}
                    </td>

                    <td className="px-5 py-4 align-middle font-bold text-slate-700">
                      {formatNumber(consommation.coutTotal)}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <Badge
                        tone={
                          consommation.statut === 'ANNULEE'
                            ? 'danger'
                            : 'success'
                        }
                      >
                        {consommation.statut || 'ACTIVE'}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right align-middle">
                      <button
                        type="button"
                        disabled={
                          loading || consommation.statut === 'ANNULEE'
                        }
                        onClick={() => onCancel(consommation.idConsommation)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Annuler et restaurer le stock"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppSection>
  );
}

function SelectControl({
  value,
  onChange,
  placeholder,
  clearLabel,
  items,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearLabel?: string;
  items: SelectItem[];
  disabled?: boolean;
}) {
  const normalizedValue = value || EMPTY_SELECT_VALUE;

  const normalizedItems = clearLabel
    ? [{ value: EMPTY_SELECT_VALUE, label: clearLabel }, ...items]
    : items;

  if (disabled) {
    return (
      <div className="flex h-11 w-full min-w-0 items-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400">
        <span className="truncate">{clearLabel || placeholder}</span>
      </div>
    );
  }

  return (
    <Select
      value={normalizedValue}
      onValueChange={(nextValue) =>
        onChange(nextValue === EMPTY_SELECT_VALUE ? '' : nextValue)
      }
      placeholder={placeholder}
      items={normalizedItems}
    />
  );
}

function formatArticle(article: {
  idArticle: number;
  reference?: string | null;
  designation?: string | null;
  libelle?: string | null;
}) {
  return (
    [article.reference, article.designation || article.libelle]
      .filter(Boolean)
      .join(' - ') || `Article #${article.idArticle}`
  );
}

function formatCodeLibelle(
  code?: string | null,
  libelle?: string | null,
  id?: number | null,
) {
  return [code, libelle].filter(Boolean).join(' - ') || `#${id ?? ''}`;
}

function parseOptionalNumber(value: string) {
  const normalized = value.trim().replace(',', '.');

  if (!normalized) return undefined;

  const number = Number(normalized);

  return Number.isFinite(number) ? number : undefined;
}