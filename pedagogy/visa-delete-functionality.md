# Fonctionnalité de Suppression de Visa avec Confirmation

## Contexte

Cette modification ajoute la possibilité de supprimer des visas dans la page `/app/visas`, avec une confirmation avant suppression, suivant exactement le même pattern que la fonctionnalité existante pour les employeurs.

## Fichiers Créés/Modifiés

### Nouveaux Fichiers

1. **`src/features/visas/hooks/use-visas.tsx`** - Hook personnalisé pour la gestion des visas
2. **`src/features/visas/components/visa-card.tsx`** - Composant carte pour afficher un visa individuel
3. **`src/features/visas/components/visas-list.tsx`** - Composant liste pour afficher tous les visas

### Fichiers Modifiés

1. **`src/app/routes\app\visas.tsx`** - Route principale des visas

---

## Architecture et Patterns React

### 1. Custom Hook Pattern : `use-visas.tsx`

**Qu'est-ce qu'un Custom Hook ?**

Un Custom Hook est une fonction JavaScript qui commence par `use` et qui peut utiliser d'autres hooks React. C'est un pattern pour extraire et réutiliser de la logique stateful (avec état).

**Pourquoi créer `use-visas.tsx` ?**

```tsx
export function useVisas() {
  const { user } = useAuth()
  const [visas, setVisas] = useState<UserVisa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ... fonctions CRUD

  return {
    visas,
    loading,
    error,
    addVisa,
    updateVisa,
    deleteVisa,
    refetch: fetchVisas
  }
}
```

**Avantages de ce pattern :**

1. **Séparation des préoccupations** (Separation of Concerns)
   - La logique métier (CRUD sur les visas) est séparée de l'UI
   - Les composants se concentrent uniquement sur l'affichage

2. **Réutilisabilité**
   - Le hook peut être utilisé dans n'importe quel composant qui a besoin de gérer des visas
   - Pas de duplication de code

3. **Single Source of Truth**
   - L'état des visas est géré à un seul endroit
   - Toutes les opérations passent par ce hook

4. **Testabilité**
   - On peut tester la logique métier indépendamment des composants UI
   - Les tests sont plus simples et plus ciblés

**Pattern d'update optimiste (Optimistic Update) :**

```tsx
const deleteVisa = async (id: string) => {
  try {
    const { error } = await supabase
      .from('user_visas')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Update local state immediately (optimistic update)
    setVisas(prev => prev.filter(visa => visa.id !== id))
    toast.success('Visa deleted successfully')
    return { success: true }
  } catch (err) {
    // ...
  }
}
```

L'update optimiste met à jour l'UI **immédiatement** après l'opération Supabase, sans attendre une nouvelle requête. Cela améliore la perception de performance de l'application.

---

### 2. Composition de Composants : `visa-card.tsx`

**Structure du composant :**

```tsx
interface VisaCardProps {
  visa: UserVisa
  onDelete: (id: string) => void
  onEdit?: (visa: UserVisa) => void
}

export function VisaCard({ visa, onDelete, onEdit }: VisaCardProps) {
  // ...
}
```

**Pattern utilisé : Controlled Component avec Props Drilling**

Le composant `VisaCard` :
- Reçoit ses données via props (unidirectional data flow)
- Ne gère PAS son propre état de suppression
- Délègue les actions au parent via callbacks (`onDelete`, `onEdit`)

**Pourquoi ce pattern ?**

1. **Principe d'inversion de contrôle** (Inversion of Control)
   - Le parent contrôle le comportement
   - Le composant enfant est "dumb" (présentation pure)

2. **Réutilisabilité accrue**
   - Le composant peut être utilisé dans différents contextes
   - Le comportement est défini par le parent, pas par l'enfant

---

### 3. Dialog de Confirmation : AlertDialog de shadcn/ui

**Implémentation :**

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="sm">
      <Trash2 className="w-4 h-4" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Visa</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{visaLabels[visa.visa_type]}"?
        All associated work entries will remain, but visa tracking data will be lost.
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => onDelete(visa.id)}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Pattern : Compound Components**

