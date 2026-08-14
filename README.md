# Zoumani — Frontend

Frontend Next.js (App Router) de Zoumani.

## Stack

- **Next.js 16** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS 4** + Radix UI
- **TanStack Query** (données serveur) et **Zustand** (état client)
- **React Hook Form** + **Zod**
- **Vitest** (unitaire) et **Playwright** (e2e)

## Prérequis

- Node.js >= 20

## Démarrage

```bash
npm install
cp .env.example .env.local
npm run dev
```

L'application est disponible sur http://localhost:3000.

## Variables d'environnement

Voir `.env.example` :

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | URL publique du site. Base des URLs canoniques, du sitemap et du robots.txt |
| `NEXT_PUBLIC_SEO_INDEXABLE` | `true` pour autoriser l'indexation. Absent ou `false` ⇒ `noindex` + robots.txt bloquant |
| `NEXT_PUBLIC_API_URL` | URL de l'API (par défaut, l'API mock locale) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro WhatsApp au format international |
| `NEXT_PUBLIC_MAP_TILE_URL` | Modèle d'URL des tuiles de la carte des points relais |
| `NEXT_PUBLIC_MAP_ATTRIBUTION` | Attribution légale affichée sur la carte |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Code Google Search Console (optionnel) |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Code Bing Webmaster Tools (optionnel) |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | Code Yandex Webmaster (optionnel) |

> `NEXT_PUBLIC_APP_URL` est la seule valeur à changer pour brancher le domaine
> définitif. L'indexation est un choix explicite : sans
> `NEXT_PUBLIC_SEO_INDEXABLE=true`, le site reste hors index — ce qui évite
> qu'un domaine temporaire ou de préproduction entre en concurrence avec le
> domaine définitif dans les résultats de recherche.

## Référencement

Le SEO est centralisé dans `src/lib/seo/` :

- `site.ts` — titres, description, mots-clés, réseaux sociaux, codes de vérification
- `structured-data.ts` — JSON-LD `Organization`, `WebSite`, `Service`, `HowTo`, `FAQPage`

Généré automatiquement par Next : `/sitemap.xml`, `/robots.txt`,
`/manifest.webmanifest`, `/opengraph-image` (1200×630), favicon et icônes PWA.

## Déploiement

Déployé sur Dokploy via le `Dockerfile` (build multi-étages, sortie
`standalone`, exécution sans privilèges). Chaque push sur `main` déclenche
automatiquement un nouveau déploiement.

Sonde de disponibilité : `GET /api/health`.

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lance le build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:watch` | Tests unitaires en watch |
| `npm run test:e2e` | Tests end-to-end (Playwright) |

## Structure

```
src/
  app/         Routes App Router (marketing, app, api mock)
  components/  Composants layout et partagés
  features/    Modules métier
  lib/         Utilitaires et clients
  styles/      Styles globaux
  types/       Types partagés
e2e/           Tests Playwright
docs/          Architecture, design system, intégration API
```

## Documentation

- [`docs/FRONTEND_ARCHITECTURE.md`](docs/FRONTEND_ARCHITECTURE.md)
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
- [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md)
