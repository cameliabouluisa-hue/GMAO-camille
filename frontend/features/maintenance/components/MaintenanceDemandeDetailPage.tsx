'use client';

import {
  ArrowLeft,
  CheckCircle2,
  RefreshCcw,
  Send,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { useDemandeInterventionDetail } from '../hooks/useDemandeInterventionDetail';

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getStatutLabel(statut?: string | null) {
  const labels: Record<string, string> = {
    EN_ATTENTE_VALIDATION: 'En attente',
    VALIDEE: 'Validée',
    REFUSEE: 'Refusée',
    OT_GENERE: 'OT généré',
  };

  return statut ? labels[statut] || statut : '-';
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: '#6E8CA0' }}
      >
        {label}
      </p>

      <p className="mt-1 text-[14px] font-semibold" style={{ color: '#183B56' }}>
        {value || '-'}
      </p>
    </div>
  );
}

export default function MaintenanceDemandeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const {
    demande,
    gammes,
    selectedGammeId,
    generatedIntervention,
    loading,
    actionLoading,
    error,
    success,
    setSelectedGammeId,
    refetch,
    handleValider,
    handleRefuser,
    handleGenerateOt,
  } = useDemandeInterventionDetail({
    demandeId: id,
  });

  const canValidate = demande?.statut === 'EN_ATTENTE_VALIDATION';
  const canGenerateOt = demande?.statut === 'VALIDEE';

  return (
    <div
      className="min-h-full w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.26em]"
              style={{ color: '#6E8CA0' }}
            >
              BMT · Maintenance
            </p>

            <h1
              className="mt-2 text-[28px] font-bold leading-tight"
              style={{ color: '#183B56' }}
            >
              Détail DI {demande ? `· DI-${String(demande.idDemande).padStart(5, '0')}` : ''}
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Validation, refus ou génération d’un OT correctif.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push('/maintenance/demandes')}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold transition hover:bg-slate-50"
              style={{
                borderColor: '#E6EDF2',
                backgroundColor: '#FFFFFF',
                color: '#183B56',
              }}
            >
              <ArrowLeft size={16} />
              Retour
            </button>

            <button
              type="button"
              onClick={refetch}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold transition hover:bg-slate-50"
              style={{
                borderColor: '#E6EDF2',
                backgroundColor: '#FFFFFF',
                color: '#183B56',
              }}
            >
              <RefreshCcw size={16} />
              Actualiser
            </button>
          </div>
        </div>

        {success && (
          <div
            className="mb-5 rounded-xl border px-4 py-3 text-[13px]"
            style={{
              borderColor: '#B9E2C4',
              color: '#1F6B3A',
              backgroundColor: 'rgba(255,255,255,0.9)',
            }}
          >
            {success}
          </div>
        )}

        {error && (
          <div
            className="mb-5 rounded-xl border px-4 py-3 text-[13px]"
            style={{
              borderColor: '#E8B4B4',
              color: '#8A1F1F',
              backgroundColor: 'rgba(255,255,255,0.9)',
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement de la DI...
          </div>
        )}

        {!loading && demande && (
          <div className="space-y-5">
            <div
              className="rounded-[18px] border p-5 shadow-sm"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E6EDF2',
              }}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <InfoItem
                  label="Code DI"
                  value={`DI-${String(demande.idDemande).padStart(5, '0')}`}
                />
                <InfoItem label="Statut" value={getStatutLabel(demande.statut)} />
                <InfoItem label="Priorité" value={demande.priorite} />
                <InfoItem label="Matériel" value={demande.materiel?.code} />
                <InfoItem label="Date demande" value={formatDate(demande.dateDemande)} />
                <InfoItem label="Créée par" value={demande.createdBy} />
                <InfoItem label="Validée par" value={demande.validatedBy} />
                <InfoItem label="Date validation" value={formatDate(demande.dateValidation)} />
                <InfoItem label="Motif refus" value={demande.motifRefus} />
              </div>

              <div className="mt-5">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#6E8CA0' }}
                >
                  Description
                </p>

                <div
                  className="mt-2 min-h-[100px] rounded-[14px] border p-3 text-[13px]"
                  style={{
                    borderColor: '#E6EDF2',
                    backgroundColor: '#F8FBFC',
                    color: '#183B56',
                  }}
                >
                  {demande.description || '-'}
                </div>
              </div>
            </div>

            {canValidate && (
              <div
                className="flex flex-col justify-between gap-3 rounded-[18px] border p-5 shadow-sm md:flex-row md:items-center"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E6EDF2',
                }}
              >
                <div>
                  <h2
                    className="text-[18px] font-bold"
                    style={{ color: '#183B56' }}
                  >
                    Décision responsable
                  </h2>
                  <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
                    Valider la DI pour permettre la génération de l’OT correctif.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleRefuser}
                    className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold transition disabled:opacity-60"
                    style={{
                      borderColor: '#E8B4B4',
                      backgroundColor: '#FFFFFF',
                      color: '#8A1F1F',
                    }}
                  >
                    <XCircle size={16} />
                    Refuser
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleValider}
                    className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold text-white transition disabled:opacity-60"
                    style={{
                      backgroundColor: '#0F5F78',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Valider
                  </button>
                </div>
              </div>
            )}

            {canGenerateOt && (
              <div
                className="rounded-[18px] border p-5 shadow-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E6EDF2',
                }}
              >
                <h2
                  className="text-[18px] font-bold"
                  style={{ color: '#183B56' }}
                >
                  Générer OT correctif
                </h2>

                <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
                  Sélectionner une gamme si nécessaire, puis générer l’ordre de travail.
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <select
                    value={selectedGammeId}
                    onChange={(e) => setSelectedGammeId(e.target.value)}
                    className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
                    style={{
                      borderColor: '#E6EDF2',
                      backgroundColor: '#FFFFFF',
                      color: '#183B56',
                    }}
                  >
                    <option value="">Sans gamme</option>
                    {gammes.map((gamme) => (
                      <option key={gamme.idGamme} value={gamme.idGamme}>
                        {gamme.code} · {gamme.libelle}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleGenerateOt}
                    className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold text-white transition disabled:opacity-60"
                    style={{
                      backgroundColor: '#16425B',
                    }}
                  >
                    <Send size={16} />
                    Générer OT
                  </button>
                </div>
              </div>
            )}

            {(generatedIntervention || demande.intervention?.[0]) && (
              <div
                className="flex flex-col justify-between gap-3 rounded-[18px] border p-5 shadow-sm md:flex-row md:items-center"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E6EDF2',
                }}
              >
                <div>
                  <h2
                    className="text-[18px] font-bold"
                    style={{ color: '#183B56' }}
                  >
                    OT généré
                  </h2>

                  <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
                    Cette demande est déjà transformée en intervention corrective.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const intervention =
                      generatedIntervention || demande.intervention?.[0];

                    if (intervention) {
                      router.push(
                        `/maintenance/interventions/${intervention.idIntervention}`,
                      );
                    }
                  }}
                  className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold text-white transition"
                  style={{
                    backgroundColor: '#0F5F78',
                  }}
                >
                  Ouvrir OT
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}