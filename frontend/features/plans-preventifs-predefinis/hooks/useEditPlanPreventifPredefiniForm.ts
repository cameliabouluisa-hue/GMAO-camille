'use client';

import { useEffect, useState } from 'react';

import {
  createPppDeclencheur,
  deletePppDeclencheur,
  getPlanPreventifPredefiniById,
  updatePlanPreventifPredefini,
  updatePppDeclencheur,
} from '../services/plan-preventif-predefini.service';
import type {
  DeclencheurFormValues,
  PlanPreventifPredefini,
  PppDeclencheur,
} from '../types/plan-preventif-predefini.types';

type UseEditPlanPreventifPredefiniFormOptions = {
  id?: number;
  onSuccess?: () => void;
};

type FormValues = {
  code: string;
  libelle: string;
  etat: string;
  organisation: string;
  typeDeclenchement: string;
  idModele: string;
  actif: boolean;
};

const initialValues: FormValues = {
  code: '',
  libelle: '',
  etat: '',
  organisation: '',
  typeDeclenchement: '',
  idModele: '',
  actif: true,
};

const initialDeclencheurValues: DeclencheurFormValues = {
  priorite: '1',
  typeDeclencheur: 'CALENDAIRE',
  idGamme: '',
  idModele: '',
  idPointMesure: '',
  horizonJours: '',
  toleranceJours: '',
  periodiciteValeur: '',
  periodiciteUnite: 'jour',
  actif: true,
  nombreJoursPremierLancement: '',
  operateur: '',
  seuilValeur: '',
  symptomeCode: '',
};

