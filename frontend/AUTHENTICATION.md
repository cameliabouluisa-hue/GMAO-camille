# Système d'Authentification - GMAO BMT

Ce document décrit le système d'authentification frontend implémenté pour l'application GMAO BMT.

## Architecture

### Composants Clés

1. **Types** (`types/auth.ts`)
   - Définitions des rôles utilisateur (`UserRole`)
   - Énumération des permissions (`Permission`)
   - Interfaces utilisateur et contexte

2. **Constantes** (`constants/auth.ts`)
   - Mapping rôles → permissions
   - Comptes de test pour développement

3. **Service** (`services/auth.service.ts`)
   - Logique d'authentification (actuellement mock)
   - Gestion du stockage local
   - Interface pour futures migrations vers API réelle

4. **Contexte** (`context/AuthContext.tsx`)
   - Global state management avec React Context
   - Hook `useAuth()` pour accès facile

5. **Composants**
   - `ProtectedRoute`: Protection des pages nécessitant authentification
   - `Can`: Rendu conditionnel basé sur permissions/rôles
   - `LayoutWrapper`: Gestion de la mise en page selon état auth

6. **Pages**
   - `/auth/login`: Page de connexion avec comptes de test
   - `/unauthorized`: Page d'accès refusé

## Rôles et Permissions

### Rôles Disponibles

1. **ADMIN**
   - Accès complet à tous les modules
   - Gestion des utilisateurs et rôles
   - Configuration système

2. **RESPONSABLE_MAINTENANCE**
   - Gestion des demandes d'intervention
   - Suivi des interventions
   - Vue des équipements et stocks
   - Accès aux rapports

3. **TECHNICIEN**
   - Vue des équipements
   - Suivi et édition des interventions
   - Vue du stock

4. **DEMANDEUR**
   - Création de demandes d'intervention
   - Vue des équipements
   - Suivi des interventions

5. **MAGASINIER**
   - Gestion complète du stock
   - Entrées, sorties et inventaire

## Comptes de Test

Pour développement et test, 5 comptes de test sont disponibles:

| Email | Mot de passe | Rôle |
|-------|------------|------|
| admin@gmao.local | admin123 | ADMIN |
| responsable@gmao.local | resp123 | RESPONSABLE_MAINTENANCE |
| technicien@gmao.local | tech123 | TECHNICIEN |
| demandeur@gmao.local | dem123 | DEMANDEUR |
| magasinier@gmao.local | mag123 | MAGASINIER |

## Utilisation

### Hook useAuth()

```tsx
import { useAuth } from '@/context/AuthContext';

export function MyComponent() {
  const { user, isAuthenticated, login, logout, hasPermission, hasRole } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Bonjour {user?.fullName}</p>}
    </div>
  );
}
```

### Composant Can

```tsx
import { Can } from '@/components/Can';
import { Permission, UserRole } from '@/types/auth';

export function MySection() {
  return (
    <>
      {/* Par permission */}
      <Can permission={Permission.DELETE_MATERIAL}>
        <DeleteButton />
      </Can>

      {/* Par rôle unique */}
      <Can role={UserRole.ADMIN}>
        <AdminPanel />
      </Can>

      {/* Par multiples rôles */}
      <Can role={[UserRole.ADMIN, UserRole.RESPONSABLE_MAINTENANCE]}>
        <SupervisoryTools />
      </Can>

      {/* Avec fallback */}
      <Can 
        permission={Permission.CREATE_MATERIAL}
        fallback={<AccessDeniedMessage />}
      >
        <CreateMaterialForm />
      </Can>
    </>
  );
}
```

### Composant ProtectedRoute

```tsx
// Pour protéger une page entière
export default function StockPage() {
  return (
    <ProtectedRoute requiredRoles={[UserRole.MAGASINIER]}>
      {/* Contenu de la page */}
    </ProtectedRoute>
  );
}
```

## Flux d'Authentification

