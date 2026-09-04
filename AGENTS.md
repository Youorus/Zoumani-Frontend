<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Directives pour tout agent de code — vitrine Zoumani

**Source de vérité de ce dépôt.** Le backend a les siennes dans
`zoumani_api/AGENTS.md` ; celles-ci ne les répètent pas, elles disent ce
qui est propre au site public.

Le bloc ci-dessus est écrit et remis par `next dev` — ne le supprime pas,
il reviendrait.

## 1. Ce que ce site est

La **vitrine et la porte d'entrée** de Zoumani. Il ne sert pas le
produit : il explique ce qu'il sera, et recueille qui l'attend.

Trois choses s'y jouent, dans cet ordre :

1. **la confiance** — on confie un colis à un inconnu, et rien dans une
   page web ne rend cela évident ;
2. **la conversion** — une visite payée qui repart sans laisser de trajet
   est perdue deux fois : l'argent de la publicité, et l'information ;
3. **le référencement** — le seul canal qui ne se paie pas à chaque
   visite.

Un choix qui améliore l'un en détruisant un autre n'en est pas un.
Dis-le plutôt que de trancher seul.

## 2. Le rôle attendu de toi

Le même que sur le backend : **architecte, pas générateur**. Tu
contredis quand c'est justifié, tu justifies chaque décision, tu ne
livres jamais un raccourci en silence, et tu ne prétends pas avoir
vérifié ce que tu n'as pas vérifié.

Deux ajouts propres à ce dépôt.

**Tu ne promets rien que le produit ne tienne.** Pas de « 100 %
sécurisé », pas de « garanti », pas d'« assuré » tant que le mécanisme
n'existe pas. Le site parle au **futur** de ce qui n'est pas ouvert —
« chaque voyageur passe une vérification », « les badges deviendront des
liens le jour de la publication ». Cet écart de registre se remarque si
tu l'oublies.

**Tu n'inventes aucun chiffre.** Ni compteur d'inscrits, ni témoignage,
ni logo partenaire, ni note. Un compteur affichant « 1 200 personnes
attendent » alors qu'il y en a onze est un mensonge qui se découvre au
lancement.

## 3. L'architecture

Next.js App Router · React · Tailwind v4 · **CSS Modules** · TypeScript
strict · vitest · Playwright.

```
src/app/(marketing)/     Les routes publiques.
  [intention]/           /envoyer-un-colis, /proposer-un-voyage
  preinscription/        Le tunnel
src/features/<domaine>/  api/ model/ components/
src/lib/
  env/env.ts             Variables validées par zod, au démarrage.
  seo/                   site.ts, structured-data.ts
  marketing/             attribution.ts, events.ts
src/styles/tokens.css    Les couleurs. Recopiées de l'application mobile.
```

Un composant nouveau va dans `src/features/<domaine>/components/`, avec
son `.module.css` à côté. Pas de styles en ligne, pas de couleur en clair.

## 4. Les quatre règles

**1. Toutes les routes restent statiques.** `npm run build` doit les
marquer `○ (Static)` ou `● (SSG)`. Une route passée en `ƒ (Dynamic)`
sans qu'on l'ait voulu est une régression de référencement, et rien ne la
signale.

**2. Le contenu qui compte est rendu par le serveur.** Un titre, un
paragraphe, une question de FAQ ne dépendent jamais du JavaScript client.
Un composant qui porte du contenu indexable ne porte pas `"use client"`.

**3. `"use client"` se justifie.** Il coûte du JavaScript à tous les
visiteurs, y compris à qui ne touchera jamais le composant. On le met
pour de l'état, un événement ou une API du navigateur — jamais par
commodité. `useSearchParams` impose en outre une frontière de suspense,
sans quoi **toute la page** bascule en dynamique.

**4. Une couleur ne s'écrit jamais en clair.** `src/styles/tokens.css`
fait foi, et il est **recopié de l'application mobile**
(`zoumani_app/src/theme/tokens.css`). Une charte se modifie donc là-bas
d'abord, puis ici. Seule `opengraph-image.tsx` échappe à la règle : elle
est produite hors du navigateur, où aucune variable CSS n'est résolue.

## 5. Le réseau : une exception, et une seule

Ce site a longtemps n'appelé personne, et le `README.md` en faisait une
qualité — l'API tombe, la vitrine reste debout.

La préinscription ramène **un** appel, et il reste seul. La vitrine est
statique et muette ; si l'API tombe, la page s'affiche entière et seul le
formulaire échoue, en le disant.

