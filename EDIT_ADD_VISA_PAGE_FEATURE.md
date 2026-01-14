# EDIT_ADD_VISA_PAGE - Feature Specification

## 1. Overview

### Objective
Migrer les formulaires de création et modification de visa depuis un Sheet (modal) vers des pages dédiées, suivant le pattern établi par la feature employers.

### Summary
- **Suppression**: Sheet/SheetContent pour les formulaires visa
- **Création**: Pages dédiées pour création (`/app/visas/new`) et édition (`/app/visas/:type/edit`)
- **Réutilisation**: Un seul composant `VisaForm` avec mode `add` | `edit`

### Tech Stack
- React 19.1.1 + TypeScript
- React Router 7.9.4
- TanStack React Query 5.90.5
- React Hook Form + Zod
- Shadcn UI + TailwindCSS 4.1.12

---

## 2. Context and Motivation

### Problème actuel
- Le formulaire de création/modification de visa utilise un Sheet (modal drawer)
- Incohérence avec le pattern employers qui utilise des pages dédiées
- UX moins intuitive pour un formulaire complexe

### Solution
- Pages dédiées pour création et édition
- Routes par type de visa (lisibles et significatives)
- Pattern cohérent avec le reste de l'application

### Routes finales
```
/app/visas                    → Liste des visas (existant, à modifier)
/app/visas/new                → Création d'un nouveau visa
/app/visas/first-whv/edit     → Édition du 1st WHV
/app/visas/second-whv/edit    → Édition du 2nd WHV
/app/visas/third-whv/edit     → Édition du 3rd WHV
```

---

## 3. Functional Specifications

### 3.1 Page de création (`/app/visas/new`)

**Comportement:**
1. Afficher le header avec titre "Add New Visa" et bouton retour
2. Afficher le formulaire `VisaForm` en mode `add`
3. Seuls les types de visa non-possédés sont sélectionnables
4. L'utilisateur sélectionne un type et une date d'arrivée
5. Au submit: création du visa, toast success, redirection vers `/app/visas`
6. En cas d'erreur: toast error, rester sur la page

**Validation:**
- `visa_type`: requis, enum (first_whv, second_whv, third_whv)
- `arrival_date`: requis, date valide

**UX:**
- Bouton "Cancel" → retour à `/app/visas`
- Bouton "Create Visa" → submit (disabled si formulaire invalide ou loading)
- Loading state: "Creating..."

### 3.2 Page d'édition (`/app/visas/:type/edit`)

**Comportement:**
1. Extraire le paramètre `:type` de l'URL (first-whv, second-whv, third-whv)
2. Convertir en visa_type DB (first_whv, second_whv, third_whv)
3. Charger le visa correspondant via `useGetVisaByType(type)`
4. Si loading: afficher skeleton
5. Si visa non trouvé: afficher message d'erreur avec lien retour
6. Afficher le formulaire `VisaForm` en mode `edit` avec données pré-remplies
7. Le type de visa est affiché en READ-ONLY
8. Seule la date d'arrivée est modifiable
9. Au submit: mise à jour du visa, toast success, redirection vers `/app/visas`

**Validation:**
- `arrival_date`: requis, date valide

**UX:**
- Bouton "Cancel" → retour à `/app/visas`
- Bouton "Save Changes" → submit (disabled si formulaire invalide ou loading)
- Loading state: "Saving..."

### 3.3 Page liste (modification)

**Suppression:**
- État `isAddingVisa` et sa gestion
- Import et utilisation de Sheet, SheetContent, SheetHeader, SheetTitle
- Composant AddVisaForm dans le Sheet

**Modification:**
- Bouton "Add Visa" navigue vers `/app/visas/new` au lieu d'ouvrir un Sheet
- VisaCard "Edit" navigue vers `/app/visas/{type}/edit`

### 3.4 Messages d'erreur

| Cas | Message |
|-----|---------|
| Création échouée | "Failed to create visa" |
| Mise à jour échouée | "Failed to update visa" |
| Visa non trouvé | "Visa not found" avec bouton "Back to Visas" |
| Erreur réseau | Message d'erreur générique |

### 3.5 Messages de succès

| Cas | Message |
|-----|---------|
| Création réussie | "Visa created successfully" |
| Mise à jour réussie | "Visa updated successfully" |

---

## 4. Technical Architecture

### 4.1 Fichiers existants à modifier

