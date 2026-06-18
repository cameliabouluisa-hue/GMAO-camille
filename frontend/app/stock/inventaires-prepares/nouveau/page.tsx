'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { CreateInventairePrepareForm } from '@/features/inventaires-prepares/components/CreateInventairePrepareForm';
import { InventairePrepareHeader } from '@/features/inventaires-prepares/components/InventairePrepareHeader';

export default function NouveauInventairePreparePage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-8">
      <div className="mx-auto max-w-[1100px] space-y-7">
        <InventairePrepareHeader
          title="Nouvel inventaire préparé"
          subtitle="Créez un inventaire préparé puis ajoutez les articles à compter ou générez les lignes automatiquement depuis le stock actuel."
          actions={
            <Link
              href="/stock/inventaires-prepares"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Retour
            </Link>
          }
        />

        <CreateInventairePrepareForm />
      </div>
    </main>
  );
}