`NEXT_PUBLIC_API_URL` est facultative et validée. Absente, le tunnel
**refuse d'envoyer** plutôt que de faire croire à un enregistrement : une
inscription perdue qu'on croit acquise coûte plus qu'une inscription
refusée. Ne « corrige » pas ce comportement.

N'ajoute pas d'autre appel sans le demander.

## 6. Le workflow

**Avant d'écrire**

1. Lire ce fichier et le `README.md`.
2. **Regarder ce qui existe.** Ce dépôt porte déjà une FAQ de neuf
   questions, le graphe `Organization`/`WebSite`/`Service`/`FAQPage`, un
   `env.ts` validé, l'attribution UTM et la couche d'événements. Une
   consigne suppose souvent qu'il faut les créer — vérifie avant.

**Après — non négociable**

3. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
4. Vérifier dans la sortie du build que **rien n'est passé en dynamique**.
5. La documentation part avec le code, dans le même commit. Ce qu'on
   renonce à faire va dans `docs/PLUS-TARD.md`, avec ce que ça coûte et
   ce qui déclencherait de s'en occuper. Une chose repoussée sans trace
   est redécouverte six mois plus tard, souvent au pire moment. Un `README`
   qui décrit un site qu'on n'a plus est pire que pas de README : c'est
   celui-là qu'on croit.

## 7. Les interdits

**Inventer une donnée sociale.** Le composant peut exister, prêt à
afficher un chiffre réel ; il n'affiche rien tant qu'il n'y en a pas.

**Simuler un enregistrement.** Voir §5.

**Allonger le tunnel.** Chaque champ ajouté se paie en inscriptions
perdues. Un champ nouveau se justifie par ce qu'on en fera, pas par ce
qu'il serait « bien d'avoir ».

**Ajouter une dépendance sans le demander.** Une bibliothèque pour une
animation, un sélecteur de date, un carrousel : propose-la avec son coût
en performance et son alternative.

**Générer des pages à la chaîne.** Cent pages de corridor sans contenu
propre abaissent le site entier. `dynamicParams = false` est là pour ça.

**Précocher un consentement.** C'est un fait daté, pas un défaut.

**Déclencher quoi que ce soit avant l'inscription.** Pas de fenêtre
surgissante, pas d'invitation à partager, pas de sortie vers un réseau
social tant que le formulaire n'est pas validé.

## 8. Mobile d'abord, vraiment

L'essentiel du trafic vient d'une publicité ouverte sur un téléphone.

- Confortable entre **320 px et 430 px**.
- Champs à **16 px** au minimum : en dessous, iOS zoome au focus et la
  page se décale.
- Cibles tactiles de **44 px** de haut au moins.
- Aucun débordement horizontal, jamais.
- Le clavier ne masque ni le champ actif ni le bouton d'action.

## 9. Mesure et vie privée

Tout passe par `src/lib/marketing/events.ts`. Aucun appel direct à une
régie dans un composant : il partirait sans attendre le consentement,
échapperait au nommage commun, et se dupliquerait à la première copie.

Trois régies sont branchées, et chacune par un seul fichier :

- **GA4**, en direct (`components/analytics/google-analytics.tsx`), sous
  le consentement de mesure. Il reçoit tous les événements.
- **Microsoft Clarity**, sous le même consentement, mais **pas chargé du
  tout** tant qu'il n'est pas donné : il n'implémente pas le Consent
  Mode.
- **Le pixel Meta** (`components/analytics/meta-pixel.tsx`), sous le
  consentement **publicitaire**, qui est une catégorie distincte. Il ne
  reçoit que `PageView` et `Lead` — cette traduction vit dans
  `lib/marketing/meta.ts`, et nulle part ailleurs.

Une quatrième régie se brancherait dans `track`, à un seul endroit.

Un événement porte toujours de quoi lire un abandon : `intent_role`,
`origin`, `destination`. Sans eux, on sait que des gens partent, sans
savoir sur quel corridor.

L'attribution est **recopiée telle quelle** : c'est la régie qui nomme
ces valeurs, et les normaliser empêcherait de recouper avec ses rapports.

## 10. Quand tu dois t'arrêter et demander

- Changer la charte, la palette, ou la structure de l'accueil.
- Ajouter une dépendance, ou un appel réseau.
- Créer une famille de pages indexables.
- Écrire une affirmation sur la sécurité, l'assurance, le remboursement.
- Modifier ce que le site promet.

Dans tous les autres cas : décide, agis, explique ton choix.
