# Amélioration UX : Mise en évidence des semaines dans le calendrier hebdomadaire

**Fichier modifié :** `src/features/hours/components/calendar-with-hours.tsx`
**Date :** 2025-10-22
**Contexte :** Amélioration de l'interface utilisateur du formulaire "Weekly Hours Entry"

---

## 🎯 Objectif de la modification

Améliorer l'expérience utilisateur lors de la sélection d'une semaine dans le formulaire "Weekly Hours Entry" en ajoutant deux types de mise en évidence visuelle :

1. **Hover effect** : Quand l'utilisateur survole une date, toute la semaine (lundi à dimanche) est mise en avant avec un background clair
2. **Semaine sélectionnée** : Quand une date est déjà sélectionnée et que le calendrier s'ouvre, la semaine entière est mise en avant avec un background plus foncé

---

## 🧠 Concepts React utilisés

### 1. **React State avec `useState`**

```javascript
const [hoveredWeekDate, setHoveredWeekDate] = React.useState<Date | null>(null);
```

**Pourquoi ?**
- Nous avons besoin de tracker quelle semaine l'utilisateur survole actuellement
- Le state `hoveredWeekDate` stocke la date actuellement survolée (ou `null` si aucune)
- Quand ce state change, React déclenche un re-render pour mettre à jour l'UI

**Alternative considérée :**
❌ Utiliser CSS `:hover` uniquement → Ne permet pas de mettre en évidence toute la semaine, seulement la date individuelle

---

### 2. **React Memoization avec `useMemo`**

```javascript
const selectedWeekDate = React.useMemo(() => {
  if (!selected) return null;
  if (selected instanceof Date) return selected;
  if (Array.isArray(selected) && selected.length > 0) return selected[0];
  return null;
}, [selected]);
```

**Pourquoi ?**
- La prop `selected` peut avoir différents types : `Date`, `Date[]`, ou `undefined` (selon le mode du calendrier)
- `useMemo` mémorise le résultat du calcul et ne le recalcule que si `selected` change
- Cela évite des calculs inutiles à chaque render et garantit la stabilité de la référence

**Concept clé :**
`useMemo` est une optimisation de performance. Sans lui, le calcul serait refait à chaque render, même si `selected` n'a pas changé.

---

### 3. **React Callback avec `useCallback`**

```javascript
const DayButtonWithHours = React.useCallback(
  (dayProps: DayProps) => (
    <CustomDayButton
      {...dayProps}
      hoursByDate={hoursByDate}
      hoveredWeekDate={hoveredWeekDate}
      setHoveredWeekDate={setHoveredWeekDate}
      selectedWeekDate={selectedWeekDate}
    />
  ),
  [hoursByDate, hoveredWeekDate, selectedWeekDate]
);
```

**Pourquoi ?**
- `useCallback` mémorise la fonction composant pour éviter de recréer une nouvelle fonction à chaque render
- Le composant `Calendar` de `react-day-picker` reçoit cette fonction comme prop
- Si on ne mémorise pas, `Calendar` pense qu'il reçoit une nouvelle prop à chaque render et re-render inutilement

**Dépendances :**
- La fonction est recréée UNIQUEMENT si `hoursByDate`, `hoveredWeekDate`, ou `selectedWeekDate` changent
- C'est une optimisation cruciale pour les performances avec des listes/calendriers

---

### 4. **Event Handlers : `onMouseEnter` et `onMouseLeave`**

```javascript
<button
  onMouseEnter={() => setHoveredWeekDate(day.date)}
  onMouseLeave={() => setHoveredWeekDate(null)}
>
```

**Pourquoi ?**
- **`onMouseEnter`** : Se déclenche quand la souris entre dans l'élément
- **`onMouseLeave`** : Se déclenche quand la souris quitte l'élément
- On met à jour le state avec la date courante au survol, et on reset à `null` quand on quitte

**Alternative considérée :**
❌ `onMouseOver`/`onMouseOut` → Ces événements se déclenchent aussi pour les enfants (bubbling), ce qui causerait des bugs

---

## 📅 Logique de calcul des semaines (date-fns)

### Fonction helper : `isSameWeek`

```javascript
function isSameWeek(date1: Date, date2: Date): boolean {
  const week1Start = startOfWeek(date1, { weekStartsOn: 1 });
  const week2Start = startOfWeek(date2, { weekStartsOn: 1 });
  return isSameDay(week1Start, week2Start);
}
```

