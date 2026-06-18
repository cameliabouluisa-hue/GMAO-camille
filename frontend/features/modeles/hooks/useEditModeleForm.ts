'use client';

import { useEffect, useState } from 'react';

import { getFamilles } from '@/features/familles/services/famille.service';
import type { FamilleApi } from '@/features/familles/types/famille';

import {
  getEtatsModele,
  getFabricants,
  getMarques,
  getModeleById,
  getPlansPreventifsPredefinis,
  getTypesEquipement,
  updateModele,
} from '@/features/modeles/services/modele.service';

import type {
  FabricantApi,
  MarqueApi,
  ModeleApi,
  ModeleEtat,
  PlanPreventifPredefiniApi,
  TypeEquipementApi,
  UpdateModelePayload,
} from '@/features/modeles/types/modele';

type UseEditModeleFormOptions = {
  modeleId: string;
  onSuccess?: () => void;
};

export function useEditModeleForm({
  modeleId,
  onSuccess,
}: UseEditModeleFormOptions) {
  const [modele, setModele] = useState<ModeleApi | null>(null);

  const [familles, setFamilles] = useState<FamilleApi[]>([]);
  const [etats, setEtats] = useState<ModeleEtat[]>([]);
  const [typesEquipement, setTypesEquipement] = useState<TypeEquipementApi[]>(
    [],
  );
  const [fabricants, setFabricants] = useState<FabricantApi[]>([]);
  const [marques, setMarques] = useState<MarqueApi[]>([]);
  const [plansPreventifsPredefinis, setPlansPreventifsPredefinis] = useState<
    PlanPreventifPredefiniApi[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!modeleId) {
        setError('Identifiant du modèle manquant.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const [
          modeleData,
          famillesData,
          etatsData,
          typesEquipementData,
          fabricantsData,
          marquesData,
          plansPreventifsPredefinisData,
        ] = await Promise.all([
          getModeleById(modeleId),
          getFamilles(),
          getEtatsModele(),
          getTypesEquipement(),
          getFabricants(),
          getMarques(),
          getPlansPreventifsPredefinis(),
        ]);

        if (!isMounted) return;

        setModele(modeleData);
        setFamilles(famillesData);
        setEtats(etatsData);
        setTypesEquipement(typesEquipementData);
        setFabricants(fabricantsData);
        setMarques(marquesData);
        setPlansPreventifsPredefinis(plansPreventifsPredefinisData);
      } catch (err) {
        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement du formulaire.',
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [modeleId]);

  async function submitModele(payload: UpdateModelePayload) {
    if (!modeleId) {
      const message = 'Identifiant du modèle manquant.';
      setError(message);
      throw new Error(message);
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updated = await updateModele(modeleId, payload);

      setModele(updated);
      setSuccess('Le modèle a été modifié avec succès.');

      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la modification.';

      setError(message);
      setSuccess(null);

      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }

  return {
    modele,

    familles,
    etats,
    typesEquipement,
    fabricants,
    marques,
    plansPreventifsPredefinis,

    loading,
    saving,
    error,
    success,

    submitModele,
  };
}