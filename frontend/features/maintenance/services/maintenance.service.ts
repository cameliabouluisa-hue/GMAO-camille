import type {
  DemandeDashboardResponse,
  DemandeIntervention,
  Gamme,
  Intervention,
  InterventionDashboardResponse,
  Materiel,
} from '../types/maintenance.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.message ||
        `Erreur API ${response.status} lors du chargement des données.`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getInterventionsDashboard() {
  return request<InterventionDashboardResponse>(
    '/interventions/dashboard/responsable',
  );
}

export async function getDemandesDashboard() {
  return request<DemandeDashboardResponse>(
    '/demandes-intervention/dashboard/responsable',
  );
}

export async function getInterventions() {
  return request<Intervention[]>('/interventions');
}

export async function getInterventionById(idIntervention: number) {
  return request<Intervention>(`/interventions/${idIntervention}`);
}

export async function getInterventionsByType(typeMaintenance: string) {
  return request<Intervention[]>(`/interventions/type/${typeMaintenance}`);
}

export async function getInterventionsByEtat(etat: string) {
  return request<Intervention[]>(`/interventions/etat/${etat}`);
}

export async function realiserIntervention(idIntervention: number) {
  return request<Intervention>(`/interventions/${idIntervention}/realiser`, {
    method: 'PATCH',
    body: JSON.stringify({
      dateFin: new Date().toISOString(),
    }),
  });
}

export async function cloturerIntervention(
  idIntervention: number,
  closedBy: string,
) {
  return request<Intervention>(`/interventions/${idIntervention}/cloturer`, {
    method: 'PATCH',
    body: JSON.stringify({
      closedBy,
    }),
  });
}

export async function affecterEquipeIntervention(
  idIntervention: number,
  idEquipe: number,
  assignedBy: string,
) {
  return request<Intervention>(
    `/interventions/${idIntervention}/affecter-equipe`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        idEquipe,
        assignedBy,
      }),
    },
  );
}

export async function getDemandesIntervention() {
  return request<DemandeIntervention[]>('/demandes-intervention');
}

export async function getDemandeInterventionById(idDemande: number) {
  return request<DemandeIntervention>(`/demandes-intervention/${idDemande}`);
}

export async function createDemandeIntervention(payload: {
  idMateriel: number;
  description: string;
  priorite?: string;
  createdBy?: string;
}) {
  return request<DemandeIntervention>('/demandes-intervention', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function validerDemandeIntervention(
  idDemande: number,
  validatedBy: string,
) {
  return request<DemandeIntervention>(
    `/demandes-intervention/${idDemande}/valider`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        validatedBy,
      }),
    },
  );
}

export async function refuserDemandeIntervention(
  idDemande: number,
  validatedBy: string,
  motifRefus: string,
) {
  return request<DemandeIntervention>(
    `/demandes-intervention/${idDemande}/refuser`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        validatedBy,
        motifRefus,
      }),
    },
  );
}

export async function generateOtCorrectiveFromDemande(
  idDemande: number,
  payload: {
    idGamme?: number;
    createdBy?: string;
    assignedBy?: string;
  },
) {
  return request<{
    message: string;
    intervention: Intervention;
  }>(`/demandes-intervention/${idDemande}/generate-ot-corrective`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMaterielsForMaintenance() {
  return request<Materiel[]>('/materiels');
}

export async function getGammesForMaintenance() {
  return request<Gamme[]>('/gammes');
}