**Explication ligne par ligne :**

1. **`startOfWeek(date, { weekStartsOn: 1 })`**
   - Trouve le lundi de la semaine contenant `date`
   - `weekStartsOn: 1` = la semaine commence le lundi (ISO 8601 standard)
   - Exemple : `startOfWeek(new Date('2025-10-23'), { weekStartsOn: 1 })` → `2025-10-20` (lundi)

2. **`isSameDay(week1Start, week2Start)`**
   - Vérifie si deux dates sont le même jour (ignore les heures/minutes/secondes)
   - Si les deux semaines commencent le même lundi → elles sont dans la même semaine

**Pourquoi cette approche ?**
✅ Fonctionne correctement même si les dates sont dans des mois différents
✅ Respecte la convention ISO 8601 (semaine commence le lundi)
✅ Simplifie la logique en comparant uniquement les lundis

---

## 🎨 Styling conditionnel avec Tailwind CSS

### Hiérarchie des styles appliqués

```javascript
className={cn(
  // Base styles...

  // Week highlighting - Selected week (darker background, higher priority)
  isInSelectedWeek && !modifiers.selected && "bg-primary/15 hover:bg-primary/20",

  // Week highlighting - Hovered week (lighter background)
  isInHoveredWeek && !isInSelectedWeek && !modifiers.selected && "bg-accent/50"
)}
```

**Pourquoi cette structure ?**

1. **`isInSelectedWeek && !modifiers.selected`**
   - Applique le style uniquement si la date est dans la semaine sélectionnée
   - MAIS pas si la date est elle-même sélectionnée (pour éviter le conflit avec `data-[selected-single=true]`)
   - Background : `bg-primary/15` = couleur primaire avec 15% d'opacité

2. **`isInHoveredWeek && !isInSelectedWeek && !modifiers.selected`**
   - Applique le style uniquement si la date est dans la semaine survolée
   - MAIS pas si c'est la semaine sélectionnée (priorité à la sélection)
   - MAIS pas si la date est elle-même sélectionnée
   - Background : `bg-accent/50` = couleur accent avec 50% d'opacité

**Hiérarchie visuelle (du plus foncé au plus clair) :**
1. 🟦 **Date sélectionnée** : `bg-primary` (100% opacité) - le plus visible
2. 🟨 **Semaine sélectionnée** : `bg-primary/15` (15% opacité) - visible mais subtil
3. 🟩 **Semaine survolée** : `bg-accent/50` (50% opacité) - plus clair que la sélection

---

## 🔄 Flux de données (Props drilling)

### Composant parent → enfant

```
CalendarWithHours (parent)
  ↓ state: hoveredWeekDate, selectedWeekDate
  ↓
CustomDayButton (enfant)
  ↓ reçoit: hoveredWeekDate, setHoveredWeekDate, selectedWeekDate
  ↓ calcule: isInHoveredWeek, isInSelectedWeek
  ↓ applique les styles conditionnels
```

**Pourquoi passer les props de cette manière ?**

1. **`hoveredWeekDate` & `setHoveredWeekDate`**
   - Le state est dans `CalendarWithHours` car il doit être partagé entre TOUS les boutons de date
   - Chaque `CustomDayButton` peut modifier ce state partagé via `setHoveredWeekDate`
   - Quand le state change, TOUS les boutons re-render et vérifient s'ils sont dans la semaine survolée

2. **`selectedWeekDate`**
   - Calculé une seule fois dans le parent avec `useMemo`
   - Passé en lecture seule aux enfants
   - Les enfants ne peuvent pas le modifier, ils le consultent uniquement

**Alternative considérée :**
❌ Utiliser Context API → Trop complexe pour ce cas simple de props drilling sur 1 niveau

---

## 🧪 Pourquoi cette solution ?

### ✅ Avantages

1. **Performance optimisée**
   - `useMemo` et `useCallback` évitent les re-renders inutiles
   - Le calendrier peut avoir 30-42 boutons, l'optimisation est cruciale

2. **Cohérence visuelle**
   - Les deux semaines (sélectionnée et survolée) sont toujours visibles simultanément
   - L'utilisateur voit clairement quelle semaine il va sélectionner avant de cliquer

3. **Accessibilité**
   - Les événements `onMouseEnter`/`onMouseLeave` fonctionnent correctement avec les lecteurs d'écran
   - Les couleurs ont un contraste suffisant pour être visibles

