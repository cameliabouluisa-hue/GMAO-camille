'use client';

import {
  CheckCircle2,
  Loader2,
  Play,
  RefreshCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

import {
  annulerInventaire,
  deleteInventairePrepare,
  genererLignesDepuisStock,
  lancerComptage,
  validerInventaire,
} from '../services/inventaires-prepares.service';
import { InventairePrepare } from '../types/inventaire-prepare.types';

type Props = {
  inventaire: InventairePrepare;
  onRefresh: () => void;
  onDeleted: () => void;
};

export function InventairePrepareActions({
  inventaire,
  onRefresh,
  onDeleted,
}: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(
    null,
  );

  async function runAction(
    actionName: string,
    callback: () => Promise<unknown>,
  ) {
    try {
      setLoadingAction(actionName);
      await callback();
      onRefresh();
    } finally {
      setLoadingAction(null);
    }
  }

  const isLoading = (name: string) => loadingAction === name;

  const isBrouillon = inventaire.statut === 'BROUILLON';
  const isEnComptage = inventaire.statut === 'EN_COMPTAGE';
  const isFinal = ['VALIDE', 'ANNULE'].includes(inventaire.statut);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {isBrouillon && (
        <>
          <button
            type="button"
            onClick={() =>
              runAction('generer', () =>
                genererLignesDepuisStock(
                  inventaire.idInventairePrepare,
                ),
              )
            }
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {isLoading('generer') ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCcw size={18} />
            )}
            Générer depuis stock
          </button>

          <button
            type="button"
            onClick={() =>
              runAction('lancer', () =>
                lancerComptage(inventaire.idInventairePrepare),
              )
            }
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0b3f59] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#083247]"
          >
            {isLoading('lancer') ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
            Lancer comptage
          </button>
        </>
      )}

      {isEnComptage && (
        <button
          type="button"
          onClick={() =>
            runAction('valider', () =>
              validerInventaire(inventaire.idInventairePrepare),
            )
          }
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
        >
          {isLoading('valider') ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CheckCircle2 size={18} />
          )}
          Valider
        </button>
      )}

      {!isFinal && (
        <button
          type="button"
          onClick={() =>
            runAction('annuler', () =>
              annulerInventaire(inventaire.idInventairePrepare),
            )
          }
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 shadow-sm transition hover:bg-red-100"
        >
          {isLoading('annuler') ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <XCircle size={18} />
          )}
          Annuler
        </button>
      )}

      {isBrouillon && (
        <button
          type="button"
          onClick={async () => {
            const confirmed = window.confirm(
              'Voulez-vous vraiment supprimer cet inventaire préparé ?',
            );

            if (!confirmed) return;

            await runAction('delete', async () => {
              await deleteInventairePrepare(
                inventaire.idInventairePrepare,
              );
              onDeleted();
            });
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-600 shadow-sm transition hover:bg-red-50"
        >
          {isLoading('delete') ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
          Supprimer
        </button>
      )}
    </div>
  );
}