1. **Initialisation**
   - Au chargement de l'app, `AuthProvider` initialise l'authentification
   - Vérifie si un utilisateur est stocké en localStorage
   - Met à jour l'état global

2. **Login**
   - Utilisateur navigue vers `/auth/login`
   - Entre ses identifiants (ou clique sur compte de test)
   - Service authentifie et stocke utilisateur + token
   - Contexte met à jour l'état
   - Redirect vers page précédente ou `/`

3. **Protected Routes**
   - `LayoutWrapper` vérifie authentification
   - Pages non-auth redirigent vers `/auth/login` si non authentifié
   - Vérification des rôles redirige vers `/unauthorized`

4. **Logout**
   - Service efface localStorage
   - Contexte efface utilisateur
   - Redirection vers `/auth/login`

## Migration vers une Vraie API

Le système est conçu pour faciliter la migration vers une API réelle avec JWT.

### Étapes à suivre:

1. **Mettre à jour `AuthService.login()`**
   ```tsx
   // Avant: mock
   // Après: appel API réel
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     body: JSON.stringify({ email, password })
   });
   const data = await response.json();
   // Stocker token dans httpOnly cookie (plus sécurisé)
   ```

2. **Ajouter validation de token**
   ```tsx
   // Dans AuthService.initializeAuth()
   // Valider token avec backend
   // Refresh si expiré
   ```

3. **Ajouter logout API**
   ```tsx
   // Dans AuthService.logout()
   // Appel API pour invalider token côté serveur
   ```

4. **Sécuriser le stockage du token**
   - Remplacer localStorage par httpOnly cookies (côté serveur uniquement)
   - Ajouter CSRF protection

5. **Ajouter refresh token logic**
   - Implémenter refresh token endpoint
   - Auto-refresh avant expiration

## Structure de Fichiers Créés

```
frontend/
├── types/
│   └── auth.ts                    # Types et enums
├── constants/
│   └── auth.ts                    # Mapping rôles/permissions, comptes test
├── services/
│   └── auth.service.ts            # Logic d'authentification (mock)
├── context/
│   └── AuthContext.tsx            # Global state + useAuth hook
├── components/
│   ├── ProtectedRoute.tsx         # Protection des routes
│   ├── Can.tsx                    # Rendu conditionnel
│   ├── LayoutWrapper.tsx          # Gestion layout
│   └── sidebar.tsx                # MODIFIÉ - ajout logout et user info
├── app/
│   ├── layout.tsx                 # MODIFIÉ - ajout AuthProvider
│   ├── page.tsx                   # MODIFIÉ - ajout user info
│   ├── auth/
│   │   ├── layout.tsx             # Layout pour routes auth
│   │   └── login/
│   │       └── page.tsx           # Page de connexion
│   └── unauthorized/
│       └── page.tsx               # Page accès refusé
└── AUTHENTICATION.md              # Cette documentation
```

## Fichiers Modifiés

- `app/layout.tsx` - Ajout AuthProvider et LayoutWrapper
- `components/sidebar.tsx` - Ajout logout button et user info
- `app/page.tsx` - Affichage du nom utilisateur connecté

## Sécurité - Notes Importantes

⚠️ **MOCK Authentication Only** - Le système actuel est un mock pour développement

### Avant de passer en production:

- ✅ Implémenter vraie API JWT avec tokens sécurisés
- ✅ Utiliser httpOnly cookies pour tokens (pas localStorage)
- ✅ Implémenter CSRF protection
- ✅ Ajouter rate limiting sur endpoint login
- ✅ Valider tokens côté serveur avant chaque action
- ✅ Implémenter refresh token logic
- ✅ Ajouter session timeout
- ✅ Logs et monitoring d'authentification
- ✅ HTTPS obligatoire en production

## Tests

Pour tester rapidement avec différents rôles:

1. Allez à `/auth/login`
2. Cliquez sur le bouton de compte de test souhaité
3. Observez les permissions disponibles dans l'interface

## Support

Pour des questions ou améliorations, consultez le code et les commentaires inline.
