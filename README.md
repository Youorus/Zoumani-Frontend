# Zoumani — Vitrine

Le site public. Aucun secret, et **un seul** appel réseau — celui qui
enregistre les préinscriptions.

Les directives de développement sont dans [`AGENTS.md`](AGENTS.md).

Ce dépôt portait aussi l'espace connecté — envois, voyages, paiements,
suivi, vérification d'identité — et l'administration. Le 20 août 2026, les
deux sont partis : l'espace utilisateur vers l'application mobile
(`zoumani_app`), l'administration vers `zoumani-admin`, extrait de ce dépôt
et qui en garde l'historique.

## Ce qu'il contient

- `/` — promesse, fonctionnement, confiance, partenaires, FAQ.
- `/preinscription` — le tunnel : qui attend le service, et sur quel
  trajet.
- `/envoyer-un-colis` et `/proposer-un-voyage` — deux pages d'entrée.
  « Envoyer un colis » et « rentabiliser ses kilos » ne sont pas la même
  recherche, ne se formulent pas dans les mêmes mots, et ne s'achètent
  pas dans la même campagne.

Vérifiable d'une commande : `npm run build` marque **toutes** les routes
`○ (Static)` ou `● (SSG)`. S'il en apparaît une en `ƒ (Dynamic)`, c'est
qu'un appel serveur s'est réintroduit.

## La préinscription, et ce qu'elle coûte

Elle ramène un appel réseau, là où il n'y en avait plus aucun. C'est
assumé : il faut bien enregistrer quelque part qui attend le service, et
sans corridor collecté on ne sait pas où ouvrir en premier.

Ce qui est préservé : **seul le tunnel appelle**. La vitrine reste
statique et muette. Si l'API tombe, la page s'affiche entière et seul le
formulaire échoue, en le disant.

`NEXT_PUBLIC_API_URL` est facultative et validée au démarrage. Absente,
le tunnel refuse d'envoyer plutôt que de faire croire à un
enregistrement — une inscription perdue qu'on croit acquise coûte plus
cher qu'une inscription refusée.

## Ce qu'il ne contient toujours pas, et pourquoi ça compte

Ni connexion, ni inscription, ni recherche de trajets. Ils sont partis
avec l'espace connecté. Le site en garde :

- **insensible aux pannes de l'API.** Elle tombe, la vitrine reste debout.
- **déployable n'importe où.** Pas de proxy, pas de `API_URL`, pas de
  cookie de session, pas de secret dans l'image.
- **plus léger.** Huit dépendances sont parties avec l'espace connecté —
  TanStack Query, Stripe, react-hook-form, zustand, leaflet et leurs
  compagnons — sur la page même que voit un visiteur pour la première fois.

## Commandes

```bash
npm install
npm run dev        # sur :3000
npm run typecheck
npm run lint
npm test           # vitest
npm run test:e2e   # playwright
npm run build
```

## Configuration

Voir `.env.example`. Tout y est facultatif sauf `NEXT_PUBLIC_APP_URL`, qui
sert de base aux URL canoniques et au plan du site.

Deux valeurs méritent une phrase :

**`NEXT_PUBLIC_SEO_INDEXABLE`** reste à `false` par défaut. Sans elle, le
site répond `noindex` et un `robots.txt` bloquant — un domaine temporaire
ne doit jamais finir dans un index.

**`NEXT_PUBLIC_APP_STORE_URL` / `NEXT_PUBLIC_PLAY_STORE_URL`** : tant
qu'elles sont vides, le bloc de téléchargement annonce « bientôt
disponible » au lieu d'afficher des boutons menant à une page introuvable.
Le jour de la publication, ces deux lignes suffisent — aucun code à
toucher.
