# Guide de Référence Bulletproof React

## Introduction

Ce document sert de référence rapide pour l'architecture Bulletproof React, un ensemble de bonnes pratiques pour construire des applications React scalables et maintenables. Cette architecture a été adoptée pour le projet Get Granted 417.

## Philosophie Fondamentale

### Pourquoi Bulletproof React ?

L'architecture Bulletproof React résout plusieurs problèmes courants dans les projets React :

1. **Organisation du code chaotique** : Les projets React peuvent rapidement devenir désorganisés
2. **Dépendances circulaires** : Les imports croisés entre features créent des problèmes
3. **Difficultés de refactoring** : Sans structure claire, les changements deviennent risqués
4. **Performance dégradée** : Sans patterns d'optimisation, l'app devient lente
5. **Manque de cohérence** : Chaque développeur fait à sa manière

## Structure du Projet

### Organisation par Features

```
src/
├── features/           # 🎯 Cœur de l'application
│   ├── auth/          # Feature authentification
│   ├── employers/     # Feature employeurs
│   ├── hours/  # Feature entrées de travail
│   └── dashboard/     # Feature tableau de bord
├── components/        # 🧩 Composants réutilisables
├── hooks/            # 🪝 Hooks partagés
├── utils/            # 🛠️ Utilitaires
└── lib/              # 📚 Configuration des librairies
```

### Anatomie d'une Feature

Chaque feature est autonome et contient tout ce dont elle a besoin :

```
features/work-entries/
├── api/              # Appels API spécifiques
│   ├── get-work-entries.js
│   └── create-work-entry.js
├── components/       # Composants de la feature
│   ├── work-entry-form.jsx
│   ├── work-entry-list.jsx
│   └── work-entry-card.jsx
├── hooks/           # Hooks spécifiques
│   └── use-work-entries.js
├── stores/          # État local de la feature
│   └── work-entries-store.js
├── types/           # Types TypeScript/JSDoc
│   └── work-entry.types.js
└── utils/           # Utilitaires spécifiques
    └── calculate-hours.js
```

## Règles d'Architecture

### 1. Flux Unidirectionnel

Le code suit une hiérarchie stricte :

```
shared (components, hooks, utils)
    ↓
features (auth, employers, etc.)
    ↓
app (router, providers)
```

**✅ Autorisé :**

- `features/auth` peut importer de `components/`
- `app/` peut importer de `features/`

**❌ Interdit :**

- `features/auth` ne peut PAS importer de `features/employers`
- `components/` ne peut PAS importer de `features/`

### 2. Principe de Colocation

**Gardez le code proche de son utilisation :**

```javascript
// ✅ BON : Composant et son style ensemble
// features/dashboard/components/stats-card.jsx
export function StatsCard({ title, value }) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

// features/dashboard/components/stats-card.module.css
.card { /* styles */ }
```

```javascript
// ❌ MAUVAIS : Styles séparés dans un dossier global
// src/styles/components/dashboard/stats-card.css
```

### 3. Imports Absolus

Toujours utiliser des imports absolus pour la clarté :

```javascript
// ✅ BON
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";

// ❌ MAUVAIS
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../auth/hooks/use-auth";
```

## Patterns de Composants

### 1. Composants Petits et Focalisés

```javascript
// ✅ BON : Un composant, une responsabilité
function WorkHoursBadge({ hours }) {
  const percentage = (hours / 88) * 100;
  return (
    <div className="badge">
      <span>{hours} / 88 jours</span>
      <ProgressBar value={percentage} />
    </div>
  );
}

// ❌ MAUVAIS : Composant qui fait trop de choses
function WorkEntryCardWithEditModalAndDeleteConfirm({ entry }) {
  // 200 lignes de code...
}
```

### 2. Composition over Inheritance

```javascript
// ✅ BON : Composition
function Card({ children, className }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function WorkEntryCard({ entry }) {
  return (
    <Card className="work-entry">
      <CardHeader>{entry.employer}</CardHeader>
      <CardBody>{entry.hours} heures</CardBody>
    </Card>
  );
}
```

## Gestion d'État

### Hiérarchie de l'État

