// src/features/materiels/hooks/useMaterielBusinessRules.ts

import { useMemo } from 'react';

import {
  getMaterielVisibleFields,
  normalizeMaterielBusinessRules,
  validateMaterielBusinessRules,
  type MaterielBusinessInput,
  type PositionActuelle,
  type EtatMateriel,
} from '../rules/materiel-business.rules';

type UseMaterielBusinessRulesParams<T extends MaterielBusinessInput> = {
  form: T;
  setForm: React.Dispatch<React.SetStateAction<T>>;
};

export function useMaterielBusinessRules<T extends MaterielBusinessInput>({
  form,
  setForm,
}: UseMaterielBusinessRulesParams<T>) {
  const visibleFields = useMemo(() => {
    return getMaterielVisibleFields(form);
  }, [form]);

  const validation = useMemo(() => {
    return validateMaterielBusinessRules(form);
  }, [form]);

  function patchForm(patch: Partial<T>) {
    setForm((prev) => {
      const merged = {
        ...prev,
        ...patch,
      };

      return normalizeMaterielBusinessRules(merged);
    });
  }

  function changePosition(positionActuelle: PositionActuelle) {
    patchForm({
      positionActuelle,
    } as Partial<T>);
  }

  function changeEtat(etat: EtatMateriel) {
    patchForm({
      etat,
    } as Partial<T>);
  }

  function changeGereEnStock(gereEnStock: boolean) {
    patchForm({
      gereEnStock,
    } as Partial<T>);
  }

  function changePereMateriel(
    idPereMateriel: number | null,
    pereMateriel?: T['pereMateriel'],
  ) {
    patchForm({
      idPereMateriel,
      pereMateriel,
      idPereGeographique:
        pereMateriel?.idPereGeographique ?? form.idPereGeographique,
    } as Partial<T>);
  }

  function validateBeforeSubmit() {
    const normalized = normalizeMaterielBusinessRules(form);
    const result = validateMaterielBusinessRules(normalized);

    return {
      ok: result.ok,
      errors: result.errors,
      data: normalized,
    };
  }

  return {
    visibleFields,
    validation,
    errors: validation.errors,

    patchForm,
    changePosition,
    changeEtat,
    changeGereEnStock,
    changePereMateriel,
    validateBeforeSubmit,
  };
}