4. **Maintenabilité**
   - La logique des semaines est centralisée dans une fonction helper `isSameWeek`
   - Facile à modifier si on veut changer la convention (ex: semaine commence le dimanche)

---

### ❌ Alternatives considérées et rejetées

#### Alternative 1 : CSS pur avec `:hover`
```css
/* Ne fonctionne PAS pour notre cas */
.day:hover ~ .day-in-same-week {
  background: lightblue;
}
```
**Problème :** CSS ne peut pas détecter "toutes les dates de la même semaine" sans connaître la date réelle

#### Alternative 2 : State dans chaque `CustomDayButton`
```javascript
const [isHovered, setIsHovered] = useState(false);
```
**Problème :** Chaque bouton ne connaît que son propre état de hover, pas celui des autres boutons de la semaine

#### Alternative 3 : Recalculer la semaine à chaque render sans `useMemo`
```javascript
// Sans useMemo
const selectedWeekDate = extractSelectedDate(selected);
```
**Problème :** Calcul inutile à chaque render, perte de performance, référence instable

---

## 🎓 Leçons apprises

### 1. **Quand utiliser `useMemo` vs `useCallback` ?**

- **`useMemo`** : Pour mémoriser le RÉSULTAT d'un calcul coûteux
  ```javascript
  const value = useMemo(() => expensiveCalculation(), [deps]);
  ```

- **`useCallback`** : Pour mémoriser une FONCTION (éviter de recréer la fonction)
  ```javascript
  const callback = useCallback(() => doSomething(), [deps]);
  ```

**Règle simple :**
- `useMemo` → mémorise une VALEUR
- `useCallback` → mémorise une FONCTION

---

### 2. **Event Handlers : `onMouseEnter` vs `onMouseOver`**

| Event | Bubbling ? | Quand l'utiliser |
|-------|-----------|------------------|
| `onMouseEnter` | ❌ Non | Quand on veut détecter l'entrée sur l'élément uniquement |
| `onMouseOver` | ✅ Oui | Quand on veut détecter l'entrée sur l'élément ET ses enfants |

Dans notre cas : `onMouseEnter` est correct car on veut uniquement détecter le survol du bouton, pas de ses enfants (texte, badge heures).

---

### 3. **Styling conditionnel : Ordre des classes Tailwind**

```javascript
cn(
  "base-class",
  condition1 && "class-1",  // Priorité basse
  condition2 && "class-2"   // Priorité haute (appliquée en dernier)
)
```

**Important :** L'ordre des classes dans `cn()` détermine la priorité CSS.
→ Les classes ajoutées en dernier peuvent overwrite les précédentes si elles ciblent les mêmes propriétés.

---

## 🔮 Améliorations futures possibles

1. **Animation de transition**
   ```javascript
   className={cn(
     "transition-colors duration-150",
     isInHoveredWeek && "bg-accent/50"
   )}
   ```
   → Ajouter une transition douce lors du changement de background

2. **Support du touch (mobile)**
   ```javascript
   onTouchStart={() => setHoveredWeekDate(day.date)}
   ```
   → Adapter le hover pour les écrans tactiles

3. **Accessibilité améliorée**
   ```javascript
   aria-label={isInSelectedWeek ? "Date dans la semaine sélectionnée" : undefined}
   ```
   → Annoncer vocalement quand une date est dans la semaine sélectionnée

---

## 📚 Ressources utiles

- **date-fns documentation** : https://date-fns.org/
- **React hooks (useMemo, useCallback)** : https://react.dev/reference/react
- **react-day-picker** : https://daypicker.dev/
- **Tailwind CSS opacity utilities** : https://tailwindcss.com/docs/background-color#changing-the-opacity

---

## ✅ Résumé de la modification

**Avant :**
- ❌ Aucune indication visuelle de la semaine lors du hover
- ❌ Difficulté à identifier visuellement quelle semaine sera sélectionnée

**Après :**
- ✅ Hover sur une date → toute la semaine est mise en évidence (background clair)
- ✅ Semaine sélectionnée → mise en évidence permanente (background foncé)
- ✅ Les deux semaines peuvent être visibles simultanément
- ✅ Code optimisé avec `useMemo` et `useCallback`
- ✅ Logique de calcul des semaines centralisée et réutilisable

---

**🎯 Cette modification améliore significativement l'UX du calendrier en rendant la sélection de semaines plus intuitive et prévisible pour l'utilisateur.**
