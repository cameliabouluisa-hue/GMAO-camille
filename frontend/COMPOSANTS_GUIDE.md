# Guide des Composants Réutilisables - GMAO BMT

## Vue d'ensemble

Ce guide explique comment utiliser les composants réutilisables créés pour harmoniser le design de l'application GMAO BMT.

## Composants Disponibles

### 1. PageHeader

En-tête de page professionnel avec titre, description et actions.

**Localisation :** `/components/page-header.tsx`

**Usage :**

```tsx
import { PageHeader } from '@/components/page-header';
import { Plus, RefreshCcw } from 'lucide-react';

export default function Page() {
  return (
    <PageHeader
      module="Module équipements"
      title="Matériels"
      description="Gérez votre parc d'équipements."
      actions={[
        {
          type: 'button',
          label: 'Actualiser',
          icon: <RefreshCcw size={18} />,
          onClick: () => console.log('refresh'),
          variant: 'secondary',
          loading: false,
        },
        {
          type: 'link',
          label: 'Nouveau',
          href: '/materiels/nouveau',
          icon: <Plus size={18} />,
          variant: 'primary',
        },
      ]}
    />
  );
}
```

**Props :**
- `module: string` - Catégorie du module
- `title: string` - Titre principal
- `description?: string` - Description optionnelle
- `actions?: Action[]` - Tableau d'actions (boutons ou liens)

---

### 2. KpiCard

Carte KPI moderne pour afficher des statistiques.

**Localisation :** `/components/kpi-card.tsx`

**Usage :**

```tsx
import { KpiCard } from '@/components/kpi-card';
import { Box } from 'lucide-react';

<KpiCard
  icon={<Box size={20} />}
  label="Équipements"
  value={248}
  tone="blue"
  subtitle="Total du parc"
/>
```

**Props :**
- `icon: ReactNode` - Icône lucide
- `label: string` - Libellé du KPI
- `value: ReactNode` - Valeur affichée
- `tone?: 'blue' | 'orange' | 'violet' | 'emerald' | 'red'` - Couleur (défaut: blue)
- `subtitle?: string` - Sous-texte optionnel

**Tones disponibles :**
- `blue` - Bleu clair (défaut)
- `orange` - Orange clair
- `violet` - Violet clair
- `emerald` - Vert clair
- `red` - Rouge clair

---

### 3. SectionCard

Carte blanche réutilisable pour les conteneurs.

**Localisation :** `/components/section-card.tsx`

**Usage :**

```tsx
import { SectionCard } from '@/components/section-card';

<SectionCard>
  <h2 className="font-bold">Contenu</h2>
  <p>Votre contenu ici...</p>
</SectionCard>
```

**Props :**
- `children: ReactNode` - Contenu de la carte
- `className?: string` - Classes Tailwind additionnelles

---

### 4. StatusBadge

Badge d'état avec plusieurs couleurs.

**Localisation :** `/components/status-badge.tsx`

**Usage :**

```tsx
import { StatusBadge } from '@/components/status-badge';

<StatusBadge tone="green" size="md">Actif</StatusBadge>
<StatusBadge tone="red" size="sm">Critique</StatusBadge>
```

**Props :**
- `children: ReactNode` - Texte du badge
- `tone?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'` - Couleur
- `size?: 'sm' | 'md' | 'lg'` - Taille

---

### 5. DataTableCard

Conteneur de table avec titre et sous-titre.

**Localisation :** `/components/data-table-card.tsx`

**Usage :**

```tsx
import { DataTableCard } from '@/components/data-table-card';

<DataTableCard
  title="Liste des matériels"
  subtitle="42 équipement(s) affiché(s)"
>
  <table>
    {/* Contenu de la table */}
  </table>
</DataTableCard>
```

**Props :**
- `title: string` - Titre de la table
- `subtitle?: string` - Sous-titre
- `children: ReactNode` - Contenu (table)
- `className?: string` - Classes additionnelles

---

### 6. SearchFilterBar

Barre de recherche avec filtres intégrés.

**Localisation :** `/components/search-filter-bar.tsx`

**Usage :**

