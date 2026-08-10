# Design System

## Principe fondamental

Les composants ne consomment jamais la palette brute. Ils utilisent uniquement des tokens semantiques.

```text
Palette physique
↓
Theme
↓
Tokens semantiques
↓
Composants UI
↓
Composants metier
↓
Features
↓
Pages
```

## Palette brute

Theme actuel Zoumani :

- `--orange-teranga`: `#FF6B00`
- `--soleil-africain`: `#FFC837`
- `--terre-rouge`: `#8D2E2E`
- `--noir-ebene`: `#2B1D17`
- `--sable-clair`: `#FFF8F0`

Theme alternatif `zoumani-v2` :

- palette secondaire orientee lagon / nuit / sable
- meme architecture de composants
- seul le mapping semantique change

## Tokens semantiques

Les composants consomment par exemple :

- `background`
- `foreground`
- `surface`
- `surface-elevated`
- `primary`
- `primary-foreground`
- `secondary`
- `secondary-foreground`
- `accent`
- `border`
- `muted`
- `muted-foreground`
- `success`
- `warning`
- `error`
- `info`

Exemple voulu :

- un `Button` utilise `bg-primary`
- le theme courant mappe `primary` vers Orange Teranga
- le theme futur mappe `primary` vers une autre couleur
- le composant ne change pas

## Themes

Le projet expose actuellement :

- `zoumani`
- `zoumani-v2`

Le provider pose :

- `data-brand`
- `data-color-scheme`

Cela permet :

- changement de branding
- dark mode futur
- persistance locale des preferences

## Typography

- texte courant : `Manrope`
- titres : `Fraunces`

Le contraste typographique evite un rendu trop standard tout en restant lisible.

## Radius et ombres

Tokens exposes :

- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`
- `--radius-full`

Ombres :

- `shadow-soft`
- `shadow-lifted`

## Composants UI disponibles

Primitives generees :

- `Button`
- `IconButton`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `RadioGroup`
- `Switch`
- `Dialog`
- `Drawer`
- `DropdownMenu`
- `Popover`
- `Tooltip`
- `Tabs`
- `Avatar`
- `Badge`
- `Card`
- `Skeleton`
- `Spinner`
- `Toast`
- `EmptyState`
- `ErrorState`
- `Container`

Toutes les primitives interactives sont encapsulees derriere notre API et n’exposent pas Radix dans les pages metier.

## Regles UX/UI

- mobile-first
- contrastes lisibles
- focus visible systematique
- composants accessibles au clavier
- etats de chargement et d’erreur coherents
- pas de hardcode couleur dans les composants

## Regle d’evolution

Si un style est reutilisable dans plusieurs features :

1. verifier s’il s’agit d’un besoin purement UI
2. si oui, l’ajouter dans `components/ui`
3. sinon, le laisser dans la feature concernee

Ne pas transformer `shared` en dossier fourre-tout.
