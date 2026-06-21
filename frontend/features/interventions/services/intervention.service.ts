import axios from '@/lib/api';
import type { AxiosRequestConfig } from 'axios';

import {
  getMateriels,
  getPointsStructure,
} from '@/features/materiels/services/materiel.service';
import { getDemandesIntervention } from '@/features/demandes-intervention/services/demande-intervention.service';
import {
  getAllPlanPreventifDeclencheurs,
  getPlansPreventifs,
} from '@/features/plans-preventifs/services/plan-preventif.service';
import { getGammes } from '@/features/gammes/services/gamme.service';
import { getArticles } from '@/features/articles/services/article.service';
import { getMagasins } from '@/features/magasins/services/magasin.service';

import type {
  AffecterEquipeDto,
  AffecterTechnicienDto,
  AnnulerConsommationInterventionDto,
  ChangementEtatDto,
  CompteRenduIntervention,
  ConsommationIntervention,
  CreateConsommationInterventionDto,
  CreateInterventionDto,
  CreateOccupationInterventionDto,
  CreateOperationInterventionDto,
  DemarrerInterventionDto,
  EquipeMaintenanceLite,
  Intervention,
  InterventionFilters,
  InterventionReferenceData,
  OccupationIntervention,
  OperationIntervention,
  RefuserTravauxDto,
  TechnicienLite,
  TerminerInterventionDto,
  UpdateInterventionDto,
  UpsertCompteRenduInterventionDto,
} from '../types/intervention.types';

const BASE_URL = '/interventions';

function getAuthToken() {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem('gmao_token');
}