| Fichier | Modifications |
|---------|---------------|
| `src/config/paths.ts` | Ajouter paths pour edit par type |
| `src/app/router.tsx` | Ajouter routes new et :type/edit |
| `src/app/routes/app/visas.tsx` | Supprimer Sheet, modifier navigation |
| `src/features/visas/api/visas.ts` | Ajouter `getVisaByType()`, `updateVisa()` |
| `src/features/visas/api/use-visas.ts` | Ajouter `useGetVisaByType()`, `useUpdateVisa()` |
| `src/features/visas/components/visa-card.tsx` | Modifier onEdit pour naviguer |
| `src/features/visas/schemas/index.ts` | Ajouter `updateVisaSchema` |
| `src/lib/react-query.tsx` | Ajouter queryKey `visas.byType(type)` |

### 4.2 Fichiers à créer

| Fichier | Description |
|---------|-------------|
| `src/app/routes/app/visas/new.tsx` | Page création visa |
| `src/app/routes/app/visas/edit.tsx` | Page édition visa |
| `src/features/visas/components/visa-form.tsx` | Formulaire réutilisable |

### 4.3 Structure du composant VisaForm

```typescript
interface VisaFormProps {
  mode: 'add' | 'edit';
  visa?: UserVisa; // Requis si mode='edit'
  onSubmit: (data: CreateVisaFormData | UpdateVisaFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}
```

**Mode add:**
- Affiche grille de sélection du type de visa (comme AddVisaForm actuel)
- Affiche date picker pour arrival_date
- Boutons Cancel/Create

**Mode edit:**
- Affiche le type de visa en lecture seule (card désactivée ou texte)
- Affiche date picker pour arrival_date (pré-rempli)
- Boutons Cancel/Save

---

## 5. Database

### Aucune migration nécessaire

Le schéma actuel supporte déjà les opérations requises:

**Table `user_visas` - Colonnes modifiables:**
- `arrival_date` (DATE) - Seule colonne éditable par l'utilisateur

**Colonnes auto-calculées (non modifiables):**
- `expiry_date` - Calculé: arrival_date + 1 an - 1 jour
- `days_required` - Calculé selon visa_type via trigger
- `progress_percentage`, `is_eligible`, `days_remaining` - Calculés

**RLS Policies existantes:**
- ✅ SELECT: `auth.uid() = user_id`
- ✅ INSERT: `auth.uid() = user_id`
- ✅ UPDATE: `auth.uid() = user_id`
- ✅ DELETE: `auth.uid() = user_id`

---

## 6. Frontend Implementation

### Phase 1: Configuration (Paths & Router)

- [ ] **6.1.1** Modifier `src/config/paths.ts`
  - Ajouter `app.visas.edit` avec pattern `:type` et helper `getHref(type)`

- [ ] **6.1.2** Modifier `src/app/router.tsx`
  - Ajouter route enfant `new` sous visas
  - Ajouter route enfant `:type/edit` sous visas

- [ ] **6.1.3** Modifier `src/lib/react-query.tsx`
  - Ajouter `visas.byType: (type: string) => ['visas', 'type', type]`

### Phase 2: API Layer

- [ ] **6.2.1** Modifier `src/features/visas/api/visas.ts`
  - Ajouter fonction `getVisaByType(type: VisaType): Promise<UserVisa | null>`
  - Ajouter fonction `updateVisa(id: string, input: UpdateVisaInput): Promise<UserVisa>`

- [ ] **6.2.2** Modifier `src/features/visas/api/use-visas.ts`
  - Ajouter hook `useGetVisaByType(type: VisaType)` avec useQuery
  - Ajouter hook `useUpdateVisa()` avec useMutation et optimistic update

### Phase 3: Types & Schemas

- [ ] **6.3.1** Modifier `src/features/visas/types/index.ts`
  - Ajouter type `UpdateVisaInput = { arrival_date: string }`
  - Ajouter type `VisaTypeSlug = 'first-whv' | 'second-whv' | 'third-whv'`
  - Ajouter helpers `visaTypeToSlug()` et `slugToVisaType()`

- [ ] **6.3.2** Modifier `src/features/visas/schemas/index.ts`
  - Ajouter `updateVisaSchema` avec validation arrival_date
  - Ajouter type `UpdateVisaFormData`

### Phase 4: Form Component

- [ ] **6.4.1** Créer `src/features/visas/components/visa-form.tsx`
  - Migrer le code d'affichage des cards depuis AddVisaForm
  - Implémenter mode='add' avec sélection du type
  - Implémenter mode='edit' avec type en lecture seule
  - Gérer les états loading/error/validation

### Phase 5: Route Pages

- [ ] **6.5.1** Créer `src/app/routes/app/visas/new.tsx`
  - Importer VisaForm, useAddVisa
  - Header avec titre et bouton retour
  - Gérer submit avec navigation vers /app/visas

- [ ] **6.5.2** Créer `src/app/routes/app/visas/edit.tsx`
  - Extraire param :type, convertir en visa_type
  - Utiliser useGetVisaByType et useUpdateVisa
  - États: loading (skeleton), error, success
  - Header avec titre et bouton retour
  - Gérer submit avec navigation vers /app/visas

