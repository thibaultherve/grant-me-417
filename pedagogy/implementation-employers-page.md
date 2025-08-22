# Implémentation de la page Employers

## Vue d'ensemble

Cette implémentation crée la fonctionnalité complète de gestion des employeurs pour l'application Get Granted 417. Elle suit l'architecture Bulletproof React avec une structure feature-based et utilise les composants shadcn/ui pour l'interface.

## Décisions architecturales

### 1. Structure des dossiers (Feature-based)

```
src/features/employers/
├── components/      # Composants spécifiques aux employeurs
├── hooks/          # Hooks personnalisés
├── schemas/        # Schémas de validation Zod
└── types/          # Types TypeScript
```

Cette structure suit Bulletproof React qui préconise l'organisation par feature plutôt que par type de fichier. Cela améliore la modularité et facilite la maintenance.

### 2. Validation avec Zod

J'ai choisi Zod pour la validation car :
- **Type-safe** : Génération automatique des types TypeScript
- **Runtime validation** : Validation côté client avant l'envoi à Supabase
- **Messages d'erreur** : Personnalisation facile des messages
- **Intégration React Hook Form** : Compatible avec le resolver Zod

### 3. Gestion d'état

Pour cette feature, j'utilise :
- **useState local** : Pour l'état du formulaire et de la liste
- **useEffect** : Pour charger les données au montage
- **Pas de Context** : Car les données des employeurs ne sont pas partagées globalement

### 4. UI Mobile-First avec shadcn/ui

Utilisation de :
- **Sheet** : Pour le formulaire en bottom sheet (mobile-first)
- **Card** : Pour afficher la liste des employeurs
- **Form** : Composant React Hook Form intégré
- **Select** : Pour la sélection de l'industrie
- **Sonner** : Pour les notifications de succès/erreur

## Justifications des choix

### Pourquoi Sheet au lieu de Dialog ?

Le Sheet (drawer) offre une meilleure expérience mobile :
- S'ouvre depuis le bas (naturel sur mobile)
- Prend toute la largeur de l'écran
- Facilite la saisie avec le clavier mobile
- Pattern familier pour les utilisateurs mobiles

### Pourquoi pas de React Query ?

Comme spécifié dans CLAUDE.md :
- Commencer simple avec useState
- Éviter la complexité prématurée
- React Query sera ajouté plus tard si nécessaire

### Gestion des erreurs

Stratégie à 3 niveaux :
1. **Validation inline** : Via React Hook Form + Zod
2. **Toast Sonner** : Pour les succès/échecs d'API
3. **Try/catch** : Gestion robuste des erreurs Supabase

## Alternatives considérées

### Alternative 1 : Modal classique
- **Rejeté** car moins adapté au mobile
- Les modals centrent le contenu, difficile avec clavier mobile

### Alternative 2 : Page dédiée pour l'ajout
- **Rejeté** car casse le flux utilisateur
- Nécessite navigation supplémentaire
- Plus complexe pour une action simple

### Alternative 3 : Formulaire inline dans la liste
- **Rejeté** car prend trop de place sur mobile
- Difficile à gérer avec plusieurs champs

## Points d'apprentissage React

### 1. Controlled vs Uncontrolled Components

React Hook Form utilise des **uncontrolled components** par défaut :
- Meilleure performance (moins de re-renders)
- Gestion automatique de l'état du formulaire
- Utilisation de `register` pour connecter les inputs

### 2. Custom Hooks

Le hook `useEmployers` encapsule :
- La logique de fetch des données
- La gestion du loading state
- La logique d'ajout/suppression
- Principe de séparation des responsabilités

### 3. Effect Hook avec cleanup

```javascript
useEffect(() => {
  fetchEmployers()
  // Pas de cleanup nécessaire ici
  // Mais important de comprendre le concept
}, []) // Dépendances vides = exécution unique
```

### 4. Composition de composants

Utilisation de la composition pour :
- Séparer la logique (hooks) de la présentation (composants)
- Réutilisabilité des composants
- Testabilité améliorée

## Prochaines étapes

1. Tests unitaires avec Vitest
2. Ajout de l'édition/suppression
3. Pagination si beaucoup d'employeurs
4. Validation automatique industrie + postcode (futur)