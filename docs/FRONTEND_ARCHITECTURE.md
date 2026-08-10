# Frontend Architecture

## Objectif

Ce socle pose une architecture Next.js App Router orientee production pour Zoumani, avec une separation stricte entre :

- design system
- logique technique transverse
- features metier
- pages

Le depot est volontairement pragmatique : pas de couches artificielles, pas de repository frontend inutile, pas de store global pour les donnees serveur.

## Structure

```text
src/
├── app/
│   ├── (marketing)/
│   ├── (app)/
│   ├── api/
│   ├── error.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── providers.tsx
├── components/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── features/
│   └── trips/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── env/
│   ├── query/
│   ├── realtime/
│   ├── theme/
│   └── utils/
├── styles/
└── types/
```

## Responsabilites

### `app/`

- compose les pages et layouts
- reste au sommet de la chaine de dependances
- peut importer `features`, `components`, `lib`
- ne contient pas de logique API metier dispersee

### `components/ui/`

- primitives UI generiques
- encapsulent Radix quand necessaire
- consomment uniquement les tokens semantiques
- ne connaissent aucune notion metier comme `trip`, `parcel`, `payment`

### `components/layout/`

- shell applicatif, container, page headers
- composants transverses lies a la mise en page

### `components/shared/`

- elements reels de partage transverse
- a utiliser avec parcimonie

### `features/*`

Chaque feature suit le meme pattern :

```text
features/trips/
├── api/
├── components/
├── hooks/
├── queries/
├── realtime/
├── schemas/
├── types/
└── utils/
```

Une feature peut dependra de :

- `components/ui`
- `components/layout` si besoin mineur
- `lib/*`

Une feature ne doit pas importer arbitrairement les details internes d’une autre feature.

### `lib/`

- technique transverse uniquement
- aucun comportement metier specifique a une feature
- exemples : `api-client`, validation `env`, `query-client`, provider realtime generique

## Regles de dependances

La direction attendue est :

```text
app
↓
features
↓
components/ui + components/layout + lib
↓
styles / utils / types
```

Regles pratiques :

- `app` peut composer plusieurs features
- `features` ne doivent pas se coupler entre elles
- `lib` ne doit pas remonter vers `app`
- `components/ui` reste independant du metier

## Gestion du state

### Server state

- gere par TanStack Query
- le backend est la source de verite
- les hooks `useTrips()` / `useTrip(id)` encapsulent l’usage de `useQuery`

### URL state

- doit vivre dans `searchParams` quand utile
- non implemente globalement tant qu’un besoin concret n’existe pas

### Form state

- cible retenue : React Hook Form + Zod
- a utiliser dans les features qui portent de vrais formulaires

### Local UI state

- `useState` / `useReducer`
- pour les toggles, drawers, selection locale, etc.

### Global client state

- Zustand uniquement lorsqu’un vrai besoin transverse existe
- actuellement utilise pour la session/auth
- ne jamais y dupliquer des donnees TanStack Query

## Server Components vs Client Components

Regle par defaut :

- Server Components pour les pages et layouts
- Client Components uniquement quand on a besoin de hooks, de state local, de Radix interactif, de formulaires, ou du realtime

Exemple actuel :

- `src/app/(app)/trips/page.tsx` est un Server Component
- `TripsListView` est un Client Component
- `TripDetailView` est un Client Component

Le pattern retenu :

1. prefetch cote serveur quand pertinent
2. `HydrationBoundary`
3. hook client react-query pour la consommation UI

## Realtime

Le realtime est organise en deux etages :

- `lib/realtime/*` : client generique + provider + contrat d’events
- `features/*/realtime/*` : handlers feature-specifiques qui mettent a jour le cache

Le composant UI n’ecrit pas directement dans le cache. Il emet un evenement realtime, puis le handler de feature decide :

- `setQueryData`
- `invalidateQueries`

## Gestion d’erreurs

Trois niveaux :

- erreurs API via `ApiError`
- erreurs de rendu route avec `app/error.tsx`
- erreurs locales de feature via `ErrorState`

## Conventions de code

- TypeScript strict
- aucun `any`
- DTO backend distincts des modeles de domaine quand cela apporte une vraie valeur
- aucune couleur hardcodee dans les composants UI
- aucun `fetch()` dans les composants

## Pattern pour une nouvelle feature

Pour ajouter `parcels` ou `payments` :

1. creer les types / schemas
2. ajouter les fonctions `feature/api`
3. definir les query keys
4. exposer les hooks query/mutation
5. creer les composants metier
6. composer la page dans `app/`
