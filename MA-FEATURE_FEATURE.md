# MA-FEATURE: Calendrier Mensuel des Heures

## 1. Overview

### Objectif

Créer un composant calendrier mensuel style Google Calendar pour visualiser les heures travaillées par employeur, par jour.

### Résumé

- Vue calendrier mensuel avec grandes cellules affichant les heures par employeur
- Navigation par mois/année via dropdown et flèches
- Composant custom avec CSS Grid + date-fns + style shadcn
- Section additionnelle dans la page `/hours`

### Stack Technique

- React 19.1.1
- TypeScript
- TailwindCSS 4.1.12
- @tanstack/react-query 5.90.5
- date-fns (déjà installé)
- Shadcn UI components

---

## 2. Context and Motivation

### Besoin utilisateur

Les utilisateurs de l'application GET GRANTED 417 ont besoin de visualiser rapidement leurs heures travaillées sur un mois complet pour suivre leur progression vers les 88 jours requis pour le visa WHV 417.

### Pourquoi un calendrier mensuel

- Vue d'ensemble immédiate des heures par jour
- Identification rapide des jours sans travail
- Meilleure planification des heures à venir

### Données existantes

- Table `work_entries` : stocke les heures par jour et employeur
- Table `employers` : informations employeur (nom, industrie)
- Vue `work_entries_with_employers` : jointure des deux tables

---

## 3. Functional Specifications

### 3.1 Affichage du calendrier

#### Grille mensuelle

- 7 colonnes : Lun, Mar, Mer, Jeu, Ven, Sam, Dim
- 5-6 lignes selon le mois
- Jours du mois précédent/suivant affichés en grisé (pour compléter la grille)

#### Cellule jour

- Numéro du jour en haut à gauche
- Liste des employeurs avec heures : `"NomEmployeur: Xh"`
- Si un employeur n'a pas d'heures ce jour → ne pas l'afficher
- Si aucun employeur n'a d'heures ce jour → cellule vide (juste le numéro)
- Afficher le total d'heures pour ce jour (mettre en avant)

#### Exemple de cellule

```
┌─────────────────┐
│ 15              │
│ GrainFlow: 8h   │
│ FarmCo: 4.5h    │
│                 │
│ Total: 12.5h    │
└─────────────────┘
```

### 3.2 Navigation

#### Dropdown Mois

- Liste des 12 mois en anglais
- Sélection change le mois affiché

#### Dropdown Année

- Années de 1926 à année courante
- Sélection change l'année affichée

#### Flèches de navigation

- Flèche gauche : mois précédent
- Flèche droite : mois suivant
- Pas de limite (peut naviguer dans le passé/futur)

### 3.3 Comportements

#### Interaction

- Lecture seule uniquement
- Pas de clic sur les cellules
- Pas de modal ou navigation

#### Chargement des données

- Charger les heures du mois affiché
- Recharger quand le mois/année change (a voir ce qui est le mieux avec tanstack query)
- Afficher un skeleton loader pendant le chargement (shadcn)

#### États

- **Loading** : Skeleton du calendrier
- **Empty** : Calendrier vide avec message "Aucune heure enregistrée ce mois"
- **Data** : Calendrier avec les heures affichées

---

## 4. Technical Architecture

### 4.1 Fichiers existants à modifier

| Fichier                                             | Modification                                   |
| --------------------------------------------------- | ---------------------------------------------- |
| [hours.ts](src/features/hours/api/hours.ts)         | Ajouter `getMonthHours()`                      |
| [use-hours.ts](src/features/hours/api/use-hours.ts) | Ajouter `useMonthHours()`                      |
| [index.ts](src/features/hours/types/index.ts)       | Ajouter types `MonthHoursData`, `DayHoursData` |
| [hours/index.tsx](src/pages/hours/index.tsx)        | Ajouter le composant MonthCalendar             |

### 4.2 Nouveaux fichiers à créer

```
src/features/hours/
├── components/
│   └── calendar/
│       ├── month-calendar.tsx        # Composant principal
│       ├── calendar-header.tsx       # Navigation mois/année
│       ├── calendar-day-cell.tsx     # Cellule jour avec heures
│       └── calendar-grid.tsx         # Grille CSS 7 colonnes
├── utils/
│   └── calendar-helpers.ts           # Helpers pour génération grille
```

### 4.3 Dépendances de composants

```
MonthCalendar
├── CalendarHeader
│   ├── Select (shadcn) - Mois
│   ├── Select (shadcn) - Année
│   ├── Button (shadcn) - Flèche gauche
│   └── Button (shadcn) - Flèche droite
└── CalendarGrid
    └── CalendarDayCell (×35-42)
        └── Liste employeurs + heures
```

---

## 5. Database

### Pas de migration nécessaire

Les tables existantes suffisent :

- `work_entries` : id, user_id, employer_id, work_date, hours
- `employers` : id, user_id, name, industry

### Query SQL pour récupérer les heures du mois

```sql
SELECT
  we.work_date,
  we.hours,
  e.name as employer_name
FROM work_entries we
JOIN employers e ON we.employer_id = e.id
WHERE we.user_id = $1
  AND we.work_date >= $2  -- Premier jour du mois
  AND we.work_date <= $3  -- Dernier jour du mois
ORDER BY we.work_date, e.name
```

---

## 6. Backend Implementation

> **Note**: Ce projet est frontend-only avec Supabase. Pas de backend Go.

---

## 7. Frontend Implementation

### Phase 1: Types & API

