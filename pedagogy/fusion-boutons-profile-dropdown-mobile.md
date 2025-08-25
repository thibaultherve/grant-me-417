# Fusion des boutons Profile et Logout en dropdown mobile

## Contexte
Dans la navigation mobile bottom bar, nous avions deux boutons séparés : "Profile" et "Logout", ce qui prenait de l'espace et créait une interface encombrée.

## Solution implémentée
Création d'un **dropdown Profile** qui combine les deux fonctionnalités :
- Affichage de l'email utilisateur
- Lien vers la page Profile
- Option de déconnexion

## Modifications apportées

### 1. Installation du composant shadcn/ui
```bash
npx shadcn@latest add dropdown-menu
```
Cette commande installe le composant `DropdownMenu` avec toutes ses sous-composants (Trigger, Content, Item, etc.).

### 2. Mise à jour des imports
```javascript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
```

### 3. Suppression du lien Profile du tableau de navigation
Avant :
```javascript
const navigation = [
  { name: 'Dashboard', href: paths.app.dashboard.path, icon: Home },
  { name: 'Employers', href: paths.app.employers.path, icon: Building2 },
  { name: 'Work Entries', href: paths.app.workEntries.path, icon: Clock },
  { name: 'Visas', href: paths.app.visas.path, icon: FileText },
  { name: 'Profile', href: paths.app.profile.path, icon: User }, // Supprimé
];
```

### 4. Remplacement dans la navigation mobile
Remplacement du bouton Logout par un dropdown Profile :

```javascript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className={/* styles avec état actif si on est sur Profile */}>
      <User className="h-5 w-5 flex-shrink-0" />
      <span className="leading-none">Profile</span>
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="center" side="top" className="mb-2 min-w-48">
    <DropdownMenuLabel>
      {/* Affichage de l'email utilisateur */}
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem asChild>
      <Link to={paths.app.profile.path}>Profile</Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleSignOut}>
      Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 5. Ajout du lien Profile au desktop
Pour maintenir la cohérence, ajout du lien Profile dans la sidebar desktop après les autres éléments de navigation.

## Avantages de cette solution

### UX/UI mobile
- **Économie d'espace** : 5 onglets au lieu de 6 dans la bottom bar
- **Regroupement logique** : Profile et Logout sont des actions utilisateur liées
- **Meilleure lisibilité** : Plus d'espace pour chaque onglet
- **Pattern familier** : Dropdown profile est un pattern standard des applications

### Accessibilité
- **Touch target** conforme : 44px minimum maintenu
- **Navigation clavier** : DropdownMenu géré par Radix UI
- **Screen readers** : Labels appropriés avec DropdownMenuLabel

### Cohérence design
- **shadcn/ui** : Utilisation du design system établi
- **États visuels** : Active state maintenu quand on est sur la page Profile
- **Mobile-first** : Solution pensée pour mobile puis adaptée desktop

## Détails techniques

### Positionnement du dropdown
```javascript
<DropdownMenuContent align="center" side="top" className="mb-2 min-w-48">
```
- `side="top"` : Dropdown s'ouvre vers le haut (bottom bar)
- `align="center"` : Centré par rapport au trigger
- `mb-2` : Marge pour éviter que le dropdown touche la navbar

### Gestion de l'état actif
Le bouton Profile reste highlighted quand on est sur `/profile` :
```javascript
className={`... ${
  location.pathname === paths.app.profile.path 
    ? 'bg-primary text-primary-foreground' 
    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
}`}
```

### Styling du logout en rouge
```javascript
<DropdownMenuItem
  onClick={handleSignOut}
  className="cursor-pointer text-destructive focus:text-destructive"
>
```
Utilisation de `text-destructive` pour indiquer visuellement l'action potentiellement destructive.

## Pattern Bulletproof React appliqué

Cette implémentation suit les principes Bulletproof React :
- **Colocation** : Le dropdown est directement dans le layout où il est utilisé
- **Composants réutilisables** : Utilisation de shadcn/ui au lieu de composants custom
- **Single Responsibility** : Le dropdown gère uniquement les actions utilisateur
- **Accessibilité** : Pattern Radix UI accessible par défaut

Cette solution améliore l'expérience mobile tout en maintenant la cohérence avec le design system établi.