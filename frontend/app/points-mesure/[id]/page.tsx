import { PointMesureDetailPage } from '@/features/points-mesure/components/PointMesureDetailPage';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PointMesurePage({ params }: Props) {
  const { id } = await params;

  const idPointMesure = Number(id);

  if (Number.isNaN(idPointMesure)) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
        <section className="mx-auto max-w-[1450px]">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-base font-semibold text-red-700">
            Identifiant du point de mesure invalide.
          </div>
        </section>
      </main>
    );
  }

  return <PointMesureDetailPage idPointMesure={idPointMesure} />;
}