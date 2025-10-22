# Pré-remplissage automatique des heures hebdomadaires

**Fichier modifié :** `src/features/hours/components/by-week-form.tsx`
**Date :** 2025-10-22
**Contexte :** Amélioration UX du formulaire "Weekly Hours Entry"

---

## 🎯 Objectif de la modification

Améliorer l'expérience utilisateur lors de la modification d'heures hebdomadaires existantes en pré-remplissant automatiquement le formulaire avec les données déjà enregistrées.

**Comportement avant :**
- L'utilisateur sélectionne une semaine qui contient déjà des heures
- Le formulaire reste vide avec les valeurs par défaut (39h, Lun-Ven)
- L'utilisateur doit re-saisir toutes les données manuellement

**Comportement après :**
- L'utilisateur sélectionne une semaine qui contient déjà des heures
- Le formulaire se pré-remplit automatiquement avec :
  - **Total Weekly Hours** : Somme des heures de la semaine
  - **Daily Breakdown** : Heures réelles pour chaque jour
  - **Days Included** : Cases cochées pour les jours avec heures
- L'utilisateur peut directement modifier les données existantes

---

## 🧠 Concepts React utilisés

### 1. **useCallback pour mémoriser une fonction**

```javascript
const getWeekHoursData = useCallback((weekDate: Date) => {
  const mondayDate = startOfWeek(weekDate, { weekStartsOn: 1 })
  const weekHours: { [day: string]: number } = {}
  let totalHours = 0

  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(mondayDate, i)
    const dateKey = format(dayDate, 'yyyy-MM-dd')
    const hours = hoursByDate[dateKey] || 0

    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    weekHours[dayNames[i]] = hours
    totalHours += hours
  }

  return { weekHours, totalHours }
}, [hoursByDate])
```

**Pourquoi useCallback ?**
- La fonction `getWeekHoursData` est utilisée dans le `useEffect`
- Sans `useCallback`, la fonction serait recréée à chaque render
- Cela causerait un re-render infini car `useEffect` dépend de cette fonction
- Avec `useCallback`, la fonction n'est recréée que si `hoursByDate` change

**Dépendances :**
- `[hoursByDate]` : La fonction dépend des heures existantes
- Quand `hoursByDate` change (nouvelles données du backend), la fonction est recréée

---

### 2. **useEffect pour réagir aux changements de semaine**

```javascript
useEffect(() => {
  if (!selectedWeekDate) return

  const { weekHours, totalHours } = getWeekHoursData(selectedWeekDate)

  // Only pre-fill if there are hours for this week
  if (totalHours > 0) {
    // Pre-fill logic...
  } else {
    // Reset to defaults...
  }
}, [selectedWeekDate, hoursByDate, getWeekHoursData])
```

**Pourquoi useEffect ?**
- Nous voulons déclencher le pré-remplissage quand l'utilisateur sélectionne une semaine
- `useEffect` écoute les changements de `selectedWeekDate`, `hoursByDate`, et `getWeekHoursData`
- Quand l'un de ces éléments change, l'effet se déclenche et met à jour le formulaire

**Dépendances expliquées :**
1. **`selectedWeekDate`** : Quand l'utilisateur sélectionne une nouvelle semaine
2. **`hoursByDate`** : Quand les données du backend changent (après une soumission par exemple)
3. **`getWeekHoursData`** : La fonction helper utilisée dans l'effet (requise par ESLint)

---

### 3. **Transformation de données : hoursByDate → weekHours**

```javascript
const mondayDate = startOfWeek(weekDate, { weekStartsOn: 1 })

for (let i = 0; i < 7; i++) {
  const dayDate = addDays(mondayDate, i)
  const dateKey = format(dayDate, 'yyyy-MM-dd')
  const hours = hoursByDate[dateKey] || 0

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  weekHours[dayNames[i]] = hours
  totalHours += hours
}
```

**Logique étape par étape :**

1. **Trouver le lundi de la semaine** :
   ```javascript
   const mondayDate = startOfWeek(weekDate, { weekStartsOn: 1 })
   ```
   - Même si l'utilisateur sélectionne un mercredi, on trouve le lundi associé
   - `{ weekStartsOn: 1 }` = semaine commence le lundi (ISO 8601)

2. **Itérer sur les 7 jours** :
   ```javascript
   for (let i = 0; i < 7; i++) {
     const dayDate = addDays(mondayDate, i)
   ```
   - i=0 → Lundi, i=1 → Mardi, ..., i=6 → Dimanche

3. **Récupérer les heures pour chaque jour** :
   ```javascript
   const dateKey = format(dayDate, 'yyyy-MM-dd')
   const hours = hoursByDate[dateKey] || 0
   ```
   - Format ISO 8601 : "2025-10-20"
   - Si aucune heure enregistrée pour ce jour → 0

4. **Associer au nom du jour** :
   ```javascript
   weekHours[dayNames[i]] = hours
   ```
   - Transforme : `{ "2025-10-20": 8.5 }` → `{ monday: 8.5 }`

