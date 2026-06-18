

import { Select } from '@/components/select';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Building2,
  CalendarClock,
  Factory,
  FileText,
  Landmark,
  RefreshCcw,
  Save,
  Settings2,
  X,
} from 'lucide-react';

type Mode = 'create' | 'edit';

type FamilleOption = {
  idFamille: number;
  code?: string | null;
  libelle?: string | null;
};

type EtatModeleOption = {
  idEtat: number;
  code?: string | null;
  libelle?: string | null;
};

type TypeEquipementOption = {
  idTypeEquipement: number;
  code?: string | null;
  libelle?: string | null;
};

type FabricantOption = {
  idFabricant: number;
  code?: string | null;
  nom?: string | null;
};

type MarqueOption = {
  idMarque: number;
  code?: string | null;
  libelle?: string | null;
  idFabricant?: number | null;
};

type PlanPreventifPredefiniOption = {
  idPlanPreventifPredefini: number;
  code?: string | null;
  libelle?: string | null;
  description?: string | null;
  actif?: boolean | null;
};

type ModelePppAssociation = {
  idModelePlanPreventifPredefini?: number;
  idPlanPreventifPredefini?: number | null;
  principal?: boolean | null;
  actif?: boolean | null;
  plan_preventif_predefini?: PlanPreventifPredefiniOption | null;
};

type ModeleInitialData = {
  idModele?: number;
  code?: string | null;
  libelle?: string | null;

  idFamille?: number | null;
  idEtat?: number | null;
  idTypeEquipement?: number | null;
  idFabricant?: number | null;
  idMarque?: number | null;

  commentaire?: string | null;
  dureeVie?: number | string | null;
  budget?: number | string | null;

  plan_preventif_predefini?: PlanPreventifPredefiniOption[];

  modele_plan_preventif_predefini?: ModelePppAssociation[];
};

type CreateModeleDto = {
  code?: string | null;
  libelle?: string | null;

  idFamille?: number | null;
  idEtat: number;

  idTypeEquipement?: number | null;
  idFabricant?: number | null;
  idMarque?: number | null;

  commentaire?: string | null;
  dureeVie?: number | null;
  budget?: number | null;

  pppIds?: number[];
  pppPrincipalId?: number | null;
};

type UpdateModeleDto = Partial<CreateModeleDto>;

type Props = {
  mode: Mode;
  initialData?: ModeleInitialData | null;

  familles: FamilleOption[];
  etats: EtatModeleOption[];
  typesEquipement: TypeEquipementOption[];
  fabricants: FabricantOption[];
  marques: MarqueOption[];
  plansPreventifsPredefinis: PlanPreventifPredefiniOption[];

  onSubmit: (data: CreateModeleDto | UpdateModeleDto) => Promise<void>;
};

type FormState = {
  code: string;
  libelle: string;

  idFamille: string;
  idEtat: string;
  idTypeEquipement: string;
  idFabricant: string;
  idMarque: string;

  commentaire: string;
  dureeVie: string;
  budget: string;

  pppIds: string[];
  pppPrincipalId: string;
};

const DEFAULT_FORM: FormState = {
  code: '',
  libelle: '',

  idFamille: 'NONE',
  idEtat: '',
  idTypeEquipement: 'NONE',
  idFabricant: 'NONE',
  idMarque: 'NONE',

  commentaire: '',
  dureeVie: '',
  budget: '',

  pppIds: [],
  pppPrincipalId: '',
};

function toInputValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function toSelectValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'NONE';
  return String(value);
}

