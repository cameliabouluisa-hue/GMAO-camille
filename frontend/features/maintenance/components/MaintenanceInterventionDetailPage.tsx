'use client';

import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  ClipboardList,
  History,
  LockKeyhole,
  RefreshCcw,
  Users,
  Wrench,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { useInterventionDetail } from '../hooks/useInterventionDetail';
import type { Intervention } from '../types/maintenance.types';

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getEtatLabel(etat?: string | null) {
  const labels: Record<string, string> = {
    A_PLANIFIER: 'À planifier',
    AFFECTEE: 'Affectée',
    AFFECTEE_EQUIPE: 'Affectée équipe',
    REALISEE: 'Réalisée',
    CLOTUREE: 'Clôturée',
    ANNULEE: 'Annulée',
  };

  return etat ? labels[etat] || etat : '-';
}

function getTypeLabel(type?: string | null) {
  const labels: Record<string, string> = {
    PREVENTIF: 'Préventif',
    CORRECTIF: 'Correctif',
  };

  return type ? labels[type] || type : '-';
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

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="max-w-full overflow-hidden rounded-[18px] border p-4 shadow-sm"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E6EDF2',
      }}
    >
      <div className="mb-4 flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]"
          style={{
            backgroundColor: '#EEF6F8',
            color: '#0F5F78',
          }}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-[18px] font-bold" style={{ color: '#183B56' }}>
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-[12px]" style={{ color: '#6B8596' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function ActionBar({
  intervention,
  actionLoading,
  onRealiser,
  onCloturer,
}: {
  intervention: Intervention;
  actionLoading: boolean;
  onRealiser: () => void;
  onCloturer: () => void;
}) {
  const canRealiser =
    intervention.etat === 'AFFECTEE' || intervention.etat === 'AFFECTEE_EQUIPE';

  const canCloturer = intervention.etat === 'REALISEE';

  if (!canRealiser && !canCloturer) {
    return (
      <div
        className="rounded-[18px] border p-4 text-[13px]"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E6EDF2',
          color: '#6B8596',
        }}
      >
        État actuel :{' '}
        <span className="font-semibold" style={{ color: '#183B56' }}>
          {getEtatLabel(intervention.etat)}
        </span>
        . Aucune action métier disponible pour cet OT.
      </div>
    );
  }

  return (
    <div
      className="flex flex-col justify-between gap-3 rounded-[18px] border p-4 shadow-sm md:flex-row md:items-center"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E6EDF2',
      }}
    >
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: '#6E8CA0' }}
        >
          Actions OT
        </p>

        <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
          Les boutons changent selon l’état de l’intervention.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {canRealiser && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={onRealiser}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: '#0F5F78',
            }}
          >
            <CheckCircle2 size={16} />
            {actionLoading ? 'Traitement...' : 'Réaliser OT'}
          </button>
        )}

        {canCloturer && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={onCloturer}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: '#16425B',
            }}
          >
            <LockKeyhole size={16} />
            {actionLoading ? 'Traitement...' : 'Clôturer OT'}
          </button>
        )}
      </div>
    </div>
  );
}

function GeneralSection({ intervention }: { intervention: Intervention }) {
  return (
    <SectionCard
      title="Général"
      subtitle="Informations principales de l’ordre de travail."
      icon={<ClipboardList size={20} />}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <InfoItem label="Code OT" value={intervention.code} />
        <InfoItem label="Type" value={getTypeLabel(intervention.typeMaintenance)} />
        <InfoItem label="État" value={getEtatLabel(intervention.etat)} />
        <InfoItem label="Priorité" value={intervention.priorite || 'NORMALE'} />
        <InfoItem label="Date début" value={formatDate(intervention.dateDebut)} />
        <InfoItem label="Date fin" value={formatDate(intervention.dateFin)} />
        <InfoItem label="Créé par" value={intervention.createdBy} />
        <InfoItem label="Affecté par" value={intervention.assignedBy} />
        <InfoItem label="Clôturé par" value={intervention.closedBy} />
      </div>

      <div className="mt-5">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: '#6E8CA0' }}
        >
          Description / commentaire
        </p>

        <div
          className="mt-2 min-h-[90px] rounded-[14px] border p-3 text-[13px]"
          style={{
            borderColor: '#E6EDF2',
            backgroundColor: '#F8FBFC',
            color: '#183B56',
          }}
        >
          {intervention.description || 'Aucun commentaire saisi.'}
        </div>
      </div>
    </SectionCard>
  );
}

function OriginSection({ intervention }: { intervention: Intervention }) {
  const isPreventif = intervention.typeMaintenance === 'PREVENTIF';

  return (
    <SectionCard
      title="Origine"
      subtitle="Source de génération de l’OT : préventif ou DI corrective."
      icon={<History size={20} />}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <InfoItem
          label="Origine génération"
          value={intervention.origineGeneration}
        />

        <InfoItem label="Matériel" value={intervention.materiel?.code} />

        <InfoItem label="Modèle" value={intervention.materiel?.modele?.libelle} />

        {isPreventif ? (
          <>
            <InfoItem
              label="Plan préventif"
              value={intervention.plan_preventif?.code}
            />
            <InfoItem
              label="Déclencheur"
              value={intervention.idPlanPreventifDeclencheur}
            />
            <InfoItem
              label="Type déclencheur"
              value={intervention.plan_preventif_declencheur?.typeDeclencheur}
            />
          </>
        ) : (
          <>
            <InfoItem label="DI associée" value={intervention.idDemande} />
            <InfoItem
              label="Statut DI"
              value={intervention.demande_intervention?.statut}
            />
            <InfoItem
              label="Validée par"
              value={intervention.demande_intervention?.validatedBy}
            />
          </>
        )}
      </div>
    </SectionCard>
  );
}

