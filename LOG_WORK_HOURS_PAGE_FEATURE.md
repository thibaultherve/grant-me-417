# LOG_WORK_HOURS_PAGE Feature Specification

## 1. Overview

### Objective

Déplacer le formulaire de saisie des heures de travail depuis un Sheet modal vers une page dédiée `/app/hours/edit`.

### Summary

Actuellement, le formulaire de log hours est affiché dans un Sheet (modal latéral) depuis la page `/app/hours`. Cette feature consiste à créer une page dédiée `/app/hours/edit` qui contiendra ce même formulaire, offrant une meilleure expérience utilisateur avec plus d'espace et une navigation plus claire.

### Tech Stack

- React 19.1.1
- React Router 7.9.4
- TailwindCSS 4.1.12
- Shadcn UI
- @tanstack/react-query 5.90.5

---

## 2. Context and Motivation

### Situation Actuelle

- Le formulaire de log hours est dans un **Sheet modal** accessible depuis `/app/hours`
- Le bouton "Log Hours" ouvre ce Sheet sur le côté droit
- Le formulaire est en 2 étapes: Sélection d'employeur → Saisie des heures

### Problèmes

- Espace limité dans le Sheet modal
- Navigation moins intuitive (modal vs page)
- Difficile d'étendre avec de nouvelles fonctionnalités

### Solution

- Créer une page dédiée `/app/hours/edit`
- Renommer le bouton "Log Hours" en "Edit Hours"
- Le bouton navigue vers la nouvelle page au lieu d'ouvrir un Sheet
- Garder exactement le même comportement du formulaire

---

## 3. Functional Specifications

### User Flow

1. **Accès à la page**
   - Depuis `/app/hours`, l'utilisateur clique sur "Edit Hours"
   - Navigation vers `/app/hours/edit`

2. **Formulaire (comportement inchangé)**
   - Step 1: Sélection de l'employeur via dropdown
   - Step 2: Saisie des heures par semaine
     - Navigation entre semaines
     - Grille de 7 jours avec inputs
     - Option auto-distribute
     - Calcul du total