function nullableText(value: string): string | null {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function nullableNumber(value: string): number | null {
  if (!value.trim()) return null;

  const parsed = Number(value);

  if (Number.isNaN(parsed)) return null;

  return parsed;
}

function getAssociationPppId(association: ModelePppAssociation): number | null {
  const directId = association.idPlanPreventifPredefini;
  const nestedId =
    association.plan_preventif_predefini?.idPlanPreventifPredefini;

  const id = directId ?? nestedId ?? null;

  if (id === null || id === undefined) return null;

  const parsed = Number(id);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function buildInitialForm(initialData?: ModeleInitialData | null): FormState {
  if (!initialData) {
    return DEFAULT_FORM;
  }

  const associations = initialData.modele_plan_preventif_predefini ?? [];
  const directPpp = initialData.plan_preventif_predefini ?? [];

  const associatedIdsFromAssociation = associations
    .map(getAssociationPppId)
    .filter((id): id is number => id !== null)
    .map(String);

  const associatedIdsFromDirectRelation = directPpp
    .map((ppp) => ppp.idPlanPreventifPredefini)
    .filter((id): id is number => Number.isInteger(id) && id > 0)
    .map(String);

  const selectedPppIds = Array.from(
    new Set([
      ...associatedIdsFromAssociation,
      ...associatedIdsFromDirectRelation,
    ]),
  );

  const principalAssociation = associations.find(
    (association) => association.principal,
  );

  const principalId = principalAssociation
    ? getAssociationPppId(principalAssociation)
    : null;

  return {
    code: toInputValue(initialData.code),
    libelle: toInputValue(initialData.libelle),

    idFamille: toSelectValue(initialData.idFamille),
    idEtat: toInputValue(initialData.idEtat),
    idTypeEquipement: toSelectValue(initialData.idTypeEquipement),
    idFabricant: toSelectValue(initialData.idFabricant),
    idMarque: toSelectValue(initialData.idMarque),

    commentaire: toInputValue(initialData.commentaire),
    dureeVie: toInputValue(initialData.dureeVie),
    budget: toInputValue(initialData.budget),

    pppIds: selectedPppIds,
    pppPrincipalId: principalId ? String(principalId) : selectedPppIds[0] || '',
  };
}

export default function ModeleForm({
  mode,
  initialData,
  familles,
  etats,
  typesEquipement,
  fabricants,
  marques,
  plansPreventifsPredefinis,
  onSubmit,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(initialData),
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Modifier le modèle' : 'Nouveau modèle';
  const submitLabel = isEditMode ? 'Enregistrer' : 'Créer le modèle';

  useEffect(() => {
    setForm(buildInitialForm(initialData));
  }, [initialData]);

  const filteredMarques = useMemo(() => {
    if (form.idFabricant === 'NONE') return marques;

    return marques.filter(
      (marque) => String(marque.idFabricant) === form.idFabricant,
    );
  }, [form.idFabricant, marques]);

  const selectedType = useMemo(() => {
    if (form.idTypeEquipement === 'NONE') return null;

    return typesEquipement.find(
      (type) => String(type.idTypeEquipement) === form.idTypeEquipement,
    );
  }, [form.idTypeEquipement, typesEquipement]);

  const selectedFabricant = useMemo(() => {
    if (form.idFabricant === 'NONE') return null;

    return fabricants.find(
      (fabricant) => String(fabricant.idFabricant) === form.idFabricant,
    );
  }, [form.idFabricant, fabricants]);

  const completion = useMemo(() => {
    const fields = [
      form.code,
      form.libelle,
      form.idEtat,
      form.idFamille !== 'NONE' ? form.idFamille : '',
      form.idTypeEquipement !== 'NONE' ? form.idTypeEquipement : '',
      form.idFabricant !== 'NONE' ? form.idFabricant : '',
      form.idMarque !== 'NONE' ? form.idMarque : '',
      form.dureeVie,
      form.budget,
      form.commentaire,
      form.pppIds.length > 0 ? 'PPP' : '',
    ];

    const filled = fields.filter((field) => String(field).trim()).length;

    return Math.round((filled / fields.length) * 100);
  }, [form]);

 const displayedPlansPreventifsPredefinis = useMemo(() => {
  if (!isEditMode) {
    return [];
  }

  const associations = initialData?.modele_plan_preventif_predefini ?? [];
  const directPpp = initialData?.plan_preventif_predefini ?? [];

  const allPppById = new Map(
    plansPreventifsPredefinis.map((ppp) => [
      String(ppp.idPlanPreventifPredefini),
      ppp,
    ]),
  );

  const displayed: PlanPreventifPredefiniOption[] = [];
  const seen = new Set<string>();

  associations.forEach((association) => {
    const pppId = getAssociationPppId(association);

    if (!pppId) return;

    const key = String(pppId);

    if (seen.has(key)) return;

    seen.add(key);

    const fromAvailableList = allPppById.get(key);
    const fromAssociation = association.plan_preventif_predefini;

    displayed.push(
      fromAvailableList || {
        idPlanPreventifPredefini: pppId,
        code: fromAssociation?.code ?? `PPP-${pppId}`,
        libelle:
          fromAssociation?.libelle ??
          'Plan préventif prédéfini sans libellé',
        description: fromAssociation?.description ?? null,
        actif: fromAssociation?.actif ?? true,
      },
    );
  });

  directPpp.forEach((ppp) => {
    const key = String(ppp.idPlanPreventifPredefini);

    if (seen.has(key)) return;

    seen.add(key);

    const fromAvailableList = allPppById.get(key);

    displayed.push(fromAvailableList || ppp);
  });

  return displayed;
}, [isEditMode, initialData, plansPreventifsPredefinis]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleFabricantChange(value: string) {
    setForm((previous) => ({
      ...previous,
      idFabricant: value,
      idMarque: 'NONE',
    }));
  }

  function handleTogglePpp(id: number) {
    const value = String(id);

    setForm((previous) => {
      const alreadySelected = previous.pppIds.includes(value);

      if (alreadySelected) {
        const nextIds = previous.pppIds.filter((item) => item !== value);

        const nextPrincipal =
          previous.pppPrincipalId === value
            ? nextIds[0] || ''
            : previous.pppPrincipalId;

        return {
          ...previous,
          pppIds: nextIds,
          pppPrincipalId: nextPrincipal,
        };
      }

      return {
        ...previous,
        pppIds: [...previous.pppIds, value],
        pppPrincipalId: previous.pppPrincipalId || value,
      };
    });
  }

  function handlePrincipalPpp(id: number) {
    const value = String(id);

    setForm((previous) => ({
      ...previous,
      pppIds: previous.pppIds.includes(value)
        ? previous.pppIds
        : [...previous.pppIds, value],
      pppPrincipalId: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!form.code.trim()) {
      setError('Le code modèle est obligatoire.');
      return;
    }

    if (!form.libelle.trim()) {
      setError('Le libellé du modèle est obligatoire.');
      return;
    }

    if (!form.idEtat) {
      setError("L'état du modèle est obligatoire.");
      return;
    }

    const idEtat = Number(form.idEtat);

    if (Number.isNaN(idEtat)) {
      setError("L'état sélectionné est invalide.");
      return;
    }

    const idFamille =
      form.idFamille !== 'NONE' ? Number(form.idFamille) : null;

    const idTypeEquipement =
      form.idTypeEquipement !== 'NONE'
        ? Number(form.idTypeEquipement)
        : null;

    const idFabricant =
      form.idFabricant !== 'NONE' ? Number(form.idFabricant) : null;

    const idMarque = form.idMarque !== 'NONE' ? Number(form.idMarque) : null;

    const dureeVie = nullableNumber(form.dureeVie);
    const budget = nullableNumber(form.budget);

    if (form.dureeVie.trim() && (!dureeVie || dureeVie < 1)) {
      setError('La durée de vie doit être un nombre positif.');
      return;
    }

    if (form.budget.trim() && (budget === null || budget < 0)) {
      setError('Le budget doit être un montant positif ou égal à zéro.');
      return;
    }

    const pppIds = form.pppIds
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);

    const pppPrincipalId =
      form.pppPrincipalId && pppIds.includes(Number(form.pppPrincipalId))
        ? Number(form.pppPrincipalId)
        : pppIds[0] ?? null;

    const payload: CreateModeleDto | UpdateModeleDto = {
      code: form.code.trim(),
      libelle: form.libelle.trim(),

      idFamille,
      idEtat,
      idTypeEquipement,
      idFabricant,
      idMarque,

      commentaire: nullableText(form.commentaire),
      dureeVie,
      budget,

      pppIds,
      pppPrincipalId,
    };

    try {
      setSaving(true);
      await onSubmit(payload);
      router.push('/modeles');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de l’enregistrement.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-6 text-slate-950">
      <div className="mx-auto max-w-[1280px] pb-24">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>

        <section className="mb-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#06475a] text-white">
                <Boxes className="h-7 w-7" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eef7fa] px-3 py-1 text-xs font-bold text-[#06475a]">
                    Fiche modèle
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    Module équipements
                  </span>
                </div>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  {title}
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Définissez les attributs communs aux matériels rattachés à ce
                  modèle.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge>
                {selectedType?.libelle ||
                  selectedType?.code ||
                  'Type non défini'}
              </Badge>

              <Badge variant={selectedFabricant ? 'success' : 'muted'}>
                {selectedFabricant?.nom ||
                  selectedFabricant?.code ||
                  'Fabricant non défini'}
              </Badge>

              <div className="w-[180px] rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Complétion</span>
                  <span>{completion}%</span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#06475a] transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSection
            icon={<FileText className="h-5 w-5" />}
            title="Identification du modèle"
            description="Les informations de base permettent d’identifier rapidement le modèle dans la GMAO."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Code modèle" required>
                <input
                  value={form.code}
                  onChange={(event) => updateField('code', event.target.value)}
                  placeholder="Ex : MOD-RTG-001"
                  className={inputClassName}
                />
              </Field>

              <Field label="Libellé" required>
                <input
                  value={form.libelle}
                  onChange={(event) =>
                    updateField('libelle', event.target.value)
                  }
                  placeholder="Ex : Portique gerbeur RTG"
                  className={inputClassName}
                />
              </Field>

              <Field label="Famille">
                <Select
                  value={form.idFamille}
                  onValueChange={(value: string) =>
                    updateField('idFamille', value)
                  }
                  items={[
                    { label: 'Aucune famille', value: 'NONE' },
                    ...familles.map((famille) => ({
                      value: String(famille.idFamille),
                      label: `${famille.code || ''}${
                        famille.code ? ' — ' : ''
                      }${famille.libelle || 'Famille sans libellé'}`,
                    })),
                  ]}
                />
              </Field>

              <Field label="État" required>
                <Select
                  value={form.idEtat}
                  onValueChange={(value: string) => updateField('idEtat', value)}
                  items={etats.map((etat) => ({
                    value: String(etat.idEtat),
                    label: etat.libelle || etat.code || `État ${etat.idEtat}`,
                  }))}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon={<Settings2 className="h-5 w-5" />}
            title="Classification technique"
            description="Classez le modèle par type d’équipement, fabricant et marque pour faciliter la recherche et l’exploitation."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Type d’équipement">
                <Select
                  value={form.idTypeEquipement}
                  onValueChange={(value: string) =>
                    updateField('idTypeEquipement', value)
                  }
                  items={[
                    { label: 'Aucun type', value: 'NONE' },
                    ...typesEquipement.map((type) => ({
                      value: String(type.idTypeEquipement),
                      label: `${type.code || ''}${type.code ? ' — ' : ''}${
                        type.libelle || 'Type sans libellé'
                      }`,
                    })),
                  ]}
                />
              </Field>

              <Field label="Fabricant">
                <Select
                  value={form.idFabricant}
                  onValueChange={handleFabricantChange}
                  items={[
                    { label: 'Aucun fabricant', value: 'NONE' },
                    ...fabricants.map((fabricant) => ({
                      value: String(fabricant.idFabricant),
                      label:
                        fabricant.nom ||
                        fabricant.code ||
                        `Fabricant ${fabricant.idFabricant}`,
                    })),
                  ]}
                />
              </Field>

              <Field label="Marque">
                <Select
                  value={form.idMarque}
                  onValueChange={(value: string) =>
                    updateField('idMarque', value)
                  }
                  items={[
                    { label: 'Aucune marque', value: 'NONE' },
                    ...filteredMarques.map((marque) => ({
                      value: String(marque.idMarque),
                      label:
                        marque.libelle ||
                        marque.code ||
                        `Marque ${marque.idMarque}`,
                    })),
                  ]}
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-[#d9edf3] bg-[#f2fbfd] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#06475a] shadow-sm">
                  <BadgeCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-[#06475a]">
                    Conseil GMAO
                  </p>

                  <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                    Le modèle sert à regrouper les caractéristiques communes de
                    plusieurs matériels. Un matériel créé avec ce modèle pourra
                    récupérer ces informations techniques.
                  </p>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={<CalendarClock className="h-5 w-5" />}
            title="Plans préventifs prédéfinis"
            description={
              isEditMode
                ? 'Sélectionnez parmi les plans préventifs prédéfinis déjà associés à ce modèle et définissez le plan principal.'
                : 'Les plans préventifs prédéfinis seront associés après la création du modèle.'
            }
          >
            {!isEditMode ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
                <p className="text-sm font-bold text-slate-500">
                  Les PPP seront disponibles après la création du modèle.
                </p>
              </div>
            ) : displayedPlansPreventifsPredefinis.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
                <p className="text-sm font-bold text-slate-500">
                  Aucun plan préventif prédéfini associé à ce modèle.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedPlansPreventifsPredefinis.map((ppp) => {
                  const id = String(ppp.idPlanPreventifPredefini);
                  const checked = form.pppIds.includes(id);
                  const principal = form.pppPrincipalId === id;

                  return (
                    <div
                      key={ppp.idPlanPreventifPredefini}
                      className={`rounded-2xl border px-5 py-4 transition ${
                        checked
                          ? 'border-[#0b3d4f]/30 bg-[#eef7fa]'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              handleTogglePpp(ppp.idPlanPreventifPredefini)
                            }
                            className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0b3d4f]"
                          />

                          <div>
                            <p className="text-sm font-black text-slate-950">
                              {ppp.code ||
                                `PPP-${ppp.idPlanPreventifPredefini}`}
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-500">
                              {ppp.libelle ||
                                'Plan préventif prédéfini sans libellé'}
                            </p>

                            {ppp.description && (
                              <p className="mt-2 text-xs font-medium leading-5 text-slate-400">
                                {ppp.description}
                              </p>
                            )}
                          </div>
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            handlePrincipalPpp(ppp.idPlanPreventifPredefini)
                          }
                          disabled={!checked}
                          className={`inline-flex h-9 items-center justify-center rounded-xl px-4 text-xs font-black transition ${
                            principal
                              ? 'bg-[#0b3d4f] text-white'
                              : checked
                                ? 'bg-white text-[#0b3d4f] ring-1 ring-[#0b3d4f]/20 hover:bg-[#0b3d4f] hover:text-white'
                                : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {principal ? 'Principal' : 'Définir principal'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isEditMode && form.pppIds.length > 0 && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                <p className="text-sm font-bold text-blue-700">
                  {form.pppIds.length} plan(s) préventif(s) prédéfini(s)
                  sélectionné(s).
                </p>

                <p className="mt-1 text-sm font-medium text-blue-600">
                  Un seul PPP est marqué comme principal. Il sera proposé par
                  défaut lors de la création d’un matériel basé sur ce modèle.
                </p>
              </div>
            )}
          </FormSection>

          <FormSection
            icon={<Landmark className="h-5 w-5" />}
            title="Renouvellement et budget"
            description="Ces données aident à anticiper le remplacement des équipements et à préparer les budgets de maintenance."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Durée de vie estimée">
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={form.dureeVie}
                    onChange={(event) =>
                      updateField('dureeVie', event.target.value)
                    }
                    placeholder="Ex : 15"
                    className={`${inputClassName} pr-20`}
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ans
                  </span>
                </div>
              </Field>

              <Field label="Budget estimé">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.budget}
                    onChange={(event) =>
                      updateField('budget', event.target.value)
                    }
                    placeholder="Ex : 2500000"
                    className={`${inputClassName} pr-16`}
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    DA
                  </span>
                </div>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard
                icon={<Factory className="h-5 w-5" />}
                title="Référentiel"
                value="Modèle commun"
              />

              <InfoCard
                icon={<Building2 className="h-5 w-5" />}
                title="Utilisation"
                value="Matériels similaires"
              />

              <InfoCard
                icon={<Landmark className="h-5 w-5" />}
                title="Pilotage"
                value="Budget prévisionnel"
              />
            </div>
          </FormSection>

          <FormSection
            icon={<FileText className="h-5 w-5" />}
            title="Commentaire maintenance"
            description="Ajoutez les remarques utiles pour l’équipe maintenance."
          >
            <Field label="Commentaire">
              <textarea
                value={form.commentaire}
                onChange={(event) =>
                  updateField('commentaire', event.target.value)
                }
                placeholder="Ex : Modèle utilisé pour les portiques gerbeurs du terminal."
                rows={4}
                className={textareaClassName}
              />
            </Field>
          </FormSection>

          <div className="sticky bottom-4 z-40 flex justify-end">
            <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-6 text-sm font-bold text-white transition hover:bg-[#043747] disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Enregistrement...' : submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#06475a]">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>

          {description && (
            <p className="mt-1 text-sm font-medium text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      {children}
    </label>
  );
}

function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'muted';
}) {
  return (
    <span
      className={[
        'inline-flex h-9 items-center rounded-xl px-4 text-sm font-bold',
        variant === 'success'
          ? 'bg-emerald-50 text-emerald-700'
          : variant === 'muted'
            ? 'bg-slate-100 text-slate-500'
            : 'bg-blue-50 text-blue-700',
      ].join(' ')}
    >
      {children}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#06475a] shadow-sm">
          {icon}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-sm font-extrabold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

const inputClassName =
  'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#06475a] focus:bg-white focus:ring-4 focus:ring-[#06475a]/10';

const textareaClassName =
  'w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#06475a] focus:bg-white focus:ring-4 focus:ring-[#06475a]/10';