### Phase 6: Cleanup & Integration

- [ ] **6.6.1** Modifier `src/app/routes/app/visas.tsx`
  - Supprimer imports Sheet, SheetContent, SheetHeader, SheetTitle
  - Supprimer import AddVisaForm
  - Supprimer état `isAddingVisa`
  - Modifier bouton "Add Visa" pour naviguer vers `/app/visas/new`
  - Passer `onEdit` callback à VisasList (navigation)

- [ ] **6.6.2** Modifier `src/features/visas/components/visa-card.tsx`
  - Modifier le bouton Edit pour utiliser navigate au lieu de callback
  - Utiliser `paths.app.visas.edit.getHref(visaTypeToSlug(visa.visa_type))`

- [ ] **6.6.3** Supprimer `src/features/visas/components/add-visa-form.tsx`
  - Fichier obsolète après migration vers VisaForm

---

## 7. Execution Plan

### Phase 1: Configuration (Paths & Router)
- [ ] 6.1.1 - Modifier paths.ts
- [ ] 6.1.2 - Modifier router.tsx
- [ ] 6.1.3 - Modifier react-query.tsx

### Phase 2: API Layer
- [ ] 6.2.1 - Ajouter fonctions API (getVisaByType, updateVisa)
- [ ] 6.2.2 - Ajouter hooks React Query

### Phase 3: Types & Schemas
- [ ] 6.3.1 - Ajouter types
- [ ] 6.3.2 - Ajouter schemas

### Phase 4: Form Component
- [ ] 6.4.1 - Créer VisaForm

### Phase 5: Route Pages
- [ ] 6.5.1 - Créer page new.tsx
- [ ] 6.5.2 - Créer page edit.tsx

### Phase 6: Cleanup & Integration
- [ ] 6.6.1 - Modifier visas.tsx (supprimer Sheet)
- [ ] 6.6.2 - Modifier visa-card.tsx (navigation)
- [ ] 6.6.3 - Supprimer add-visa-form.tsx

---

## 8. Important Notes

### Compatibilité
- Le composant VisaForm réutilise la logique de `useAvailableVisas` pour filtrer les types disponibles
- Le pattern est aligné avec employers pour cohérence
- Les mutations existantes (`useAddVisa`, `useDeleteVisa`) restent inchangées

### Performance
- Les pages utilisent le lazy loading via React Router
- Les données sont cachées via React Query (staleTime: 5min)
- Optimistic updates pour une UX fluide

### Sécurité
- RLS policies existantes protègent les opérations
- Validation Zod côté client
- Pas de données sensibles exposées dans les URLs

### UX
- Navigation claire avec boutons retour
- États de chargement explicites
- Messages d'erreur informatifs
- Confirmation avant suppression (inchangé dans VisaCard)

---

## 9. Code Patterns Reference

### Pattern de page création (référence: employers/new.tsx)
```typescript
export function VisaNewRoute() {
  const navigate = useNavigate();
  const { mutateAsync: addVisa, isPending } = useAddVisa();

  const handleSubmit = async (data: CreateVisaFormData) => {
    await addVisa(data);
    navigate(paths.app.visas.getHref());
  };

  const handleCancel = () => navigate(paths.app.visas.getHref());

  return (
    <ContentLayout title="Add New Visa">
      <VisaForm
        mode="add"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
      />
    </ContentLayout>
  );
}
```

### Pattern de page édition (référence: employers/edit.tsx)
```typescript
export function VisaEditRoute() {
  const { type } = useParams<{ type: string }>();
  const visaType = slugToVisaType(type);
  const navigate = useNavigate();

  const { data: visa, isLoading, error } = useGetVisaByType(visaType);
  const { mutateAsync: updateVisa, isPending } = useUpdateVisa();

  // Loading state
  if (isLoading) return <VisaEditSkeleton />;

  // Error state
  if (error || !visa) return <VisaNotFound />;

  const handleSubmit = async (data: UpdateVisaFormData) => {
    await updateVisa({ id: visa.id, ...data });
    navigate(paths.app.visas.getHref());
  };

  return (
    <ContentLayout title={`Edit ${visaLabels[visa.visa_type]}`}>
      <VisaForm
        mode="edit"
        visa={visa}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.app.visas.getHref())}
        isSubmitting={isPending}
      />
    </ContentLayout>
  );
}
```

---

## Next Steps

Pour implémenter cette feature, exécuter:

**Frontend:**
```
/dev spec=EDIT_ADD_VISA_PAGE_FEATURE.md phase=1
```

Puis continuer phase par phase jusqu'à la phase 6.
