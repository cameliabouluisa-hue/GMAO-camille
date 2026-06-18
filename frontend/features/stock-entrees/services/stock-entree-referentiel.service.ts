export type EmplacementMagasin = {
  idEmplacement: number;
  code?: string | null;
  libelle?: string | null;
  actif?: boolean | null;
};

const API_BASE_URL = 'http://localhost:3001';

async function parseApiError(res: Response, fallback: string) {
  const error = await res.json().catch(() => null);

  if (Array.isArray(error?.message)) {
    return error.message.join(', ');
  }

  return error?.message ?? fallback;
}

/**
 * Adapte juste cette URL si ton backend utilise un autre endpoint.
 * Exemple actuel supposé :
 * GET /magasins/:idMagasin/emplacements
 */
export async function getEmplacementsByMagasin(
  idMagasin: number,
): Promise<EmplacementMagasin[]> {
  const res = await fetch(
    `${API_BASE_URL}/magasins/${idMagasin}/emplacements`,
    {
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error(
      await parseApiError(
        res,
        'Erreur lors du chargement des emplacements du magasin.',
      ),
    );
  }

  return res.json();
}