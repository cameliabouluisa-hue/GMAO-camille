'use client';

import { useEffect, useState } from 'react';

import {
  createDemandeIntervention,
  getMaterielsForMaintenance,
} from '../services/maintenance.service';
import type { Materiel } from '../types/maintenance.types';

type FormValues = {
  idMateriel: string;
  priorite: string;
  description: string;
  createdBy: string;
};

type Options = {
  onSuccess?: (idDemande: number) => void;
};

export function useCreateDemandeIntervention(options?: Options) {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [values, setValues] = useState<FormValues>({
    idMateriel: '',
    priorite: 'NORMALE',
    description: '',
    createdBy: 'Responsable maintenance',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchMateriels() {
    try {
      setLoading(true);
      setError(null);

      const data = await getMaterielsForMaintenance();
      setMateriels(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des matériels.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMateriels();
  }, []);

  function setField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!values.idMateriel) {
      setError('Le matériel est obligatoire.');
      return;
    }

    if (!values.description.trim()) {
      setError('La description de la panne est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const demande = await createDemandeIntervention({
        idMateriel: Number(values.idMateriel),
        priorite: values.priorite,
        description: values.description.trim(),
        createdBy: values.createdBy.trim() || 'Responsable maintenance',
      });

      options?.onSuccess?.(demande.idDemande);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création de la demande.',
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    materiels,
    values,
    loading,
    saving,
    error,
    setField,
    handleSubmit,
  };
}