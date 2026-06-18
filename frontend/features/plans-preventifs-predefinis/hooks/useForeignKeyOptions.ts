'use client';

import { useEffect, useState } from 'react';

type GammeOption = {
  idGamme: number;
  code?: string | null;
  libelle?: string | null;
};

type ModeleOption = {
  idModele: number;
  code?: string | null;
  libelle?: string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function useForeignKeyOptions() {
  const [gammes, setGammes] = useState<GammeOption[]>([]);
  const [modeles, setModeles] = useState<ModeleOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [gammesRes, modelesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/gammes`, { cache: 'no-store' }),
          fetch(`${API_BASE_URL}/modeles`, { cache: 'no-store' }),
        ]);

        if (gammesRes.ok) {
          const gammesData = await gammesRes.json();
          setGammes(Array.isArray(gammesData) ? gammesData : []);
        }

        if (modelesRes.ok) {
          const modelesData = await modelesRes.json();
          setModeles(Array.isArray(modelesData) ? modelesData : []);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    gammes,
    modeles,
    loading,
  };
}