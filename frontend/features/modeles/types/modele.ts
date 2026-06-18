export type ModeleEtat = {
  idEtat: number;
  code?: string | null;
  libelle: string | null;
};

export type ModeleFamille = {
  idFamille: number;
  code: string | null;
  libelle: string | null;
  parent_id: number | null;
};

export type TypeEquipementApi = {
  idTypeEquipement: number;
  code: string | null;
  libelle: string | null;
  description?: string | null;
  actif?: boolean;
};

export type FabricantApi = {
  idFabricant: number;
  code: string | null;
  nom: string | null;
  pays?: string | null;
  telephone?: string | null;
  email?: string | null;
  siteWeb?: string | null;
  actif?: boolean;
};

export type MarqueApi = {
  idMarque: number;
  code: string | null;
  libelle: string | null;
  description?: string | null;
  idFabricant: number | null;
  actif?: boolean;
  fabricant?: FabricantApi | null;
};

export type ModeleApi = {
  idModele: number;
  code: string | null;
  libelle: string | null;

  idFamille: number | null;
  idEtat: number | null;

  idTypeEquipement: number | null;
  idFabricant: number | null;
  idMarque: number | null;

  commentaire: string | null;
  dureeVie: number | null;
  budget: number | string | null;

  famille?: ModeleFamille | null;
  etat_modele?: ModeleEtat | null;
  type_equipement?: TypeEquipementApi | null;
  fabricant?: FabricantApi | null;
  marque?: MarqueApi | null;

  modele_plan_preventif_predefini?: ModelePppAssociationApi[];
};

export type CreateModelePayload = {
  code?: string | null;
  libelle?: string | null;

  idFamille?: number | null;
  idEtat: number;

  idTypeEquipement?: number | null;
  idFabricant?: number | null;
  idMarque?: number | null;

  commentaire?: string | null;
  dureeVie?: number | null;
  budget?: number | null;

  pppIds?: number[];
pppPrincipalId?: number | null;
};

export type UpdateModelePayload = Partial<CreateModelePayload>;

export type ModeleFormValues = {
  code: string;
  libelle: string;
  idFamille: string;
  idEtat: string;
  idTypeEquipement: string;
  idFabricant: string;
  idMarque: string;
  commentaire: string;
  dureeVie: string;
  budget: string;
};
export type PlanPreventifPredefiniApi = {
  idPlanPreventifPredefini: number;
  code: string | null;
  libelle: string | null;
  description?: string | null;
  actif?: boolean;
};

export type ModelePppAssociationApi = {
  idModelePlanPreventifPredefini: number;
  idModele: number;
  idPlanPreventifPredefini: number;
  principal: boolean;
  actif: boolean;
  plan_preventif_predefini?: PlanPreventifPredefiniApi | null;
};