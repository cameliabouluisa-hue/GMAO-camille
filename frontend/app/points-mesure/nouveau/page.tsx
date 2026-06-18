'use client';

import { useRouter } from 'next/navigation';

import { PointMesureFormPage } from '@/features/points-mesure/components/PointMesureFormPage';
import { createPointMesure } from '@/features/points-mesure/services/point-mesure.service';
import type { CreatePointMesurePayload } from '@/features/points-mesure/types/point-mesure.types';

export default function NouveauPointMesurePage() {
  const router = useRouter();

  async function handleCreate(data: CreatePointMesurePayload) {
    const created = await createPointMesure(data);
    router.push(`/points-mesure/${created.idPointMesure}`);
  }

  return <PointMesureFormPage mode="create" onSubmit={handleCreate}/>;
}