const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type GeneralDashboardResponse = {
  equipements: {
    total: number;
    actifs: number;
    critiques: number;
  };
  maintenance: {
    demandesTotales: number;
    interventionsEnCours: number;
    plansALancer: number;
  };
  stock: {
    articles: number;
    entrees: number;
    sorties: number;
    magasins: number;
  };
};

export type StockDashboardResponse = {
  totalArticles: number;
  totalEntrees: number;
  totalSorties: number;
  totalMouvements: number;
  totalMagasins: number;
  totalInventaires: number;
  inventairesPrepares: number;
  dernieresOperations: {
    id: number;
    type: string;
    reference: string;
    article: string;
    magasin: string;
    date: string;
    quantity: string;
  }[];
};

export type MaintenanceDashboardResponse = {
  totalDemands: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  preventivePlans: number;
  scheduledInterventions: number;
  performance: number;
};

export type EquipementsDashboardResponse = {
  total: number;
  active: number;
  inactive: number;
  models: number;
  critical: number;
  measurePoints: number;
  lastAdded: number;
  status: string;
};

async function request<T>(endpoint: string): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Erreur API ${response.status} sur ${url}`);
  }

  return response.json() as Promise<T>;
}

export function getGeneralDashboard() {
  return request<GeneralDashboardResponse>('/dashboards/general');
}

export function getStockDashboard() {
  return request<StockDashboardResponse>('/dashboards/stock');
}

export function getMaintenanceDashboard() {
  return request<MaintenanceDashboardResponse>('/dashboards/maintenance');
}

export function getEquipementsDashboard() {
  return request<EquipementsDashboardResponse>('/dashboards/equipements');
}