function OperationsSection({ intervention }: { intervention: Intervention }) {
  const operations = intervention.operation_intervention || [];

  return (
    <SectionCard
      title="Opérations"
      subtitle="Liste des tâches techniques à exécuter sur l’OT."
      icon={<Wrench size={20} />}
    >
      <div className="max-w-full overflow-x-auto pb-2">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr
              className="border-b text-[11px] uppercase tracking-[0.16em]"
              style={{
                borderColor: '#E6EDF2',
                color: '#6E8CA0',
              }}
            >
              <th className="py-3 pr-4 font-semibold">Ordre</th>
              <th className="py-3 pr-4 font-semibold">Opération</th>
              <th className="py-3 pr-4 font-semibold">Description</th>
              <th className="py-3 pr-4 font-semibold">Temps</th>
              <th className="py-3 pr-4 font-semibold">Obligatoire</th>
            </tr>
          </thead>

          <tbody>
            {operations.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-[13px]"
                  style={{ color: '#6B8596' }}
                >
                  Aucune opération liée à cet OT.
                </td>
              </tr>
            )}

            {operations.map((operation) => (
              <tr
                key={operation.idOperation}
                className="border-b text-[13px]"
                style={{
                  borderColor: '#EEF3F6',
                  color: '#183B56',
                }}
              >
                <td className="whitespace-nowrap py-3 pr-4">
                  {operation.ordre ?? '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4 font-semibold">
                  {operation.libelle || '-'}
                </td>

                <td className="py-3 pr-4">{operation.description || '-'}</td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {operation.tempsPasse ?? '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {operation.obligatoire ? 'Oui' : 'Non'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function AffectationsSection({ intervention }: { intervention: Intervention }) {
  const affectations = intervention.affectation_technicien || [];

  return (
    <SectionCard
      title="Main d’œuvre / Affectations"
      subtitle="Techniciens et équipe affectés à l’intervention."
      icon={<Users size={20} />}
    >
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <InfoItem label="Équipe" value={intervention.equipe_maintenance?.libelle} />
        <InfoItem
          label="Date affectation"
          value={formatDate(intervention.dateAffectation)}
        />
        <InfoItem label="Affecté par" value={intervention.assignedBy} />
      </div>

      <div className="max-w-full overflow-x-auto pb-2">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr
              className="border-b text-[11px] uppercase tracking-[0.16em]"
              style={{
                borderColor: '#E6EDF2',
                color: '#6E8CA0',
              }}
            >
              <th className="py-3 pr-4 font-semibold">Matricule</th>
              <th className="py-3 pr-4 font-semibold">Technicien</th>
              <th className="py-3 pr-4 font-semibold">Rôle</th>
              <th className="py-3 pr-4 font-semibold">Temps travail</th>
            </tr>
          </thead>

          <tbody>
            {affectations.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-[13px]"
                  style={{ color: '#6B8596' }}
                >
                  Aucun technicien affecté.
                </td>
              </tr>
            )}

            {affectations.map((affectation) => (
              <tr
                key={affectation.idAffectation}
                className="border-b text-[13px]"
                style={{
                  borderColor: '#EEF3F6',
                  color: '#183B56',
                }}
              >
                <td className="whitespace-nowrap py-3 pr-4 font-semibold">
                  {affectation.technicien?.matricule || '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {affectation.technicien?.nom || '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {affectation.technicien?.roleEquipe || '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {affectation.tempsTravail ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function FournituresSection() {
  return (
    <SectionCard
      title="Fournitures / pièces consommées"
      subtitle="Section préparée pour l’intégration avec le module stock."
      icon={<Boxes size={20} />}
    >
      <div
        className="rounded-[16px] border p-4"
        style={{
          borderColor: '#E6EDF2',
          backgroundColor: '#F8FBFC',
        }}
      >
        <p className="text-[14px] font-semibold" style={{ color: '#183B56' }}>
          Connexion stock en attente
        </p>

        <p className="mt-2 text-[13px] leading-6" style={{ color: '#6B8596' }}>
          Les pièces utilisées dans l’OT seront affichées ici après le jumelage
          avec le module stock. Le futur flux sera : sélectionner un article,
          choisir le magasin, saisir la quantité, puis décrémenter
          automatiquement le stock.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {['Article', 'Magasin', 'Quantité', 'Ajouter consommation'].map(
            (label) => (
              <button
                key={label}
                type="button"
                disabled
                className="h-[42px] rounded-[12px] border px-4 text-[13px] font-semibold opacity-60"
                style={{
                  borderColor: '#E6EDF2',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>
    </SectionCard>
  );
}

export default function MaintenanceInterventionDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = String(params.id);

  const {
    intervention,
    loading,
    actionLoading,
    error,
    success,
    refetch,
    handleRealiser,
    handleCloturer,
  } = useInterventionDetail({
    interventionId: id,
  });

  return (
    <div
      className="min-h-full w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[1280px]">
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
              Détail OT {intervention?.code ? `· ${intervention.code}` : ''}
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Consultation complète de l’ordre de travail, de son origine et de
              ses opérations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push('/maintenance/interventions')}
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

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement du détail OT...
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

        {!loading && intervention && (
          <div className="space-y-5">
            <ActionBar
              intervention={intervention}
              actionLoading={actionLoading}
              onRealiser={handleRealiser}
              onCloturer={handleCloturer}
            />

            <GeneralSection intervention={intervention} />
            <OriginSection intervention={intervention} />
            <OperationsSection intervention={intervention} />
            <AffectationsSection intervention={intervention} />
            <FournituresSection />
          </div>
        )}
      </div>
    </div>
  );
}