```tsx
import { SearchFilterBar } from '@/components/search-filter-bar';
import { Select } from '@/components/select';

const [search, setSearch] = useState('');
const [status, setStatus] = useState('TOUS');

<SearchFilterBar
  searchValue={search}
  onSearchChange={setSearch}
  onReset={() => {
    setSearch('');
    setStatus('TOUS');
  }}
>
  <Select
    value={status}
    onValueChange={setStatus}
    items={[
      { label: 'Tous', value: 'TOUS' },
      { label: 'Actif', value: 'ACTIF' },
    ]}
  />
</SearchFilterBar>
```

**Props :**
- `searchValue: string` - Valeur de recherche
- `onSearchChange: (value: string) => void` - Callback de changement
- `onReset?: () => void` - Callback de réinitialisation
- `children?: ReactNode` - Filtres additionnels
- `className?: string` - Classes additionnelles

---

### 7. DetailHero

Hero section pour pages détail avec dégradé bleu pétrole.

**Localisation :** `/components/detail-hero.tsx`

**Usage :**

```tsx
import { DetailHero } from '@/components/detail-hero';
import { StatusBadge } from '@/components/status-badge';

<DetailHero
  title="Mohammed Saïdi"
  subtitle="mohammed.saidi@port.tn"
  status={<StatusBadge tone="green">Actif</StatusBadge>}
  metadata={[
    { label: 'Rôle', value: 'Administrateur' },
    { label: 'Créé le', value: '15/01/2024' },
  ]}
  actions={<button>Action</button>}
/>
```

**Props :**
- `title: string` - Titre principal
- `subtitle?: string` - Sous-titre
- `status?: ReactNode` - Badge de statut
- `metadata?: Array<{ label, value }>` - Métadonnées affichées
- `actions?: ReactNode` - Actions (boutons)

---

### 8. EmptyState

État vide standardisé pour les listes vides.

**Localisation :** `/components/empty-state.tsx`

**Usage :**

```tsx
import { EmptyState } from '@/components/empty-state';
import { Plus } from 'lucide-react';

<EmptyState
  icon={<Box className="h-8 w-8" />}
  title="Aucun élément"
  description="Créez un nouvel élément pour commencer."
  action={
    <Link href="/nouveau">
      <Plus size={18} />
      Créer
    </Link>
  }
/>
```

**Props :**
- `icon: ReactNode` - Icône
- `title: string` - Titre
- `description?: string` - Description
- `action?: ReactNode` - Bouton d'action

---

### 9. LoadingSpinner

Spinner de chargement standardisé.

**Localisation :** `/components/loading-spinner.tsx`

**Usage :**

```tsx
import { LoadingSpinner } from '@/components/loading-spinner';

<LoadingSpinner message="Chargement des données..." />
```

**Props :**
- `message?: string` - Message affiché (défaut: "Chargement...")

---

## Schéma de Couleurs

Les composants utilisent ces couleurs dans le design system :

```
Primaire (Bleu) :     #0b3d4f (boutons, accents)
Secondaire (Gris) :   #f5f7fb (fond)
Texte :              #0f3d56 (sidebar), #1a1a1a (texte)
Borders :            #e2e8f0 (bordures claires)
```

## Tonalités Disponibles

### Pour KpiCard :
- `blue` - Bleu clair
- `orange` - Orange clair
- `violet` - Violet clair
- `emerald` - Vert émeraude
- `red` - Rouge clair

### Pour StatusBadge :
- `blue` - Bleu
- `green` - Vert
- `orange` - Orange
- `red` - Rouge
- `purple` - Violet
- `gray` - Gris

## Bonnes Pratiques

1. **Cohérence :** Utilisez toujours les mêmes composants pour des éléments similaires
2. **Accessibilité :** Tous les composants supportent l'accessibilité (ARIA, sémantique)
3. **Responsivité :** Les composants sont mobile-first et responsive
4. **TypeScript :** Profitez des types TypeScript pour la sécurité
5. **Réutilisabilité :** Cherchez à utiliser les composants existants avant d'en créer de nouveaux

## Exemples de Pages Harmonisées

Consulter les pages suivantes pour des exemples complets :

- `/app/maintenance/interventions/page.tsx` - Liste avec filtres
- `/app/dashboards/equipements/page.tsx` - Dashboard KPI
- `/app/admin/utilisateurs/page.tsx` - Gestion d'entités
- `/app/admin/utilisateurs/[id]/page.tsx` - Détail avec hero

## Support

Pour ajouter de nouveaux composants ou modifier les existants, consultez le fichier `HARMONIZATION_PROGRESS.md`.