---

### 4. **Mise à jour de plusieurs states en série**

```javascript
// Set total weekly hours
setTotalWeeklyHours(totalHours.toString())
setTotalDecimalHours(totalHours)

// Update days_included based on which days have hours
const newDaysIncluded: DaysIncluded = {
  monday: weekHours.monday > 0,
  tuesday: weekHours.tuesday > 0,
  // ...
}
setDaysIncluded(newDaysIncluded)

// Create daily entries with actual hours
setDailyEntries(newEntries)

// Switch to day mode
setIsInWeekMode(false)
```

**Pourquoi plusieurs setters ?**
- React batch automatiquement les mises à jour de state dans les event handlers
- Dans un `useEffect`, les mises à jour sont également batchées
- Un seul re-render se produit après toutes ces mises à jour

**Ordre important :**
1. **Total hours** → Affiche le total dans l'input
2. **Days included** → Coche/décoche les checkboxes
3. **Daily entries** → Affiche les heures par jour
4. **isInWeekMode = false** → Empêche le recalcul automatique

---

### 5. **Mode "Week" vs "Day"**

```javascript
setIsInWeekMode(false) // Switch to day mode so daily entries don't get recalculated
```

**Pourquoi deux modes ?**

**Mode "Week" (isInWeekMode = true) :**
- L'utilisateur entre un total d'heures (ex: 40h)
- Le système divise automatiquement par les jours sélectionnés
- Exemple : 40h ÷ 5 jours = 8h par jour

**Mode "Day" (isInWeekMode = false) :**
- Les heures quotidiennes sont fixes et ne changent pas
- Utilisé lors du pré-remplissage pour préserver les données existantes
- Évite de recalculer et écraser les vraies valeurs

**Logique existante (déjà présente) :**
```javascript
useEffect(() => {
  if (!selectedWeekDate || !totalDecimalHours || !isInWeekMode) return
  // Calcul automatique des heures par jour...
}, [selectedWeekDate, totalDecimalHours, daysIncluded, isInWeekMode])
```

**Grâce à `isInWeekMode = false` :**
- Ce `useEffect` ne se déclenche PAS quand on pré-remplit
- Les heures quotidiennes restent intactes (8.5h, 7.25h, etc.)

---

## 📊 Flux de données complet

```
1. User sélectionne une semaine dans le calendrier
   ↓
2. selectedWeekDate change → useEffect se déclenche
   ↓
3. getWeekHoursData(selectedWeekDate) est appelé
   ↓
4. Extraction des heures depuis hoursByDate
   ↓
5. Si totalHours > 0 → PRÉ-REMPLISSAGE
   ├─ setTotalWeeklyHours(totalHours)
   ├─ setDaysIncluded({ monday: true, tuesday: false, ... })
   ├─ setDailyEntries([...])
   └─ setIsInWeekMode(false)
   ↓
6. Si totalHours === 0 → VALEURS PAR DÉFAUT
   ├─ setTotalWeeklyHours('39')
   ├─ setDaysIncluded({ monday-friday: true, weekend: false })
   └─ setIsInWeekMode(true)
   ↓
7. Render du formulaire avec les nouvelles valeurs
```

---

## 🎨 Interface utilisateur résultante

### Scénario 1 : Semaine avec données existantes

**Données backend :**
```javascript
hoursByDate = {
  '2025-10-20': 8.5,  // Lundi
  '2025-10-21': 7.25, // Mardi
  '2025-10-22': 8.0,  // Mercredi
  '2025-10-23': 9.0,  // Jeudi
  '2025-10-24': 6.5   // Vendredi
}
```

**Formulaire pré-rempli :**
- **Total Weekly Hours** : `39.25`
- **Days Included** :
  - ✅ Monday (8.5h)
  - ✅ Tuesday (7.25h)
  - ✅ Wednesday (8.0h)
  - ✅ Thursday (9.0h)
  - ✅ Friday (6.5h)
  - ❌ Saturday (0h)
  - ❌ Sunday (0h)

### Scénario 2 : Semaine sans données

**Données backend :**
```javascript
hoursByDate = {} // Aucune heure pour cette semaine
```

**Formulaire par défaut :**
- **Total Weekly Hours** : `39`
- **Days Included** :
  - ✅ Monday - Friday (calculé automatiquement à 7.8h/jour)
  - ❌ Saturday - Sunday

---

## 🧪 Cas d'usage pratiques

### Cas 1 : Modification d'une semaine existante

**Problème initial :**
1. User a enregistré une semaine avec 40h (8h × 5 jours)
2. User veut corriger une erreur : Vendredi était 6h au lieu de 8h
3. User ouvre le formulaire → tout est vide
4. User doit re-saisir toutes les données manuellement

