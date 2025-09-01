# Adaptation du Dialogue de Confirmation selon les Modes

## Contexte

Le dialogue de confirmation doit s'adapter selon le mode utilisé :
- **Mode ByDay** : Ajout/modification d'heures par jour individuellement
- **Mode ByWeek** : Gestion d'une semaine complète avec suppressions possibles

## Implémentation

### Détection du Mode

Le mode est déterminé par `pendingData.type` :
```typescript
pendingData?.type === 'week' ? 'texte mode semaine' : 'texte mode jour'
```

### Adaptations par Élément

#### 1. **Titre du Dialogue**

| Mode | Titre |
|------|-------|
| **ByDay** | "Update Hours?" |
| **ByWeek** | "Update Work Week?" |

```typescript
<AlertDialogTitle>
  {pendingData?.type === 'week' ? 'Update Work Week?' : 'Update Hours?'}
</AlertDialogTitle>
```

#### 2. **Description Contextuelle**

| Mode | Description |
|------|-------------|
| **ByDay** | "Work hours already exist for the following dates:" |
| **ByWeek** | "Work hours already exist for some dates in this week:" |

```typescript
<p>
  {pendingData?.type === 'week' 
    ? 'Work hours already exist for some dates in this week:' 
    : 'Work hours already exist for the following dates:'}
</p>
```

#### 3. **Question de Confirmation**

| Mode | Question |
|------|----------|
| **ByDay** | "Do you want to overwrite the existing hours?" |
| **ByWeek** | "Do you want to proceed with these changes?" |

```typescript
<p>
  {pendingData?.type === 'week'
    ? 'Do you want to proceed with these changes?'
    : 'Do you want to overwrite the existing hours?'}
</p>
```

#### 4. **Bouton d'Action**

| Mode | Texte du Bouton |
|------|----------------|
| **ByDay** | "Update" |
| **ByWeek** | "Update Week" |

```typescript
<AlertDialogAction>
  {pendingData?.type === 'week' ? 'Update Week' : 'Update'}
</AlertDialogAction>
```

## Exemples d'Affichage

### Mode ByDay
```
┌─────────────────────────────────────┐
│ Update Hours?                       │
├─────────────────────────────────────┤
│ Work hours already exist for the    │
│ following dates:                    │
│                                     │
│ • Sun, 31 Aug 2025                  │
│   24h → 8h                         │
│                                     │
│ Do you want to overwrite the        │
│ existing hours?                     │
├─────────────────────────────────────┤
│ [Cancel]              [Update]      │
└─────────────────────────────────────┘
```

### Mode ByWeek
```
┌─────────────────────────────────────┐
│ Update Work Week?                   │
├─────────────────────────────────────┤
│ Work hours already exist for some   │
│ dates in this week:                 │
│                                     │
│ • Mon, 1 Sep 2025                  │
│   8h → 10h                         │
│ • Wed, 3 Sep 2025                  │
│   6h    [DELETED]                  │
│                                     │
│ Do you want to proceed with these   │
│ changes?                            │
├─────────────────────────────────────┤
│ [Cancel]          [Update Week]     │
└─────────────────────────────────────┘
```

## Logique Métier par Mode

### Mode ByDay
- **Action** : Remplacement simple des entrées existantes
- **Contexte** : Dates spécifiques sélectionnées individuellement
- **Granularité** : Par jour, indépendamment
- **Ton** : Direct, focus sur l'écrasement des données

### Mode ByWeek  
- **Action** : Modifications complexes (ajouts + suppressions)
- **Contexte** : Semaine complète avec jours cochés/décochés
- **Granularité** : Semaine entière comme unité
- **Ton** : Plus global, focus sur les changements d'ensemble

## Avantages de cette Approche

### 1. **Clarté Contextuelle**
- L'utilisateur comprend immédiatement le scope des modifications
- Terminologie adaptée au mode d'utilisation

### 2. **Cohérence UX**
- Chaque mode conserve sa logique propre
- Pas de confusion entre ajout ponctuel et gestion hebdomadaire

### 3. **Facilité de Maintenance**
- Logique centralisée dans un seul dialogue
- Conditions simples basées sur `pendingData.type`

### 4. **Extensibilité**
- Facile d'ajouter de nouveaux modes (mensuel, etc.)
- Structure conditionnelle claire et extensible

## Pattern React Utilisé

### Conditional Rendering Pattern
```typescript
{condition ? 'texte mode A' : 'texte mode B'}
```

Cette approche utilise le **Conditional Rendering Pattern** de React pour adapter l'interface selon l'état de l'application, garantissant une UX cohérente et contextuelle.

## Tests Suggérés

### Tests Unitaires
1. **Vérifier les textes** selon `pendingData.type`
2. **Tester les conditions** avec différentes valeurs
3. **Valider la cohérence** des messages

### Tests E2E
1. **Scénario ByDay** : Vérifier textes et workflow complet
2. **Scénario ByWeek** : Vérifier textes avec suppressions
3. **Transition entre modes** : S'assurer de la cohérence

Cette implémentation démontre une attention aux détails UX et une approche professionnelle de gestion des interfaces contextuelles.