Le composant `AlertDialog` utilise le pattern "Compound Components" :
- Plusieurs composants travaillent ensemble (`AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, etc.)
- Ils partagent un état implicite via React Context
- L'API est déclarative et intuitive

**Avantages :**

1. **Meilleure accessibilité (a11y)**
   - Gestion automatique du focus
   - Support clavier (Escape pour fermer)
   - Attributs ARIA automatiques

2. **UX cohérente**
   - Pattern de confirmation standard
   - Prévient les suppressions accidentelles

3. **Message clair pour l'utilisateur**
   - Avertissement explicite sur les conséquences
   - Options claires (Cancel / Delete)

---

### 4. Liste avec Gestion des États : `visas-list.tsx`

**Gestion des états de chargement/erreur :**

```tsx
export function VisasList({
  visas,
  loading,
  error,
  onEdit,
  onDelete,
}: VisasListProps) {
  if (loading) {
    return <div>Loading visas...</div>
  }

  if (error) {
    return <div className="text-destructive">Error: {error}</div>
  }

  return (
    <>
      {visas.length === 0 ? (
        <EmptyState />
      ) : (
        <VisaGrid />
      )}
    </>
  )
}
```

**Pattern : Early Return pour les États de Chargement**

Au lieu d'utiliser des conditions imbriquées complexes, on retourne directement pour chaque état :
1. État de chargement → Afficher le loader
2. État d'erreur → Afficher le message d'erreur
3. État vide → Afficher l'état vide (empty state)
4. État nominal → Afficher la liste

**Avantages :**

1. **Lisibilité**
   - Code linéaire, facile à suivre
   - Chaque état est clairement identifié

2. **Maintenabilité**
   - Ajouter un nouvel état est simple
   - Modifier un état n'affecte pas les autres

---

### 5. Lift State Up Pattern : `visas.tsx` (route)

**Architecture de la route :**

```tsx
export const VisasRoute = () => {
  const [isAddingVisa, setIsAddingVisa] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Single source of truth pour les données
  const { visas, loading, error, addVisa, deleteVisa } = useVisas()

  const handleAddVisa = async (data: CreateVisaFormData) => {
    setIsSubmitting(true)
    const result = await addVisa(data)
    setIsSubmitting(false)

    if (result.success) {
      setIsAddingVisa(false)
    }
  }

  const handleDeleteVisa = async (id: string) => {
    await deleteVisa(id)
  }

  return (
    <div>
      <VisasList
        visas={visas}
        loading={loading}
        error={error}
        onDelete={handleDeleteVisa}
      />
    </div>
  )
}
```

**Pattern : Lift State Up (Remonter l'État)**

Principe de React : l'état doit être "remontée" au composant parent le plus proche qui en a besoin.

**Pourquoi ce pattern ici ?**

1. **Orchestration centralisée**
   - La route orchestre tous les composants enfants
   - Les composants enfants communiquent via le parent

2. **Flux de données unidirectionnel**
   - Données : parent → enfant (via props)
   - Actions : enfant → parent (via callbacks)
   - React recommande ce pattern pour la prédictibilité

**Flow de suppression :**

```
User clicks Delete button (VisaCard)
  ↓
onDelete callback triggered
  ↓
handleDeleteVisa called (VisasRoute)
  ↓
deleteVisa from useVisas hook
  ↓
Supabase delete operation
  ↓
Local state updated (optimistic)
  ↓
UI re-renders automatically (React)
```

---

## Comparaison avec l'Implémentation Employeurs

Cette implémentation suit **exactement** le même pattern que `src/features/employers` :

| Aspect | Employers | Visas |
|--------|-----------|-------|
| Hook personnalisé | `use-employers.tsx` | `use-visas.tsx` |
| Composant carte | `employer-card.tsx` | `visa-card.tsx` |
| Composant liste | `employers-list.tsx` | `visas-list.tsx` |
| Dialog de confirmation | `AlertDialog` (shadcn/ui) | `AlertDialog` (shadcn/ui) |
| Update optimiste | ✅ | ✅ |
| Toast notifications | ✅ (sonner) | ✅ (sonner) |

**Avantages de cette cohérence :**

1. **Prédictibilité** : Les développeurs savent à quoi s'attendre
2. **Maintenabilité** : Même structure = maintenance plus facile
3. **Onboarding** : Nouveaux devs comprennent plus vite
4. **Bug reduction** : Patterns éprouvés = moins de bugs

---

## Principes React Appliqués

### 1. **Unidirectional Data Flow** (Flux de Données Unidirectionnel)

```
useVisas hook (source de vérité)
  ↓
VisasRoute (orchestration)
  ↓
VisasList (présentation)
  ↓
VisaCard (UI atomique)
```

Les données ne remontent JAMAIS directement. Les actions remontent via callbacks.

### 2. **Single Responsibility Principle** (Principe de Responsabilité Unique)

- `use-visas.tsx` : Gestion de l'état et logique métier
- `visas-list.tsx` : Gestion de la liste et des états globaux
- `visa-card.tsx` : Affichage d'une carte individuelle
- `visas.tsx` : Orchestration et routing

Chaque fichier a UNE responsabilité claire.

### 3. **Composition over Inheritance** (Composition plutôt qu'Héritage)

React favorise la composition :

```tsx
<VisasList>
  <VisaCard />
  <VisaCard />
  <VisaCard />
</VisasList>
```

Au lieu de créer une hiérarchie de classes complexe, on compose des composants simples.

---

## Points d'Attention pour le Développement Futur

### 1. Gestion du Contexte Visa

**Situation actuelle :**

Nous avons maintenant DEUX systèmes parallèles :
- `use-visa-context.tsx` : Contexte global pour la sélection de visa active
- `use-visas.tsx` : Hook local pour CRUD sur les visas

**Pourquoi cette séparation ?**

- Le contexte (`VisaContext`) est pour la **sélection** du visa actif (switching entre visas)
- Le hook (`useVisas`) est pour les **opérations CRUD** (ajouter/modifier/supprimer)

**Considération future :**

Si vous supprimez le visa actuellement sélectionné, vous devrez mettre à jour le contexte :

```tsx
const handleDeleteVisa = async (id: string) => {
  await deleteVisa(id)

  // Si le visa supprimé était le visa actif
  if (currentVisa?.id === id) {
    // Sélectionner un autre visa ou null
    const nextVisa = visas.find(v => v.id !== id)
    setCurrentVisa(nextVisa || null)
  }
}
```

### 2. Messages de Toast Personnalisés

Actuellement, les messages sont génériques ("Visa deleted successfully"). Pour améliorer l'UX :

```tsx
toast.success(`${visaLabels[visa.visa_type]} deleted successfully`)
```

### 3. Gestion des Erreurs Supabase

Le pattern actuel capture les erreurs mais pourrait être amélioré :

```tsx
catch (err) {
  if (err.code === 'PGRST116') {
    toast.error('Cannot delete visa: work entries still associated')
  } else {
    toast.error(err.message)
  }
}
```

---

## Pourquoi Suivre Bulletproof React ?

Cette implémentation suit **strictement** les principes de Bulletproof React :

1. **Feature-based architecture** : Tout le code visa est dans `src/features/visas/`
2. **Colocation** : Composants, hooks, et types sont ensemble
3. **Unidirectional code flow** : shared → features → app
4. **Type Safety** : TypeScript pour tous les types
5. **Performance patterns** : Optimistic updates, memoization potentielle

**Bénéfices concrets :**

- 🏗️ **Scalabilité** : Facile d'ajouter de nouvelles features
- 🔍 **Maintenabilité** : Code organisé et prévisible
- 🧪 **Testabilité** : Chaque partie peut être testée isolément
- 👥 **Collaboration** : Structure claire pour toute l'équipe

---

## Alternatives Considérées et Rejetées

### Alternative 1 : State Management Global (Redux/Zustand)

**Pourquoi rejeté :**

- Overkill pour cette feature
- Ajoute de la complexité inutile
- Le hook local suffit largement

**Quand l'utiliser :**

- Si les visas doivent être accessibles depuis de nombreux composants non-reliés
- Si la logique devient très complexe (50+ lignes)

### Alternative 2 : React Query / SWR

**Pourquoi rejeté pour l'instant :**

- Ajouterait une dépendance supplémentaire
- Le custom hook actuel fonctionne bien
- CLAUDE.md dit "no React Query/SWR initially"

**Quand l'utiliser :**

- Si vous avez besoin de cache sophistiqué
- Si vous voulez du polling automatique
- Si vous gérez beaucoup d'endpoints API

### Alternative 3 : Inline Handlers (pas de hook séparé)

**Pourquoi rejeté :**

```tsx
// ❌ Mauvais : Logique dans le composant
const VisasRoute = () => {
  const handleDelete = async (id) => {
    const { error } = await supabase.from('user_visas').delete().eq('id', id)
    // ...
  }
}
```

**Problèmes :**

- Viole le principe de Single Responsibility
- Impossible à réutiliser
- Difficile à tester
- Composant devient trop gros

---

## Checklist de Compréhension

Pour vérifier que tu as bien compris cette implémentation :

- [ ] Je peux expliquer ce qu'est un Custom Hook et pourquoi on l'utilise
- [ ] Je comprends le pattern "Lift State Up"
- [ ] Je sais pourquoi on utilise l'update optimiste
- [ ] Je comprends le pattern Compound Components (AlertDialog)
- [ ] Je peux expliquer le flux de données unidirectionnel
- [ ] Je sais pourquoi on sépare `use-visas.tsx` et `use-visa-context.tsx`
- [ ] Je comprends les avantages de suivre le pattern employeurs existant

---

## Ressources pour Approfondir

1. **React Documentation** : [Lifting State Up](https://react.dev/learn/sharing-state-between-components)
2. **Bulletproof React** : [Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
3. **Kent C. Dodds** : [Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react)
4. **shadcn/ui** : [Alert Dialog Component](https://ui.shadcn.com/docs/components/alert-dialog)

---

## Conclusion

Cette implémentation démontre comment construire une fonctionnalité React de qualité production :

✅ Architecture propre et scalable
✅ Séparation des préoccupations
✅ Réutilisabilité maximale
✅ Type-safety avec TypeScript
✅ UX excellente (confirmations, toasts, optimistic updates)
✅ Cohérence avec le reste du codebase
✅ Respect des principes Bulletproof React

En suivant ces patterns, tu construis un projet maintenable et professionnel pour ton portfolio. 🚀
