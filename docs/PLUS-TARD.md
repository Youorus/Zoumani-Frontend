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

### Le conteneur GTM est branché, mais vide

`NEXT_PUBLIC_GTM_ID` vaut `GTM-PMJC9J5Q` depuis le 30 août 2026, posé
dans les *Build Args* et l'environnement Dokploy. Le conteneur se charge
en production, le Consent Mode v2 le précède, le bandeau recueille la
réponse et la mémorise. Toute la chaîne technique fonctionne.

Ce qui manque est **à l'intérieur du conteneur** : `gtm.js?id=GTM-PMJC9J5Q`
renvoie `"tags":[]`. Aucune balise n'y est déclarée, donc aucune mesure
GA4. Vérifié le 30 août 2026 en interrogeant directement le conteneur
servi.

**Ce que ça coûte :** exactement ce que coûtait l'absence d'identifiant.
Les visites, la profondeur de lecture, les abandons du tunnel et
l'origine des campagnes ne sont mesurés nulle part. La différence est
qu'on peut désormais s'en croire équipé — le conteneur se charge, le
bandeau s'affiche — alors que rien n'est enregistré.
**Déclencheur :** avant la première campagne payante. Le geste est dans
l'interface de Google Tag Manager, pas dans le code : créer une propriété
GA4, ajouter une balise « Google Analytics : configuration GA4 » avec son
identifiant `G-…`, la déclencher sur *All Pages*, puis **publier** le
conteneur. Le site n'a rien à redéployer.

---

### Aucun profil social n'est déclaré à Google

`siteConfig.social` est vide, et `sameAs` ne figure donc pas dans le
JSON-LD. Il contenait quatre adresses devinées à partir du nom, dont
`instagram.com/zoumani` — le compte personnel d'une personne réelle,
sans lien avec la marque. Retirées le 30 août 2026.

**Ce que ça coûte :** Google ne peut pas relier le site à des profils
officiels, ce qui affaiblit le panneau de connaissances le jour où il
s'en construit un. C'est un manque, pas une faute — contrairement à ce
qui s'y trouvait.
**Déclencheur :** l'ouverture d'un compte réellement contrôlé par
Zoumani. N'ajouter dans `social` qu'une adresse dont on possède les
identifiants : `sameAs` est une déclaration d'identité, pas une liste de
liens.

### Les pages de corridor n'existent pas

L'architecture les accepte : `ENTRY_PAGES` produit les pages d'entrée à
la compilation, et `dynamicParams = false` fait rendre 404 à toute
adresse non déclarée. Ajouter `/envoyer-colis/paris-douala` est une
entrée dans ce tableau, plus le contenu qui va avec.

Elles n'ont pas été créées, et c'est délibéré. Aucun corridor n'est
ouvert : neuf pages qui répéteraient la même promesse en changeant deux
noms de ville seraient du contenu mince, que Google traite comme un
signal de mauvaise qualité **pour le domaine entier**, pas seulement pour
les pages concernées.

**Ce que ça coûte :** les requêtes « envoyer un colis à Douala » ne sont
pas couvertes. C'est le gisement principal du référencement de Zoumani.
**Déclencheur :** un corridor réellement desservi, avec de quoi écrire
une page qui ne ressemble à aucune autre — délais constatés, prix
observés, douane locale, voyageurs présents. Une page par corridor
réel, pas une par combinaison possible.

### Il n'y a pas de fil d'Ariane

Le site est plat : huit pages, toutes à un seul niveau de l'accueil. Un
fil d'Ariane décrirait une profondeur qui n'existe pas.

**Ce que ça coûte :** rien aujourd'hui.
**Déclencheur :** la première page de corridor, qui créera le niveau
`Accueil > Envoyer un colis > Cameroun > Paris–Douala`. Y ajouter alors
un `BreadcrumbList` en JSON-LD, en même temps que le fil visible — jamais
l'un sans l'autre.

## Contenu

### Les badges de magasin ne mènent nulle part

Ils portent la mention « Bientôt », ce qui est honnête, mais restent
inertes. Ils redeviendront des liens le jour de la publication.

**Ce que ça coûte :** rien tant que l'application n'est pas publiée. Le
jour où elle l'est, un badge inerte est une déception à la seconde même
où l'on avait convaincu.
**Déclencheur :** la publication sur l'App Store et Google Play.

### La photo du hero a l'air générée

`public/images/hero/zoumani-airport-campaign.webp` — un homme de dos
devant une baie d'aéroport, sac à dos, valise et carton. Le contre-jour
trop parfait, le carton en équilibre sur la valise et l'absence de tout
détail imparfait la font lire comme une image de synthèse.

Son traitement a été corrigé — désaturée de 28 %, contraste relevé,
cadrée sur sa moitié droite au lieu d'être un fond voilé — ce qui atténue
l'effet sans l'effacer. Le problème restant tient à l'image elle-même,
pas à son affichage.

**Ce que ça coûte :** une plateforme dont le modèle repose entièrement
sur la confiance entre inconnus s'illustre d'une personne qui n'existe
pas. Le visiteur ne le formule pas, mais il le sent — c'est exactement
le registre où une image de synthèse se paie.
**Déclencheur :** une vraie photographie disponible. Trois voies, par
coût croissant : une banque libre de droits (Unsplash, Pexels — licence
commerciale, gratuit), une banque payante (Stocksy, Adobe Stock), ou une
prise de vue avec de vrais utilisateurs le jour où il y en a. La
troisième est la seule qui donne une image que personne d'autre n'a.
**Contrainte de remplacement :** format paysage, sujet décalé à droite
du cadre (la moitié gauche est recouverte par le texte sur grand écran),
WebP sous 120 Ko, 1600 px de large minimum. C'est un remplacement de
fichier à chemin identique, rien d'autre à toucher.

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