**Solution avec pré-remplissage :**
1. User sélectionne la semaine
2. Formulaire se pré-remplit avec 40h et 8h par jour
3. User modifie uniquement Vendredi : 8h → 6h
4. Total automatiquement recalculé : 40h → 38h

### Cas 2 : Visualisation rapide

**Problème initial :**
1. User veut voir combien d'heures il a travaillé la semaine du 14 octobre
2. User doit aller dans le dashboard ou la liste des heures

**Solution avec pré-remplissage :**
1. User ouvre le formulaire "By Week"
2. Sélectionne la semaine du 14 octobre
3. Voit instantanément le total et le détail quotidien
4. Peut fermer sans sauvegarder (juste pour consulter)

---

## 🔮 Améliorations futures possibles

### 1. **Indicateur visuel de pré-remplissage**

```javascript
const [isPrefilled, setIsPrefilled] = useState(false)

// Dans useEffect
if (totalHours > 0) {
  setIsPrefilled(true)
  // ...
}

// Dans le JSX
{isPrefilled && (
  <Badge variant="secondary">
    Pre-filled with existing data
  </Badge>
)}
```

### 2. **Animation de transition**

```javascript
// Ajouter une animation CSS quand les valeurs changent
<Input
  className={cn(
    "transition-all duration-300",
    isPrefilled && "bg-blue-50 border-blue-300"
  )}
/>
```

### 3. **Gestion des modifications partielles**

```javascript
// Détecter si l'utilisateur modifie les valeurs pré-remplies
const [hasModifications, setHasModifications] = useState(false)

// Afficher un warning si l'utilisateur quitte sans sauvegarder
{hasModifications && (
  <AlertDialog>
    <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
    <AlertDialogDescription>
      You have unsaved modifications. Are you sure you want to leave?
    </AlertDialogDescription>
  </AlertDialog>
)}
```

---

## 🐛 Pièges évités

### Piège 1 : Re-render infini

**Problème potentiel :**
```javascript
// ❌ MAUVAIS
const getWeekHoursData = (weekDate: Date) => { ... }

useEffect(() => {
  getWeekHoursData(selectedWeekDate)
}, [selectedWeekDate, getWeekHoursData])
// Problème : getWeekHoursData est recréé à chaque render
// → useEffect se déclenche infiniment
```

**Solution :**
```javascript
// ✅ BON
const getWeekHoursData = useCallback((weekDate: Date) => { ... }, [hoursByDate])

useEffect(() => {
  getWeekHoursData(selectedWeekDate)
}, [selectedWeekDate, getWeekHoursData])
// getWeekHoursData est stable grâce à useCallback
```

### Piège 2 : Écrasement des données utilisateur

**Problème potentiel :**
```javascript
// ❌ MAUVAIS
useEffect(() => {
  // Toujours calculer automatiquement
  const hoursPerDay = totalHours / selectedDays
  setDailyEntries(...)
}, [totalHours, selectedDays])
// Problème : Écrase les données pré-remplies
```

**Solution :**
```javascript
// ✅ BON
useEffect(() => {
  if (!isInWeekMode) return // Ne pas recalculer en mode "Day"
  const hoursPerDay = totalHours / selectedDays
  setDailyEntries(...)
}, [totalHours, selectedDays, isInWeekMode])
```

### Piège 3 : Dépendances manquantes

**Problème potentiel :**
```javascript
// ❌ MAUVAIS (ESLint warning)
useEffect(() => {
  getWeekHoursData(selectedWeekDate)
}, [selectedWeekDate, hoursByDate])
// Manque getWeekHoursData dans les dépendances
```

**Solution :**
```javascript
// ✅ BON
useEffect(() => {
  getWeekHoursData(selectedWeekDate)
}, [selectedWeekDate, hoursByDate, getWeekHoursData])
```

---

## 📚 Ressources utiles

- **React useCallback** : https://react.dev/reference/react/useCallback
- **React useEffect** : https://react.dev/reference/react/useEffect
- **date-fns startOfWeek** : https://date-fns.org/docs/startOfWeek
- **ESLint exhaustive-deps** : https://github.com/facebook/react/issues/14920

---

## ✅ Résumé de la modification

**Avant :**
- ❌ Formulaire toujours vide pour les semaines existantes
- ❌ Re-saisie manuelle obligatoire
- ❌ Difficile de visualiser rapidement les heures d'une semaine

**Après :**
- ✅ Pré-remplissage automatique avec données existantes
- ✅ Modification rapide des valeurs pré-remplies
- ✅ Visualisation instantanée des heures hebdomadaires
- ✅ Meilleure UX avec moins de friction

**Impact technique :**
- Ajout de `useCallback` pour optimiser les performances
- Utilisation intelligente de `isInWeekMode` pour éviter les recalculs
- Gestion propre des dépendances React Hook
- Code maintenable et facile à étendre

---

**🎯 Cette modification améliore significativement l'UX en éliminant la re-saisie manuelle et en permettant une consultation rapide des données hebdomadaires existantes.**