function withAuthConfig(config: AxiosRequestConfig = {}): AxiosRequestConfig {
  const token = getAuthToken();

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

export async function getInterventions(
  filters?: InterventionFilters,
): Promise<Intervention[]> {
  const params = new URLSearchParams();

  if (filters?.etat) params.set('etat', filters.etat);

  if (filters?.typeMaintenance) {
    params.set('typeMaintenance', filters.typeMaintenance);
  }

  if (filters?.idMateriel) {
    params.set('idMateriel', String(filters.idMateriel));
  }

  if (filters?.idEquipe) {
    params.set('idEquipe', String(filters.idEquipe));
  }

  const query = params.toString();

  const res = await axios.get<Intervention[]>(
    query ? `${BASE_URL}?${query}` : BASE_URL,
    withAuthConfig(),
  );

  return res.data;
}

export async function getIntervention(
  idIntervention: number,
): Promise<Intervention> {
  const res = await axios.get<Intervention>(
    `${BASE_URL}/${idIntervention}`,
    withAuthConfig(),
  );

  return res.data;
}

export async function createIntervention(
  data: CreateInterventionDto,
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    BASE_URL,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function updateIntervention(
  idIntervention: number,
  data: UpdateInterventionDto,
): Promise<Intervention> {
  const res = await axios.patch<Intervention>(
    `${BASE_URL}/${idIntervention}`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function deleteIntervention(
  idIntervention: number,
): Promise<Intervention> {
  const res = await axios.delete<Intervention>(
    `${BASE_URL}/${idIntervention}`,
    withAuthConfig(),
  );

  return res.data;
}

export async function demanderValidationIntervention(
  idIntervention: number,
  data: ChangementEtatDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/demander-validation`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function validerIntervention(
  idIntervention: number,
  data: ChangementEtatDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/valider`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function refuserIntervention(
  idIntervention: number,
  data: ChangementEtatDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/refuser`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function mettreAttenteFournitureIntervention(
  idIntervention: number,
  data: ChangementEtatDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/attente-fourniture`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function fournituresDisponiblesIntervention(
  idIntervention: number,
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/fournitures-disponibles`,
    {
      changedBy: 'Admin',
      commentaire:
        "Les fournitures sont disponibles, l'OT est prêt à être réalisé.",
    },
    withAuthConfig(),
  );

  return res.data;
}

export async function demarrerIntervention(
  idIntervention: number,
  data: DemarrerInterventionDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/demarrer`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function terminerIntervention(
  idIntervention: number,
  data: TerminerInterventionDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/terminer`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function accepterTravauxIntervention(
  idIntervention: number,
  data: ChangementEtatDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/accepter-travaux`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function refuserTravauxIntervention(
  idIntervention: number,
  data: RefuserTravauxDto,
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/refuser-travaux`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function reprendreIntervention(
  idIntervention: number,
  data: ChangementEtatDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/reprendre`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function solderIntervention(
  idIntervention: number,
  data: ChangementEtatDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/solder`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function annulerIntervention(
  idIntervention: number,
  data: ChangementEtatDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/annuler`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function archiverIntervention(
  idIntervention: number,
  data: ChangementEtatDto = {},
): Promise<Intervention> {
  const res = await axios.post<Intervention>(
    `${BASE_URL}/${idIntervention}/archiver`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function affecterEquipeIntervention(
  idIntervention: number,
  data: AffecterEquipeDto,
): Promise<Intervention> {
  const res = await axios.patch<Intervention>(
    `${BASE_URL}/${idIntervention}/affecter-equipe`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function affecterTechnicienIntervention(
  idIntervention: number,
  data: AffecterTechnicienDto,
): Promise<unknown> {
  const res = await axios.post(
    `${BASE_URL}/${idIntervention}/affectations`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function deleteAffectationTechnicien(
  idIntervention: number,
  idAffectation: number,
): Promise<Intervention> {
  const res = await axios.delete<Intervention>(
    `${BASE_URL}/${idIntervention}/affectations/${idAffectation}`,
    withAuthConfig(),
  );

  return res.data;
}

export async function retirerAffectationIntervention(
  idAffectation: number,
): Promise<unknown> {
  const res = await axios.delete(
    `${BASE_URL}/affectations/${idAffectation}`,
    withAuthConfig(),
  );

  return res.data;
}

export async function createOperationIntervention(
  idIntervention: number,
  data: CreateOperationInterventionDto,
): Promise<OperationIntervention> {
  const res = await axios.post<OperationIntervention>(
    `${BASE_URL}/${idIntervention}/operations`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function deleteOperationIntervention(
  idIntervention: number,
  idOperation: number,
): Promise<Intervention> {
  const res = await axios.delete<Intervention>(
    `${BASE_URL}/${idIntervention}/operations/${idOperation}`,
    withAuthConfig(),
  );

  return res.data;
}

export async function getOccupationsIntervention(
  idIntervention: number,
): Promise<OccupationIntervention[]> {
  const res = await axios.get<OccupationIntervention[]>(
    `${BASE_URL}/${idIntervention}/occupations`,
    withAuthConfig(),
  );

  return res.data;
}

export async function createOccupationIntervention(
  idIntervention: number,
  data: CreateOccupationInterventionDto,
): Promise<OccupationIntervention> {
  const res = await axios.post<OccupationIntervention>(
    `${BASE_URL}/${idIntervention}/occupations`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function deleteOccupationIntervention(
  idIntervention: number,
  idOccupation: number,
): Promise<Intervention> {
  const res = await axios.delete<Intervention>(
    `${BASE_URL}/${idIntervention}/occupations/${idOccupation}`,
    withAuthConfig(),
  );

  return res.data;
}

export async function upsertCompteRenduIntervention(
  idIntervention: number,
  data: UpsertCompteRenduInterventionDto,
): Promise<CompteRenduIntervention> {
  const res = await axios.post<CompteRenduIntervention>(
    `${BASE_URL}/${idIntervention}/compte-rendu`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function createConsommationIntervention(
  idIntervention: number,
  data: CreateConsommationInterventionDto,
): Promise<ConsommationIntervention> {
  const res = await axios.post<ConsommationIntervention>(
    `${BASE_URL}/${idIntervention}/consommations`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function annulerConsommationIntervention(
  idIntervention: number,
  idConsommation: number,
  data: AnnulerConsommationInterventionDto = {},
): Promise<ConsommationIntervention> {
  const res = await axios.patch<ConsommationIntervention>(
    `${BASE_URL}/${idIntervention}/consommations/${idConsommation}/annuler`,
    data,
    withAuthConfig(),
  );

  return res.data;
}

export async function getEquipesMaintenance(): Promise<EquipeMaintenanceLite[]> {
  const res = await axios.get<EquipeMaintenanceLite[]>(
    `${BASE_URL}/referentiel/equipes`,
    withAuthConfig(),
  );

  return res.data;
}

export async function getTechniciensMaintenance(): Promise<TechnicienLite[]> {
  const res = await axios.get<TechnicienLite[]>(
    `${BASE_URL}/referentiel/techniciens`,
    withAuthConfig(),
  );

  return res.data;
}

export async function getInterventionReferenceData(): Promise<InterventionReferenceData> {
  const [
    materiels,
    pointsStructure,
    demandes,
    plansPreventifs,
    declencheurs,
    gammes,
    equipes,
    techniciens,
    articles,
    magasins,
  ] = await Promise.all([
    safeArray(getMateriels()),
    safeArray(getPointsStructure()),
    safeArray(getDemandesIntervention()),
    safeArray(getPlansPreventifs()),
    safeArray(getAllPlanPreventifDeclencheurs()),
    safeArray(getGammes()),
    safeArray(getEquipesMaintenance()),
    safeArray(getTechniciensMaintenance()),
    safeArray(getArticles()),
    safeArray(getMagasins()),
  ]);

  return {
    materiels,
    pointsStructure: pointsStructure.map((point) => ({
      idPoint: point.idPoint,
      code: point.code,
      libelle: point.libelle,
    })),
    demandes,
    plansPreventifs,
    declencheurs,
    gammes,
    equipes,
    techniciens,
    articles,
    magasins,
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue.',
) {
  const responseMessage = (
    error as {
      response?: { data?: { message?: string | string[]; error?: string } };
    }
  )?.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(' ');
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  const responseError = (
    error as { response?: { data?: { error?: string } } }
  )?.response?.data?.error;

  if (typeof responseError === 'string' && responseError.trim()) {
    return responseError;
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

async function safeArray<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    const data = await promise;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}