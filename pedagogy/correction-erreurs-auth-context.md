# Correction des erreurs de contexte d'authentification

## Problème rencontré

Après la migration vers React Router v7, l'application générait l'erreur suivante :
```
Uncaught Error: useAuth must be used within an AuthProvider
    at useAuth (use-auth.tsx:99:11)
    at VisaProvider (use-visa-context.tsx:18:20)
```

## Analyse du problème

### 1. Structure des providers
L'erreur indiquait que le `VisaProvider` essayait d'utiliser `useAuth` avant que l'`AuthProvider` ne soit disponible dans la hiérarchie des composants.

### 2. Import incorrect
Le `VisaProvider` importait `useAuth` depuis l'ancien chemin :
```tsx
// ❌ INCORRECT - ancien chemin
import { useAuth } from '@/features/auth/hooks/use-auth'
```

Au lieu du nouveau chemin centralisé :
```tsx
// ✅ CORRECT - nouveau chemin
import { useAuth } from '@/lib/auth'
```

## Solutions appliquées

### 1. Correction de l'import dans VisaProvider

**Avant :**
```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth' // ❌ Ancien chemin
import type { UserVisa } from '../types'
```

**Après :**
```tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth' // ✅ Nouveau chemin centralisé
import type { UserVisa } from '../types'
```

### 2. Amélioration des types TypeScript

```tsx
// Amélioration des imports TypeScript
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
```

**Avantages :**
- Import `type ReactNode` au lieu de `ReactNode` pour optimiser le bundle
- Suppression de l'import `React` inutile (React 17+)
- Code plus moderne et optimisé

## Pourquoi cette erreur s'est produite ?

### 1. Refactorisation de l'architecture
Lors de la migration vers Bulletproof React, nous avons :
- Déplacé `useAuth` de `@/features/auth/hooks/use-auth` vers `@/lib/auth`
- Centralisé la logique d'authentification dans `lib/`
- Le `VisaProvider` utilisait encore l'ancien chemin

### 2. Hiérarchie des providers
```tsx
// Structure correcte dans App.tsx
<AuthProvider>          {/* 1. AuthProvider en premier */}
  <VisaProvider>        {/* 2. VisaProvider peut maintenant utiliser useAuth */}
    <AppRouter />
  </VisaProvider>
</AuthProvider>
```

### 3. Lazy loading et imports
Avec React Router v7, les composants sont chargés de manière asynchrone. Si les imports ne sont pas corrects, les hooks peuvent ne pas être disponibles au bon moment.

## Leçons apprises

### 1. Cohérence des imports
Lors d'une refactorisation, il faut s'assurer que **tous** les fichiers utilisent les nouveaux chemins d'import.

**Script de vérification (PowerShell) :**
```powershell
# Rechercher tous les anciens imports
Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Select-String "@/features/auth/hooks/use-auth"
```

### 2. Ordre des providers
L'ordre des providers dans la hiérarchie React est crucial :
```tsx
// ✅ CORRECT - AuthProvider avant VisaProvider
<AuthProvider>
  <VisaProvider>
    <App />
  </VisaProvider>
</AuthProvider>

// ❌ INCORRECT - VisaProvider ne peut pas utiliser useAuth
<VisaProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</VisaProvider>
```

### 3. TypeScript moderne
```tsx
// ✅ MODERNE
import { createContext, type ReactNode } from 'react'

// ❌ ANCIEN
import React, { createContext, ReactNode } from 'react'
```

## Test de régression

### Comment vérifier que le problème est résolu :

1. **Démarrage du serveur :**
```bash
pnpm dev
```

2. **Vérifications :**
- ✅ Aucune erreur de console au démarrage
- ✅ Page d'accueil se charge correctement
- ✅ AuthProvider est disponible dans toute l'application
- ✅ VisaProvider peut utiliser useAuth sans erreur

3. **Navigation :**
- ✅ Routes publiques accessibles (/, /auth/login, /auth/register)
- ✅ Routes protégées redirigent vers login si non connecté
- ✅ Lazy loading fonctionne (chunks JavaScript séparés)

## Prévention future

### 1. Alias d'imports cohérents
```json
// tsconfig.json ou vite.config.js
{
  "paths": {
    "@/lib/*": ["./src/lib/*"],
    "@/features/*": ["./src/features/*"],
    "@/app/*": ["./src/app/*"]
  }
}
```

### 2. ESLint rules
```json
// .eslintrc.js
{
  "rules": {
    "import/no-restricted-paths": [
      "error",
      {
        "zones": [
          {
            "target": "./src/features",
            "from": "./src/lib",
            "message": "Features should not import from lib directly"
          }
        ]
      }
    ]
  }
}
```

### 3. Tests d'intégration
```tsx
// Tester que les providers sont correctement configurés
test('AuthProvider should be available in VisaProvider', () => {
  render(
    <AuthProvider>
      <VisaProvider>
        <TestComponent />
      </VisaProvider>
    </AuthProvider>
  );
  // Vérifier qu'aucune erreur n'est levée
});
```

Cette correction démontre l'importance de la cohérence des imports lors d'une refactorisation majeure et la nécessité de bien comprendre l'ordre des providers React.