export function useEditPlanPreventifPredefiniForm(
  options?: UseEditPlanPreventifPredefiniFormOptions,
) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [item, setItem] = useState<PlanPreventifPredefini | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [declencheurValues, setDeclencheurValues] =
    useState<DeclencheurFormValues>(initialDeclencheurValues);

  const [declencheurSaving, setDeclencheurSaving] = useState(false);
  const [declencheurError, setDeclencheurError] = useState<string | null>(null);
  const [editingDeclencheurId, setEditingDeclencheurId] = useState<
    number | null
  >(null);

  const id = options?.id;

  function setField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function setDeclencheurField<K extends keyof DeclencheurFormValues>(
    field: K,
    value: DeclencheurFormValues[K],
  ) {
    setDeclencheurValues((prev) => ({ ...prev, [field]: value }));
  }

  function resetDeclencheurForm() {
    setDeclencheurValues(initialDeclencheurValues);
    setEditingDeclencheurId(null);
    setDeclencheurError(null);
  }

  function startEditDeclencheur(declencheur: PppDeclencheur) {
    setEditingDeclencheurId(declencheur.idPppDeclencheur);
    setDeclencheurError(null);

    setDeclencheurValues({
      priorite:
        declencheur.priorite !== null && declencheur.priorite !== undefined
          ? String(declencheur.priorite)
          : '',
      typeDeclencheur: declencheur.typeDeclencheur ?? 'CALENDAIRE',
      idGamme:
        declencheur.idGamme !== null && declencheur.idGamme !== undefined
          ? String(declencheur.idGamme)
          : '',
      idModele:
        declencheur.idModele !== null && declencheur.idModele !== undefined
          ? String(declencheur.idModele)
          : '',
      idPointMesure:
        declencheur.idPointMesure !== null &&
        declencheur.idPointMesure !== undefined
          ? String(declencheur.idPointMesure)
          : '',
      horizonJours:
        declencheur.horizonJours !== null &&
        declencheur.horizonJours !== undefined
          ? String(declencheur.horizonJours)
          : '',
      toleranceJours:
        declencheur.toleranceJours !== null &&
        declencheur.toleranceJours !== undefined
          ? String(declencheur.toleranceJours)
          : '',
      periodiciteValeur:
        declencheur.periodiciteValeur !== null &&
        declencheur.periodiciteValeur !== undefined
          ? String(declencheur.periodiciteValeur)
          : '',
      periodiciteUnite: declencheur.periodiciteUnite ?? '',
      actif: declencheur.actif ?? true,
      nombreJoursPremierLancement:
        declencheur.nombreJoursPremierLancement !== null &&
        declencheur.nombreJoursPremierLancement !== undefined
          ? String(declencheur.nombreJoursPremierLancement)
          : '',
      operateur: declencheur.operateur ?? '',
      seuilValeur:
        declencheur.seuilValeur !== null &&
        declencheur.seuilValeur !== undefined
          ? String(declencheur.seuilValeur)
          : '',
      symptomeCode: declencheur.symptomeCode ?? '',
    });
  }

  async function loadData() {
    if (!id || Number.isNaN(id)) {
      setError('Identifiant invalide.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getPlanPreventifPredefiniById(id);
      setItem(data);

      setValues({
        code: data.code ?? '',
        libelle: data.titre ?? '',
        etat: data.etat ?? '',
        organisation: data.organisation ?? '',
        typeDeclenchement: data.typeDeclenchement ?? '',
        idModele:
          data.idModele !== null && data.idModele !== undefined
            ? String(data.idModele)
            : '',
        actif: data.actif ?? true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du plan préventif prédéfini.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!id || Number.isNaN(id)) {
      setError('Identifiant invalide.');
      return;
    }

    if (!values.code.trim()) {
      setError('Le code est obligatoire.');
      setSuccess(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await updatePlanPreventifPredefini(id, {
        code: values.code.trim(),
        libelle: values.libelle.trim() || undefined,
        etat: values.etat || undefined,
        organisation: values.organisation.trim() || undefined,
        typeDeclenchement: values.typeDeclenchement || undefined,
        idModele: values.idModele ? Number(values.idModele) : undefined,
        actif: values.actif,
      });

      setSuccess('Plan préventif prédéfini mis à jour avec succès.');
      await loadData();

      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la mise à jour du plan préventif prédéfini.',
      );
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateOrUpdateDeclencheur(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!id || Number.isNaN(id)) {
      setDeclencheurError('Identifiant de PPP invalide.');
      return;
    }

    if (!declencheurValues.idGamme) {
      setDeclencheurError('La gamme est obligatoire.');
      return;
    }

    const typeDeclencheur =
      declencheurValues.typeDeclencheur || 'CALENDAIRE';

    const isCalendaire = typeDeclencheur === 'CALENDAIRE';

    const isMesure =
      typeDeclencheur === 'COMPTEUR' ||
      typeDeclencheur === 'CONDITIONNEL';

    if (isCalendaire) {
      if (
        !declencheurValues.periodiciteValeur ||
        !declencheurValues.periodiciteUnite
      ) {
        setDeclencheurError(
          'Pour un déclencheur calendaire, la périodicité et son unité sont obligatoires.',
        );
        return;
      }
    }

    if (isMesure) {
      if (!declencheurValues.idPointMesure) {
        setDeclencheurError(
          'Pour un déclencheur compteur ou conditionnel, le point de mesure est obligatoire.',
        );
        return;
      }

      if (!declencheurValues.operateur || !declencheurValues.seuilValeur) {
        setDeclencheurError(
          'Pour un déclencheur compteur ou conditionnel, l’opérateur et la valeur seuil sont obligatoires.',
        );
        return;
      }
    }

    try {
      setDeclencheurSaving(true);
      setDeclencheurError(null);

      const payload = {
        priorite: declencheurValues.priorite
          ? Number(declencheurValues.priorite)
          : undefined,

        typeDeclencheur,

        idGamme: Number(declencheurValues.idGamme),

        idModele: declencheurValues.idModele
          ? Number(declencheurValues.idModele)
          : null,

        horizonJours: declencheurValues.horizonJours
          ? Number(declencheurValues.horizonJours)
          : null,

        toleranceJours: declencheurValues.toleranceJours
          ? Number(declencheurValues.toleranceJours)
          : null,

        periodiciteValeur: isCalendaire
          ? Number(declencheurValues.periodiciteValeur)
          : null,

        periodiciteUnite: isCalendaire
          ? declencheurValues.periodiciteUnite
          : null,

        nombreJoursPremierLancement:
          isCalendaire && declencheurValues.nombreJoursPremierLancement
            ? Number(declencheurValues.nombreJoursPremierLancement)
            : null,

        idPointMesure: isMesure
          ? Number(declencheurValues.idPointMesure)
          : null,

        operateur: isMesure ? declencheurValues.operateur : null,

        seuilValeur: isMesure
          ? Number(declencheurValues.seuilValeur)
          : null,

        symptomeCode:
          typeDeclencheur === 'CONDITIONNEL' && declencheurValues.symptomeCode
            ? declencheurValues.symptomeCode.trim()
            : undefined,

        actif: declencheurValues.actif,
      };

      if (editingDeclencheurId) {
        await updatePppDeclencheur(editingDeclencheurId, payload);
      } else {
        await createPppDeclencheur(id, payload);
      }

      resetDeclencheurForm();
      await loadData();
    } catch (err) {
      setDeclencheurError(
        err instanceof Error
          ? err.message
          : editingDeclencheurId
            ? 'Erreur lors de la mise à jour du déclencheur PPP.'
            : 'Erreur lors de la création du déclencheur PPP.',
      );
    } finally {
      setDeclencheurSaving(false);
    }
  }

  async function handleDeleteDeclencheur(idPppDeclencheur: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer ce déclencheur PPP ?',
    );

    if (!confirmed) return;

    try {
      await deletePppDeclencheur(idPppDeclencheur);

      if (editingDeclencheurId === idPppDeclencheur) {
        resetDeclencheurForm();
      }

      await loadData();
    } catch (err) {
      setDeclencheurError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression du déclencheur PPP.',
      );
    }
  }

  return {
    item,
    values,
    loading,
    saving,
    error,
    success,
    setField,
    handleSubmit,
    declencheurValues,
    declencheurSaving,
    declencheurError,
    editingDeclencheurId,
    setDeclencheurField,
    handleCreateOrUpdateDeclencheur,
    handleDeleteDeclencheur,
    startEditDeclencheur,
    resetDeclencheurForm,
  };
}