- [ ] **7.1** Ajouter types dans `src/features/hours/types/index.ts`

  ```typescript
  export interface DayHoursEntry {
    employerName: string;
    hours: number;
  }

  export interface MonthHoursData {
    [dateKey: string]: DayHoursEntry[]; // dateKey format: "YYYY-MM-DD"
  }
  ```

- [ ] **7.2** Ajouter `getMonthHours()` dans `src/features/hours/api/hours.ts`

  ```typescript
  export async function getMonthHours(
    year: number,
    month: number,
  ): Promise<MonthHoursData>;
  ```

- [ ] **7.3** Ajouter `useMonthHours()` dans `src/features/hours/api/use-hours.ts`
  ```typescript
  export function useMonthHours(year: number, month: number) {
    return useQuery({
      queryKey: ['hours', 'month', year, month],
      queryFn: () => getMonthHours(year, month),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  }
  ```

### Phase 2: Helpers

- [ ] **7.4** Créer `src/features/hours/utils/calendar-helpers.ts`
  - `getCalendarDays(year, month)` : Retourne tableau de 35-42 jours (incluant padding)
  - `isCurrentMonth(date, year, month)` : Vérifie si date dans le mois courant
  - `formatMonthYear(year, month)` : Formate "Janvier 2025"

### Phase 3: Composants UI

- [ ] **7.5** Créer `src/features/hours/components/calendar/calendar-day-cell.tsx`
  - Props: `date`, `hoursData`, `isCurrentMonth`
  - Affiche numéro du jour + liste employeurs:heures

- [ ] **7.6** Créer `src/features/hours/components/calendar/calendar-grid.tsx`
  - CSS Grid 7 colonnes
  - En-têtes jours de la semaine
  - Map des CalendarDayCell

- [ ] **7.7** Créer `src/features/hours/components/calendar/calendar-header.tsx`
  - Select mois (shadcn)
  - Select année (shadcn)
  - Boutons flèches (shadcn Button)

- [ ] **7.8** Créer `src/features/hours/components/calendar/month-calendar.tsx`
  - Composant principal assemblant Header + Grid
  - Gestion état mois/année courant
  - Appel useMonthHours

### Phase 4: Intégration

- [ ] **7.9** Intégrer MonthCalendar dans la page `/hours`
  - Ajouter comme section additionnelle
  - Respecter le layout existant

---

## 8. Execution Plan

### Phase 1: Types & API (7.1 - 7.3)

- [x] 7.1 Ajouter types MonthHoursData dans types/index.ts
- [x] 7.2 Créer getMonthHours() dans api/hours.ts
- [x] 7.3 Créer useMonthHours() dans api/use-hours.ts

### Phase 2: Helpers (7.4)

- [x] 7.4 Créer calendar-helpers.ts avec fonctions utilitaires

### Phase 3: Composants Calendar (7.5 - 7.8)

- [x] 7.5 Créer CalendarDayCell
- [x] 7.6 Créer CalendarGrid
- [x] 7.7 Créer CalendarHeader
- [x] 7.8 Créer MonthCalendar (assemblage)

### Phase 4: Intégration (7.9)

- [x] 7.9 Intégrer dans /hours

---

## 9. Important Notes

### Compatibilité

- Utiliser les composants Shadcn existants (Select, Button)
- Suivre les patterns de code existants dans `src/features/hours/`
- Réutiliser les helpers date-fns existants

### Performance

- React Query avec staleTime de 2 minutes pour éviter refetch excessifs
- Mémoriser les calculs de grille avec useMemo
- Éviter re-renders inutiles avec React.memo sur les cellules

### Accessibilité

- Aria-labels sur les boutons de navigation
- Rôle "grid" sur le calendrier
- Contraste suffisant pour les jours hors mois courant

### Responsive

- Sur mobile : possibilité de scroll horizontal si nécessaire
- Cellules plus petites avec heures abrégées
- Header stack vertical sur petit écran

### Styling

- Utiliser les variables CSS Tailwind existantes
- Bordures légères entre cellules
- Hover state discret sur les cellules avec heures
- Weekend avec fond légèrement différent (optionnel)

---

## 10. Files Reference

### Fichiers à consulter pendant l'implémentation

| Fichier                                                                         | Raison                     |
| ------------------------------------------------------------------------------- | -------------------------- |
| [calendar.tsx](src/components/ui/calendar.tsx)                                  | Pattern react-day-picker   |
| [date-helpers.ts](src/features/hours/utils/date-helpers.ts)                     | Helpers date-fns existants |
| [use-hours.ts](src/features/hours/api/use-hours.ts)                             | Pattern React Query        |
| [week-hours-grid.tsx](src/features/hours/components/inputs/week-hours-grid.tsx) | Pattern grille responsive  |

### Traductions à ajouter

```json
// frontend/messages/fr.json
{
  "hours": {
    "calendar": {
      "title": "Calendrier mensuel",
      "noHours": "Aucune heure enregistrée ce mois",
      "months": {
        "january": "Janvier",
        "february": "Février",
        ...
      }
    }
  }
}
```

---

## 11. Next Steps

Pour implémenter cette feature, exécuter :

```
/dev spec=MA-FEATURE_FEATURE.md phase=1
```

Phases recommandées :

1. **Phase 1** (7.1-7.3) : Types et API
2. **Phase 2** (7.4) : Helpers
3. **Phase 3** (7.5-7.8) : Composants
4. **Phase 4** (7.9) : Intégration