3. **Soumission**
   - Bouton "Save Hours" soumet le formulaire
   - Toast de confirmation affiché
   - Comportement actuel maintenu (le form reste ouvert pour saisir d'autres semaines)

4. **Annulation**
   - Bouton "Cancel" retourne à `/app/hours`

### Règles Métier (inchangées)

- Maximum 24h par jour
- Maximum 168h par semaine
- Semaine doit être complète (vendredi passé)
- Auto-distribute répartit les heures uniformément sur les jours sélectionnés

---

## 4. Technical Architecture

### Fichiers Existants à MODIFIER

| Fichier                        | Modification                                                 |
| ------------------------------ | ------------------------------------------------------------ |
| `src/app/router.tsx`           | Ajouter route enfant `/hours/edit`                           |
| `src/config/paths.ts`          | Ajouter `hours.edit` path config                             |
| `src/app/routes/app/hours.tsx` | Remplacer Sheet par lien vers `/hours/edit`, renommer bouton, ajouter breadcrumb |

### Composants UI à INSTALLER

| Composant | Commande |
| --------- | -------- |
| Breadcrumb | `npx shadcn@latest add breadcrumb` |

### Fichiers à CRÉER

| Fichier                             | Description                             |
| ----------------------------------- | --------------------------------------- |
| `src/app/routes/app/hours/edit.tsx` | Nouvelle page dédiée pour le formulaire avec breadcrumb |

### Fichiers à RÉUTILISER (sans modification)

| Fichier                                                    | Usage                |
| ---------------------------------------------------------- | -------------------- |
| `src/features/hours/components/add-hours-form.tsx`         | Wrapper 2 étapes     |
| `src/features/hours/components/week-hours-form.tsx`        | Formulaire principal |
| `src/features/hours/components/week-hours-grid.tsx`        | Grille 7 jours       |
| `src/features/hours/components/week-navigator.tsx`         | Navigation semaine   |
| `src/features/hours/components/employer-selector.tsx`      | Sélection employeur  |
| `src/features/hours/components/auto-distribute-toggle.tsx` | Distribution auto    |
| `src/features/hours/components/stepper.tsx`                | Indicateur d'étapes  |
| `src/features/hours/hooks/use-week-form-state.ts`          | State management     |
| `src/features/hours/api/use-hours.ts`                      | Hooks React Query    |

---

## 5. Database

**Aucune modification de base de données requise.**

Cette feature est purement frontend - réorganisation de l'UI sans impact sur les données.

---

## 6. Backend Implementation

**Aucune modification backend requise.**

Cette feature est purement frontend.

---

## 7. Frontend Implementation

### Phase 1: Configuration des Routes et Composants UI

#### 1.1 Installer le composant Breadcrumb Shadcn

```bash
npx shadcn@latest add breadcrumb
```

#### 1.2 Mise à jour de `src/config/paths.ts`

Ajouter la configuration du path pour la page edit:

```typescript
hours: {
  path: '/app/hours',
  getHref: () => '/app/hours',
  edit: {
    path: '/app/hours/edit',
    getHref: () => '/app/hours/edit',
  },
},
```

#### 1.3 Mise à jour de `src/app/router.tsx`

Ajouter la route enfant pour `/hours/edit`:

```typescript
{
  path: paths.app.hours.path,
  children: [
    {
      index: true,
      lazy: async () => {
        const { HoursRoute } = await import('./routes/app/hours');
        return { Component: HoursRoute };
      },
    },
    {
      path: 'edit',
      lazy: async () => {
        const { HoursEditRoute } = await import('./routes/app/hours/edit');
        return { Component: HoursEditRoute };
      },
    },
  ],
},
```

### Phase 2: Création de la Page Edit

#### 2.1 Créer `src/app/routes/app/hours/edit.tsx`

Structure de la page avec breadcrumb:

```typescript
// Imports nécessaires
import { Link, useNavigate } from 'react-router';
import { AddHoursForm } from '@/features/hours/components/add-hours-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { paths } from '@/config/paths';

export function HoursEditRoute() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(paths.app.hours.getHref());
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={paths.app.hours.getHref()}>Work Hours</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Hours</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <h1 className="text-2xl font-bold">Edit Hours</h1>

      {/* Formulaire dans une Card */}
      <Card>
        <CardHeader>
          <CardTitle>Log your work hours</CardTitle>
        </CardHeader>
        <CardContent>
          <AddHoursForm onClose={handleBack} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Phase 3: Mise à jour de la Page Hours

#### 3.1 Modifier `src/app/routes/app/hours.tsx`

Changements à effectuer:

1. Ajouter un breadcrumb en haut de la page
2. Supprimer l'état `isAddingHours` et le Sheet
3. Remplacer le bouton par un Link ou navigate
4. Renommer "Log Hours" en "Edit Hours"

**Ajouter le breadcrumb:**

```typescript
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

// Dans le JSX, en haut de la page
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbPage>Work Hours</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

**Remplacer le bouton:**

```typescript
// Avant
<Button onClick={() => setIsAddingHours(true)}>
  <Plus className="mr-2 h-4 w-4" /> Log Hours
</Button>

// Après
<Button asChild>
  <Link to={paths.app.hours.edit.getHref()}>
    <Plus className="mr-2 h-4 w-4" /> Edit Hours
  </Link>
</Button>
```

**Supprimer:**

- `const [isAddingHours, setIsAddingHours] = useState(false);`
- Le composant `<Sheet>` complet avec son contenu
- Les imports liés au Sheet (Sheet, SheetContent, SheetHeader, etc.)

---

## 8. Execution Plan

### Phase 1: Configuration des Routes et Composants UI

- [x] 1.1 Installer le composant Breadcrumb: `npx shadcn@latest add breadcrumb`
- [x] 1.2 Mettre à jour `src/config/paths.ts` - ajouter `hours.edit`
- [x] 1.3 Mettre à jour `src/app/router.tsx` - ajouter route `/hours/edit`

### Phase 2: Création de la Page Edit

- [x] 2.1 Créer `src/app/routes/app/hours/edit.tsx` avec:
  - [x] Breadcrumb (Work Hours > Edit Hours)
  - [x] Formulaire AddHoursForm

### Phase 3: Mise à jour de la Page Hours

- [x] 3.1 Modifier `src/app/routes/app/hours.tsx`:
  - [x] Ajouter breadcrumb (Work Hours)
  - [x] Supprimer état `isAddingHours`
  - [x] Supprimer le composant Sheet et ses imports
  - [x] Remplacer bouton par Link vers `/hours/edit`
  - [x] Renommer "Log Hours" en "Edit Hours"

### Phase 4: Tests et Validation

- [x] 4.1 Tester la navigation vers `/app/hours/edit`
- [x] 4.2 Tester le breadcrumb sur `/app/hours` (non-cliquable, page courante)
- [x] 4.3 Tester le breadcrumb sur `/app/hours/edit` (Work Hours cliquable, Edit Hours courante)
- [x] 4.4 Tester le formulaire complet (2 étapes)
- [x] 4.5 Tester la soumission et le retour
- [x] 4.6 Tester le bouton Cancel
- [x] 4.7 Vérifier que le build passe

---

## 9. Important Notes

### Compatibilité

- Le formulaire `AddHoursForm` est réutilisé tel quel
- Aucune modification des hooks ou de la logique métier
- Les types et API restent identiques

### Performance

- Lazy loading de la nouvelle route (code splitting maintenu)
- Pas d'impact sur les performances existantes

### Sécurité

- Route protégée par `ProtectedAppRoot` (existant)
- Pas de nouvelles permissions requises

### UX Considerations

- **Breadcrumbs** pour navigation claire:
  - `/app/hours`: "Work Hours" (page courante, non-cliquable)
  - `/app/hours/edit`: "Work Hours > Edit Hours" (Work Hours cliquable pour retour)
- Formulaire dans une Card pour meilleure lisibilité
- Plus d'espace pour le formulaire vs le Sheet modal

### Points d'Attention

- S'assurer que `onClose` dans `AddHoursForm` accepte un callback de navigation
- Vérifier le comportement responsive de la nouvelle page
- Le comportement post-soumission reste identique (form reste ouvert pour saisir d'autres semaines)
