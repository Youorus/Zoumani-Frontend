# Ce qui est repoussé, et pourquoi

Ce fichier recense **tout ce qui a été identifié puis remis à plus tard**,
avec sa raison. Il n'existe pas pour se donner bonne conscience : une
chose qu'on décide de ne pas faire doit être écrite, sans quoi elle sera
redécouverte dans six mois — souvent au pire moment.

Chaque entrée dit ce qui manque, **ce que ça coûte de ne pas le faire**,
et ce qui déclencherait de s'en occuper. Une entrée sans conséquence
identifiée n'a rien à faire ici : elle se supprime.

Le pendant de ce fichier côté serveur est `zoumani_api/docs/PLUS-TARD.md`.

---

## Conformité

### L'identité de l'éditeur manque aux mentions légales

`src/app/(marketing)/mentions-legales/page.tsx` porte une constante
`EDITEUR` dont cinq champs sont vides :

```ts
const EDITEUR = {
  raisonSociale: "",           // « Zoumani SAS »
  formeJuridique: "",          // « SAS au capital de 1 000 € »
  siege: "",                   // adresse complète
  immatriculation: "",         // « RCS Paris 123 456 789 »
  directeurDePublication: "",  // le nom de Marc
  contact: "contact@zoumani.fr",
}
```

Tant qu'ils le sont, la page annonce une société **en cours de
constitution** — ce qui est vrai, et vaut mieux que des crochets affichés
en production. Les renseigner suffit : la page bascule seule, sans autre
changement de code.

**Ce que ça coûte :** une régie publicitaire peut refuser une annonce
pointant vers un site sans mentions légales complètes — c'est-à-dire au
moment précis où l'on en a besoin. Et l'absence est sanctionnable dès
lors que le site est accessible au public.
**Déclencheur :** l'immatriculation de la société, ou la première
campagne payante — le premier des deux.

---

## Mesure

### Aucun conteneur GTM n'est configuré

`NEXT_PUBLIC_GTM_ID` est vide. Tout est en place — Consent Mode v2,
bandeau, treize événements — mais rien ne part.

**Ce que ça coûte :** les visites, la profondeur de lecture, les abandons
du tunnel et l'origine des campagnes ne sont mesurés nulle part. On
saurait qu'une publicité ne convertit pas, sans savoir si les gens
repartent au premier écran ou butent sur le formulaire.
**Déclencheur :** avant la première campagne payante. L'identifiant se
prend sur tagmanager.google.com et se pose dans les *Build Args* de
Dokploy.

---

## Contenu

### Les badges de magasin ne mènent nulle part

Ils portent la mention « Bientôt », ce qui est honnête, mais restent
inertes. Ils redeviendront des liens le jour de la publication.

**Ce que ça coûte :** rien tant que l'application n'est pas publiée. Le
jour où elle l'est, un badge inerte est une déception à la seconde même
où l'on avait convaincu.
**Déclencheur :** la publication sur l'App Store et Google Play.

### La nature du site est décrite au futur

Les mentions légales affirment qu'aucune transaction n'est possible et
qu'aucun transporteur n'est engagé. Les pages de confiance parlent de
vérifications « à venir ». C'est exact aujourd'hui.

**Ce que ça coûte :** rien maintenant. Le jour de l'ouverture, ces
phrases deviennent fausses — et une mention légale fausse est pire que
pas de mention.
**Déclencheur :** l'ouverture du service, avant la première réservation
réelle.

---

## Acquisition

### Aucune page de corridor n'existe

`entry-pages.ts` pose la forme, `dynamicParams = false` garde la porte.
Rien n'est généré : cent pages sans contenu propre abaisseraient le site
entier.

**Ce que ça coûte :** on ne capte pas les recherches précises — « envoyer
un colis Paris Douala » — qui sont les mieux qualifiées.
**Déclencheur :** quand un corridor aura sa matière : des voyageurs
réels, un délai constaté, un prix moyen. Pas avant : une page de corridor
sans ces trois choses n'a rien à dire.
