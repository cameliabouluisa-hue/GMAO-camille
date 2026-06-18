'use client';

import { useEffect, useState } from 'react';

import { getFamilles } from '@/features/familles/services/famille.service';
import type { FamilleApi } from '@/features/familles/types/famille';

import {
  createModele,
  getEtatsModele,
  getFabricants,
  getMarques,
  getTypesEquipement,
  getPlansPreventifsPredefinis,
} from '@/features/modeles/services/modele.service';

import type {
  CreateModelePayload,
  FabricantApi,
  MarqueApi,
  ModeleEtat,
  TypeEquipementApi,
  PlanPreventifPredefiniApi,
} from '@/features/modeles/types/modele';

type UseModeleFormOptions = {
  onSuccess?: () => void;
};

export function useModeleForm(options?: UseModeleFormOptions) {
  const [familles, setFamilles] = useState<FamilleApi[]>([]);
  const [etats, setEtats] = useState<ModeleEtat[]>([]);
  const [typesEquipement, setTypesEquipement] = useState<TypeEquipementApi[]>(
    [],
  );
  const [fabricants, setFabricants] = useState<FabricantApi[]>([]);
  const [marques, setMarques] = useState<MarqueApi[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [plansPreventifsPredefinis, setPlansPreventifsPredefinis] = useState<
  PlanPreventifPredefiniApi[]
>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [
  famillesData,
  etatsData,
  typesEquipementData,
  fabricantsData,
  marquesData,
  plansPreventifsPredefinisData,
] = await Promise.all([
  getFamilles(),
  getEtatsModele(),
  getTypesEquipement(),
  getFabricants(),
  getMarques(),
  getPlansPreventifsPredefinis(),
]);

        setFamilles(famillesData);
        setEtats(etatsData);
        setTypesEquipement(typesEquipementData);
        setFabricants(fabricantsData);
        setMarques(marquesData);
        setPlansPreventifsPredefinis(plansPreventifsPredefinisData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des données du formulaire.',
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function submitModele(payload: CreateModelePayload) {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await createModele(payload);

      setSuccess('Le modèle a été ajouté avec succès.');
      options?.onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'ajout.";

      setError(message);
      setSuccess(null);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }

  return {
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