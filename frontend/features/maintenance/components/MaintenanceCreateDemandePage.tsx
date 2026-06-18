'use client';

import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useCreateDemandeIntervention } from '../hooks/useCreateDemandeIntervention';

export default function MaintenanceCreateDemandePage() {
  const router = useRouter();

  const {
    materiels,
    values,
    loading,
    saving,
    error,
    setField,
    handleSubmit,
  } = useCreateDemandeIntervention({
    onSuccess: (idDemande) => router.push(`/maintenance/demandes/${idDemande}`),
  });

  return (
    <div
      className="min-h-full w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[900px]">
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
              Nouvelle demande d’intervention
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Déclarer une panne ou une anomalie pour créer une DI corrective.
            </p>
          </div>

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
        </div>

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

        <form
          onSubmit={handleSubmit}
          className="rounded-[18px] border p-5 shadow-sm"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E6EDF2',
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Matériel concerné
              </label>

              <select
                value={values.idMateriel}
                onChange={(e) => setField('idMateriel', e.target.value)}
                disabled={loading}
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
                style={{
                  borderColor: '#E6EDF2',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
              >
                <option value="">Sélectionner un matériel</option>
                {materiels.map((materiel) => (
                  <option key={materiel.idMateriel} value={materiel.idMateriel}>
                    {materiel.code}
                    {materiel.modele?.libelle
                      ? ` · ${materiel.modele.libelle}`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Priorité
              </label>

              <select
                value={values.priorite}
                onChange={(e) => setField('priorite', e.target.value)}
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
                style={{
                  borderColor: '#E6EDF2',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
              >
                <option value="NORMALE">Normale</option>
                <option value="URGENTE">Urgente</option>
                <option value="CRITIQUE">Critique</option>
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Créée par
              </label>

              <input
                value={values.createdBy}
                onChange={(e) => setField('createdBy', e.target.value)}
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
                style={{
                  borderColor: '#E6EDF2',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: '#6E8CA0' }}
            >
              Description de la panne
            </label>

            <textarea
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={6}
              placeholder="Exemple : fuite d’huile détectée sur le chariot..."
              className="w-full resize-none rounded-[12px] border px-3 py-3 text-[13px] outline-none"
              style={{
                borderColor: '#E6EDF2',
                backgroundColor: '#FFFFFF',
                color: '#183B56',
              }}
            />
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: '#0F5F78',
              }}
            >
              <Save size={16} />
              {saving ? 'Enregistrement...' : 'Créer la DI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}