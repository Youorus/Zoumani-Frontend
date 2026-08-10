# API Integration

## Chaine data retenue

```text
Backend
↓
API client
↓
feature/api
↓
TanStack Query
↓
hooks
↓
composants metier
↓
pages
```

## API client centralise

Fichiers :

- `src/lib/api/api-client.ts`
- `src/lib/api/api-errors.ts`
- `src/lib/api/api-types.ts`
- `src/lib/api/auth-interceptor.ts`

Responsabilites :

- URL backend via `env.ts`
- headers JSON
- bearer token si present
- timeout
- annulation via `AbortSignal`
- normalisation des erreurs

## Erreur standard

Le frontend ne manipule jamais `Response` directement.

Les erreurs remontent comme `ApiError` :

- `status`
- `code`
- `message`
- `details`

Avantages :

- affichage uniforme
- retry controle
- logique de query plus propre

## DTO vs modele domaine

La feature `trips` sert de reference :

- l’API renvoie `TripDto` en `snake_case`
- le frontend convertit vers `Trip` en `camelCase`

Cela evite de coupler les composants a la structure brute backend.

## TanStack Query

Le client query est configure dans `src/lib/query/query-client.ts`.

Standards retenus :

- `staleTime` raisonnable
- retry limite
- pas de retry sur certaines erreurs client
- hydratation server/client compatible App Router

Les query keys sont centralisees par feature.

Exemple :

- `tripQueryKeys.all`
- `tripQueryKeys.lists()`
- `tripQueryKeys.detail(id)`

## Pattern feature/api

Dans une feature :

1. `api/*.ts` appelle `apiClient`
2. la reponse brute est validee par Zod
3. le DTO est mappe vers le modele domaine
4. le hook query expose uniquement le modele domaine

## Mutations

Le projet ne contient pas encore de mutation metier car la feature de reference reste volontairement petite.

Le pattern attendu pour la suite :

1. `feature/api/create-*.ts`
2. `useMutation`
3. invalidation ou mise a jour optimiste via query keys centralisees
4. affichage d’erreur ou toast via primitives communes

## Realtime et cache

Le realtime ne vit pas dans les composants metier.

Pattern retenu :

- `lib/realtime/*` = tuyauterie generique
- `features/trips/realtime/*` = decision metier de mise a jour cache

Exemple actuel :

- `trip:updated`
- parse du payload
- `queryClient.setQueryData` sur le detail
- mise a jour de la liste si l’element existe deja

## Variables d’environnement

Variables publiques actuelles :

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`

Elles sont validees dans `src/lib/env/env.ts`.

Le reste du code importe `env` au lieu d’utiliser `process.env` directement.
