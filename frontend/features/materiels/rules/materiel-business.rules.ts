

export type PositionActuelle =
  | 'SUR_TERRAIN'
  | 'EN_STOCK'
  | 'EN_REPARATION'
  | 'AU_REBUT';

export type EtatMateriel =
  | 'EN_SERVICE'
  | 'EN_PANNE'
  | 'EN_MAINTENANCE'
  | 'INDISPONIBLE'
  | 'DISPONIBLE'
  | 'AU_REBUT';

export type MaterielBusinessInput = {
  id?: number | null;

  actif?: boolean | null;
  gereEnStock?: boolean | null;
  serialise?: boolean | null;
  reparable?: boolean | null;

  etat?: EtatMateriel | null;
  positionActuelle?: PositionActuelle | null;

  numeroSerie?: string | null;

  idArticle?: number | null;
  articleGereEnStock?: boolean | null;
  articleSerialise?: boolean | null;

  idMagasin?: number | null;
  idEmplacement?: number | null;

  idPereGeographique?: number | null;
  idPereMateriel?: number | null;

  pereMateriel?: {
    id: number;
    actif?: boolean | null;
    etat?: EtatMateriel | null;
    positionActuelle?: PositionActuelle | null;
    idPereGeographique?: number | null;
  } | null;

  ancestorIds?: number[];

  dateMiseEnService?: string | Date | null;
  dateDernierInventaire?: string | Date | null;
  dateRebut?: string | Date | null;

  hasInterventions?: boolean;
  hasMouvementsStock?: boolean;
  hasSousMateriels?: boolean;
  hasPlansPreventifs?: boolean;
  hasPlansPreventifsActifs?: boolean;
  hasPointsMesure?: boolean;
  hasInterventionFuture?: boolean;
  hasInterventionBloquanteEnCours?: boolean;

  idInterventionEnCours?: number | null;
};

export type BusinessValidationResult = {
  ok: boolean;
  errors: Record<string, string>;
};

export const ETATS_BY_POSITION: Record<PositionActuelle, EtatMateriel[]> = {
  SUR_TERRAIN: [
    'EN_SERVICE',
    'EN_PANNE',
    'EN_MAINTENANCE',
    'INDISPONIBLE',
  ],
  EN_STOCK: ['DISPONIBLE'],
  EN_REPARATION: ['EN_PANNE', 'EN_MAINTENANCE', 'INDISPONIBLE'],
  AU_REBUT: ['AU_REBUT'],
};

export function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function isFutureDate(value?: string | Date | null): boolean {
  const date = toDate(value);
  if (!date) return false;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return date.getTime() > today.getTime();
}

