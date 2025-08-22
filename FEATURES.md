# Get Granted 417 - Spécifications Fonctionnelles

## Vue d'ensemble de l'application

Get Granted 417 est une application de suivi des heures de "specified work" pour les détenteurs de Working Holiday Visa 417 en Australie. L'application aide les backpackers à calculer et suivre leur progression vers l'éligibilité pour leur 2e ou 3e visa.

## Architecture de navigation

**Migration** : `/dashboard` → `/app`

**5 onglets principaux** avec navigation mobile-first (bottom tabs) :
- **Overview** (`/app/overview`) - Vue d'ensemble et progression
- **Add Hours** (`/app/add-hours`) - Ajout d'heures de travail
- **Employers** (`/app/employers`) - Gestion des employeurs
- **Visas** (`/app/visas`) - Gestion des visas multiples
- **Profile** (`/app/profile`) - Paramètres utilisateur

## Spécifications détaillées par onglet

### 1. Overview (`/app/overview`)

**Fonctionnalités principales** :
- **Sélecteur de visa** (dropdown en haut à gauche)
  - Format : "2nd WHV (Current)" avec icône check
  - Permet de switcher entre tous les visas de l'utilisateur
  - Affiché même avec un seul visa
  
- **Graphiques de progression** (2 graphiques principaux) :
  1. **Jours spécifiques** : Barre de progression classique
     - Format : X/88 jours (2e visa) ou X/179 jours (3e visa)
     - Pourcentage affiché
  2. **Durée du visa** : Barre de progression classique
     - Format : X/365 jours depuis l'arrivée
     - Conversion en jours depuis le début du visa

- **Statut d'éligibilité** :
  - Indication claire si l'objectif est atteint
  - Notification de succès quand l'utilisateur atteint son objectif

### 2. Add Hours (`/app/add-hours`)

**Modes de saisie** (2 options dans le formulaire) :

**Mode 1 : Par jour**
- Sélection de dates via calendrier
- Ajout de plusieurs dates avant soumission
- Saisie des heures pour chaque date
- L'utilisateur peut accumuler plusieurs entrées avant validation

**Mode 2 : Par semaine**
- Sélection d'une semaine de l'année
- Saisie du total d'heures pour la semaine
- **Traitement** : Création de 7 entrées automatiques (heures/7 par jour)
- Exemple : 35h/semaine → 7 entrées de 5h chacune

**Validation en temps réel** :
- Maximum 24h par jour (Zod)
- Vérification des données avant envoi
- Messages d'erreur instantanés

**Feedback utilisateur** :
- Messages de succès via Sonner (shadcn/ui)
- Confirmation après ajout réussi

**Interface** :
- Formulaire en bottom sheet (mobile-first)
- Actions via modals

### 3. Employers (`/app/employers`)

**Fonctionnalités actuelles** :
- **Ajout d'employeurs** via formulaire
- **Champs requis** :
  - Nom de l'employeur
  - Industrie (enum prédéfini)
  - Code postal (optionnel, validation 4 chiffres)
  
**État d'éligibilité** :
- **Actuellement** : Tous les employeurs sont éligibles par défaut
- **Futur** : Validation automatique (industrie + code postal)
- **Override manuel** : Possibilité de forcer l'éligibilité

**Interface** :
- Liste des employeurs
- Ajout via bottom sheet/modal
- Pas d'édition/suppression pour le moment

### 4. Visas (`/app/visas`) - Nouvel onglet

**Gestion des visas multiples** :
- **Ajout de nouveaux visas** (1er, 2e, 3e WHV)
- **Modification des visas existants**
- **Suppression des visas**
- **Champs** :
  - Type de visa (first_whv, second_whv, third_whv)
  - Date d'arrivée
  - Date de fin (calculée automatiquement : +1 an)
  - Jours requis (auto-définis selon le type)

**Validation métier** :
- Pas de chevauchement de visas
- Progression logique (1er → 2e → 3e)
- Validation des dates

### 5. Profile (`/app/profile`)

**Paramètres utilisateur** :
- **Prénom** (éditable)
- **Nationalité** (ISO 3166-1 alpha-2)
- **Langue du site** (anglais uniquement pour le moment)
- **Thème** (clair/sombre)

**Pas d'inclusion pour le moment** :
- Gestion des visas (onglet dédié)
- Historique de progression
- Export de données

## Architecture technique

### Base de données Supabase

**Tables principales** :
- `user_profiles` - Profils utilisateurs
- `user_visas` - Gestion multi-visas avec calculs automatiques
- `employers` - Employeurs avec classification industrielle
- `work_entries` - Entrées de travail quotidiennes

**Fonctionnalités avancées** :
- **Triggers automatiques** pour mise à jour des progressions
- **Colonnes générées** (pourcentages, jours restants, éligibilité)
- **Validation métier** intégrée (âges, nationalités, chevauchements)
- **Exemption UK** (pas de specified work requis depuis juillet 2024)

### Validation et sécurité

**Zod pour la validation** :
- Validation côté client avant envoi Supabase
- Schémas réutilisables par feature
- Messages d'erreur cohérents

**Row Level Security (RLS)** :
- Politiques Supabase activées sur toutes les tables
- Isolation des données par utilisateur

## UX/UI Mobile-First

**Patterns d'interface** :
- **Navigation** : Bottom tabs (onglets en bas)
- **Formulaires** : Bottom sheets pour les saisies
- **Actions** : Modals pour confirmations/éditions
- **Feedback** : Sonner (shadcn/ui) pour notifications

**Composants shadcn/ui** :
- Installation via CLI (`npx shadcn@latest add [component]`)
- Thème cohérent avec CSS variables
- Accessibilité intégrée

## États futurs (non implémentés)

**Fonctionnalités prévues mais pas prioritaires** :
- Affichage/édition/suppression des work_entries
- Historique et calendrier des jours travaillés
- Statistiques par employeur
- Validation automatique d'éligibilité (industrie + postcode)
- Résumés hebdomadaires/mensuels
- Export de données
- Langues supplémentaires

## Notes de développement

- **Architecture** : Feature-based selon Bulletproof React
- **État** : Contexts pour auth/visa, useState local, pas de React Query initialement
- **Forms** : React Hook Form + Zod obligatoire
- **Mobile-first** : Design mobile prioritaire, responsive desktop en complément