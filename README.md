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
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application |
| `NEXT_PUBLIC_API_URL` | URL de l'API (par défaut, l'API mock locale) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro WhatsApp au format international |

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
