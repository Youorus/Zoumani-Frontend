# Zoumani — Vitrine

Le site public. Aucun secret, et **deux** appels réseau : celui qui
enregistre les préinscriptions, et celui de la page `/suppression-compte`
— exigée par Google Play — qui prouve l'adresse par code puis efface le
compte.

Les directives de développement sont dans [`AGENTS.md`](AGENTS.md).

## Proposition de landing V2

Le Hero de la proposition, validé le 6 octobre 2026, est intégré à l’accueil `/`
en français et en anglais. Les autres sections de l’accueil sont conservées.
La proposition complète se visite sur `/preview/v2` pour comparaison. La preview est statique, non indexable et absente du sitemap.
Elle réutilise la charte et les assets existants. Le quota partenaire de
10 expéditions sans abonnement et la carte d’activité sont des propositions
visuelles, sans changement de facturation. Voir l’[audit et les vérifications](docs/LANDING-V2.md).

```bash
npm run dev
# http://localhost:3000/preview/v2
```

Le quota se règle dans `src/features/home-preview/model/preview-config.ts`.
Le remplacement des autres sections attend une validation distincte.
Le Hero conserve le slogan « Envoyez vos colis. Rentabilisez vos voyages. »,
les badges App Store et Google Play, ainsi que les 34 corridors défilants.
Le badge Google Play reste « Bientôt » tant que son URL de publication n’est
pas configurée ; le lien entreprise rejoint le contact WhatsApp existant.

Ce dépôt portait aussi l'espace connecté — envois, voyages, paiements,
suivi, vérification d'identité — et l'administration. Le 20 août 2026, les
deux sont partis : l'espace utilisateur vers l'application mobile
(`zoumani_app`), l'administration vers `zoumani-admin`, extrait de ce dépôt
et qui en garde l'historique.

## Ce qu'il contient

- `/` — le Hero « Envoyez vos colis. Rentabilisez vos voyages. », une photo humaine et la capture de l’application, quatre indicateurs datés, les réseaux de transport, trois chapitres (expéditeur, voyageur, entreprise de fret), fonctionnement, réseau (fret, vols confirmés, relais, assurance à venir), FAQ, téléchargement.
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