1. **État Local** (useState) : Pour l'UI du composant
2. **État de Feature** (Context/Zustand) : Partagé dans la feature
3. **État Global** (Context) : Auth, theme, langue
4. **État Serveur** (React Query/SWR) : Données de l'API

```javascript
// 1. État Local
function WorkEntryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ...
}

// 2. État de Feature
const WorkEntriesContext = createContext();

// 3. État Global
const AuthContext = createContext();

// 4. État Serveur (avec Supabase)
function useWorkEntries() {
  const { data, error } = useSWR("work-entries", fetchWorkEntries);
  return { data, error };
}
```

## Performance

### Patterns d'Optimisation

```javascript
// 1. Code Splitting
const Dashboard = lazy(() => import("@/features/dashboard"));

// 2. Memoization appropriée
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => processData(data), [data]);

  const handleClick = useCallback(() => {
    // action
  }, [dependency]);

  return <div>{/* render */}</div>;
});

// 3. Virtualisation pour listes longues
import { VirtualList } from "@tanstack/react-virtual";
```

## Sécurité

### Bonnes Pratiques

```javascript
// 1. Validation des entrées
function validateWorkEntry(data) {
  if (!data.hours || data.hours < 0) {
    throw new Error("Invalid hours");
  }
  // ...
}

// 2. Sanitisation du contenu utilisateur
import DOMPurify from "dompurify";
const clean = DOMPurify.sanitize(userInput);

// 3. Variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Jamais : const apiKey = "sk_live_...";
```

## Testing Strategy

### Priorités de Test

1. **Tests d'Intégration** : Tester les flux utilisateur complets
2. **Tests de Composants** : Comportement des composants critiques
3. **Tests Unitaires** : Logique métier complexe

```javascript
// Test d'intégration
describe("Work Entry Flow", () => {
  it("should create a new work entry", async () => {
    render(<App />);

    // Naviguer vers le formulaire
    const addButton = screen.getByText("Add Entry");
    fireEvent.click(addButton);

    // Remplir le formulaire
    const hoursInput = screen.getByLabelText("Hours");
    fireEvent.change(hoursInput, { target: { value: "8" } });

    // Soumettre
    const submitButton = screen.getByText("Save");
    fireEvent.click(submitButton);

    // Vérifier le résultat
    await waitFor(() => {
      expect(screen.getByText("8 hours")).toBeInTheDocument();
    });
  });
});
```

## Conventions de Nommage

### Fichiers et Dossiers

```
✅ kebab-case partout :
- work-entry-form.jsx
- use-work-entries.js
- calculate-hours.utils.js

❌ Éviter :
- WorkEntryForm.jsx
- useWorkEntries.js
- calculateHours.js
```

### Composants

```javascript
// ✅ PascalCase pour les composants
export function WorkEntryCard() {}

// ✅ camelCase pour les fonctions
export function calculateTotalHours() {}

// ✅ UPPER_SNAKE_CASE pour les constantes
export const MAX_HOURS_PER_DAY = 12;
```

## Checklist de Développement

Avant chaque commit, vérifier :

- [ ] Le code suit la structure features/
- [ ] Pas d'imports croisés entre features
- [ ] Composants petits et focalisés
- [ ] Imports absolus utilisés
- [ ] Nommage en kebab-case
- [ ] Tests écrits pour les nouvelles features
- [ ] Performance considérée (memo, lazy loading)
- [ ] Sécurité respectée (validation, sanitisation)

## Ressources

- [Bulletproof React Repository](https://github.com/alan2207/bulletproof-react)
- [React Documentation](https://react.dev)
- [Testing Library](https://testing-library.com)
- [Web.dev Performance](https://web.dev/performance)

## Conclusion

L'architecture Bulletproof React n'est pas un dogme mais un guide. L'objectif est de créer une base de code :

- **Scalable** : Facile à faire grandir
- **Maintenable** : Facile à modifier
- **Testable** : Facile à vérifier
- **Performante** : Rapide pour l'utilisateur
- **Sécurisée** : Sans failles évidentes

En suivant ces principes, le projet Get Granted 417 restera organisé et professionnel, parfait pour un portfolio.