function isBefore(
  first?: string | Date | null,
  second?: string | Date | null,
): boolean {
  const d1 = toDate(first);
  const d2 = toDate(second);

  if (!d1 || !d2) return false;

  return d1.getTime() < d2.getTime();
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeMaterielBusinessRules<T extends MaterielBusinessInput>(
  input: T,
): T {
  const next = { ...input };

  const position = next.positionActuelle;

  if (position === 'SUR_TERRAIN') {
    next.idMagasin = null;
    next.idEmplacement = null;
    next.actif = true;

    if (!next.etat || !ETATS_BY_POSITION.SUR_TERRAIN.includes(next.etat)) {
      next.etat = 'EN_SERVICE';
    }

    if (next.pereMateriel?.idPereGeographique) {
      next.idPereGeographique = next.pereMateriel.idPereGeographique;
    }

    if (next.etat !== 'AU_REBUT') {
      next.dateRebut = null;
    }
  }

  if (position === 'EN_STOCK') {
    next.gereEnStock = true;
    next.idPereMateriel = null;
    next.idPereGeographique = null;
    next.actif = true;
    next.dateRebut = null;

    if (!next.etat || !ETATS_BY_POSITION.EN_STOCK.includes(next.etat)) {
      next.etat = 'DISPONIBLE';
    }
  }

  if (position === 'EN_REPARATION') {
    next.idPereMateriel = null;
    next.actif = true;
    next.dateRebut = null;

    if (!next.etat || !ETATS_BY_POSITION.EN_REPARATION.includes(next.etat)) {
      next.etat = 'EN_MAINTENANCE';
    }
  }

  if (position === 'AU_REBUT') {
    next.etat = 'AU_REBUT';
    next.actif = false;
    next.idPereMateriel = null;
    next.idPereGeographique = null;
    next.idMagasin = null;
    next.idEmplacement = null;

    if (!next.dateRebut) {
      next.dateRebut = todayIsoDate();
    }
  }

  return next;
}

export function validateMaterielBusinessRules(
  input: MaterielBusinessInput,
): BusinessValidationResult {
  const errors: Record<string, string> = {};

  const addError = (field: string, message: string) => {
    if (!errors[field]) errors[field] = message;
  };

  const position = input.positionActuelle;
  const etat = input.etat;

  if (!position) {
    addError('positionActuelle', 'La position actuelle est obligatoire.');
  }

  if (!etat) {
    addError('etat', 'L’état du matériel est obligatoire.');
  }

  if (position && etat) {
    const allowedEtats = ETATS_BY_POSITION[position];

    if (!allowedEtats.includes(etat)) {
      addError(
        'etat',
        `L’état sélectionné n’est pas compatible avec la position actuelle.`,
      );
    }
  }

  /*
   * POSITION : SUR TERRAIN
   */
  if (position === 'SUR_TERRAIN') {
    if (!input.idPereGeographique && !input.idPereMateriel) {
      addError(
        'affectation',
        'Un matériel sur terrain doit avoir un père géographique ou un père matériel.',
      );
    }

    if (input.idMagasin) {
      addError(
        'idMagasin',
        'Un matériel sur terrain ne doit pas être rattaché à un magasin.',
      );
    }

    if (input.idEmplacement) {
      addError(
        'idEmplacement',
        'Un matériel sur terrain ne doit pas être rattaché à un emplacement de stock.',
      );
    }

    if (etat === 'EN_SERVICE' && !input.dateMiseEnService) {
      addError(
        'dateMiseEnService',
        'La date de mise en service est obligatoire pour un matériel en service.',
      );
    }
  }

  /*
   * POSITION : EN STOCK
   */
  if (position === 'EN_STOCK') {
    if (!input.gereEnStock) {
      addError(
        'gereEnStock',
        'Un matériel en stock doit obligatoirement être géré en stock.',
      );
    }

    if (!input.idMagasin) {
      addError(
        'idMagasin',
        'Le magasin est obligatoire pour un matériel en stock.',
      );
    }

    if (input.idPereMateriel) {
      addError(
        'idPereMateriel',
        'Un matériel en stock ne peut pas être rattaché à un père matériel.',
      );
    }

    if (input.idPereGeographique) {
      addError(
        'idPereGeographique',
        'Un matériel en stock ne peut pas être rattaché à un point géographique terrain.',
      );
    }
  }

  /*
   * POSITION : EN RÉPARATION
   */
  if (position === 'EN_REPARATION') {
    if (input.reparable === false) {
      addError(
        'reparable',
        'Un matériel non réparable ne peut pas être mis en réparation.',
      );
    }

    if (input.idPereMateriel) {
      addError(
        'idPereMateriel',
        'Un matériel en réparation ne doit plus être rattaché activement à un père matériel.',
      );
    }
  }

  /*
   * POSITION : AU REBUT
   */
  if (position === 'AU_REBUT') {
    if (etat !== 'AU_REBUT') {
      addError(
        'etat',
        'Un matériel au rebut doit avoir l’état "Au rebut".',
      );
    }

    if (input.actif !== false) {
      addError(
        'actif',
        'Un matériel au rebut doit être inactif.',
      );
    }

    if (!input.dateRebut) {
      addError(
        'dateRebut',
        'La date de rebut est obligatoire.',
      );
    }

    if (input.idPereMateriel || input.idPereGeographique) {
      addError(
        'affectation',
        'Un matériel au rebut ne doit plus avoir d’affectation active.',
      );
    }

    if (input.idMagasin || input.idEmplacement) {
      addError(
        'stock',
        'Un matériel au rebut ne doit plus être localisé en stock.',
      );
    }

    if (input.hasPlansPreventifsActifs) {
      addError(
        'plansPreventifs',
        'Impossible de mettre au rebut un matériel avec un plan préventif actif.',
      );
    }

    if (input.hasInterventionFuture) {
      addError(
        'interventions',
        'Impossible de mettre au rebut un matériel avec des interventions futures.',
      );
    }
  }

  /*
   * GÉRÉ EN STOCK
   */
  if (input.gereEnStock) {
    if (!input.idArticle) {
      addError(
        'idArticle',
        'Un matériel géré en stock doit être lié à un article.',
      );
    }

    if (input.articleGereEnStock === false) {
      addError(
        'articleGereEnStock',
        'L’article lié doit être géré en stock.',
      );
    }

    if (input.articleSerialise === false) {
      addError(
        'articleSerialise',
        'Un matériel géré en stock doit venir d’un article sérialisé.',
      );
    }

    if (input.serialise === false) {
      addError(
        'serialise',
        'Un matériel géré en stock doit être sérialisé.',
      );
    }

    if (!input.numeroSerie) {
      addError(
        'numeroSerie',
        'Le numéro de série est obligatoire pour un matériel stocké sérialisé.',
      );
    }
  }

  /*
   * PÈRE MATÉRIEL
   */
  if (input.idPereMateriel) {
    if (input.id && input.idPereMateriel === input.id) {
      addError(
        'idPereMateriel',
        'Un matériel ne peut pas être son propre père.',
      );
    }

    if (input.ancestorIds?.includes(input.idPereMateriel)) {
      addError(
        'idPereMateriel',
        'Cette affectation crée une boucle dans l’arborescence des matériels.',
      );
    }

    if (input.pereMateriel?.actif === false) {
      addError(
        'idPereMateriel',
        'Le père matériel sélectionné est inactif.',
      );
    }

    if (input.pereMateriel?.etat === 'AU_REBUT') {
      addError(
        'idPereMateriel',
        'Le père matériel sélectionné est au rebut.',
      );
    }

    if (
      input.pereMateriel?.positionActuelle &&
      input.pereMateriel.positionActuelle !== 'SUR_TERRAIN'
    ) {
      addError(
        'idPereMateriel',
        'Le père matériel doit être sur terrain.',
      );
    }

    if (
      input.pereMateriel?.idPereGeographique &&
      input.idPereGeographique &&
      input.pereMateriel.idPereGeographique !== input.idPereGeographique
    ) {
      addError(
        'idPereGeographique',
        'Le père géographique doit être le même que celui du père matériel.',
      );
    }
  }

  /*
   * DATES
   */
  if (isFutureDate(input.dateMiseEnService)) {
    addError(
      'dateMiseEnService',
      'La date de mise en service ne peut pas être dans le futur.',
    );
  }

  if (isFutureDate(input.dateDernierInventaire)) {
    addError(
      'dateDernierInventaire',
      'La date du dernier inventaire ne peut pas être dans le futur.',
    );
  }

  if (isFutureDate(input.dateRebut)) {
    addError(
      'dateRebut',
      'La date de rebut ne peut pas être dans le futur.',
    );
  }

  if (
    input.dateMiseEnService &&
    input.dateRebut &&
    isBefore(input.dateRebut, input.dateMiseEnService)
  ) {
    addError(
      'dateRebut',
      'La date de rebut ne peut pas être avant la date de mise en service.',
    );
  }

  if (etat !== 'AU_REBUT' && input.dateRebut) {
    addError(
      'dateRebut',
      'La date de rebut doit être vide si le matériel n’est pas au rebut.',
    );
  }

  /*
   * INTERVENTIONS BLOQUANTES
   */
  if (etat === 'EN_MAINTENANCE' && input.hasInterventionBloquanteEnCours) {
    addError(
      'intervention',
      'Ce matériel possède déjà une intervention bloquante en cours.',
    );
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

export function getMaterielVisibleFields(input: MaterielBusinessInput) {
  const position = input.positionActuelle;

  return {
    showTerrainFields: position === 'SUR_TERRAIN',
    showStockFields: position === 'EN_STOCK',
    showRepairFields: position === 'EN_REPARATION',
    showRebutFields: position === 'AU_REBUT',

    disableTerrainFields: position === 'EN_STOCK' || position === 'AU_REBUT',
    disableStockFields: position !== 'EN_STOCK',

    disableEtat:
      position === 'AU_REBUT' ||
      position === 'EN_STOCK',

    disableActif: position === 'AU_REBUT',

    requireMagasin: position === 'EN_STOCK',
    requirePereOrGeo: position === 'SUR_TERRAIN',
    requireDateRebut: position === 'AU_REBUT',
    requireMiseEnService:
      position === 'SUR_TERRAIN' && input.etat === 'EN_SERVICE',
  };
}

export function canDeleteMateriel(input: MaterielBusinessInput) {
  const reasons: string[] = [];

  if (input.hasInterventions) {
    reasons.push('Le matériel possède déjà des interventions.');
  }

  if (input.hasMouvementsStock) {
    reasons.push('Le matériel possède déjà des mouvements de stock.');
  }

  if (input.hasSousMateriels) {
    reasons.push('Le matériel possède des sous-matériels.');
  }

  if (input.hasPlansPreventifs) {
    reasons.push('Le matériel possède des plans préventifs.');
  }

  if (input.hasPointsMesure) {
    reasons.push('Le matériel possède des points de mesure.');
  }

  return {
    ok: reasons.length === 0,
    reasons,
  };
}

export function canUseMaterielInIntervention(
  input: MaterielBusinessInput,
  typeIntervention: 'CORRECTIVE' | 'PREVENTIVE' | 'REPARATION_ATELIER',
) {
  if (input.actif === false) {
    return {
      ok: false,
      reason: 'Le matériel est inactif.',
    };
  }

  if (input.etat === 'AU_REBUT' || input.positionActuelle === 'AU_REBUT') {
    return {
      ok: false,
      reason: 'Le matériel est au rebut.',
    };
  }

  if (
    input.positionActuelle === 'EN_STOCK' &&
    typeIntervention !== 'REPARATION_ATELIER'
  ) {
    return {
      ok: false,
      reason:
        'Un matériel en stock ne peut pas être utilisé dans une intervention terrain.',
    };
  }

  if (
    input.etat === 'EN_MAINTENANCE' &&
    input.hasInterventionBloquanteEnCours
  ) {
    return {
      ok: false,
      reason: 'Le matériel a déjà une intervention bloquante en cours.',
    };
  }

  if (
    typeIntervention === 'PREVENTIVE' &&
    input.positionActuelle !== 'SUR_TERRAIN'
  ) {
    return {
      ok: false,
      reason:
        'Un plan ou une intervention préventive doit concerner un matériel sur terrain.',
    };
  }

  return {
    ok: true,
    reason: null,
  };
}