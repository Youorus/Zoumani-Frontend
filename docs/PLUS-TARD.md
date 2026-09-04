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

### BIMI est préparé, mais bloqué en amont

`public/bimi/logo.svg` existe et respecte le profil SVG Tiny PS exigé :
`version="1.2"`, `baseProfile="tiny-ps"`, `<title>`, cadre carré, aucun
élément interdit, aucune référence externe, 25,5 ko — sous la limite
conseillée de 32 ko. Il est servi sur
`https://zoumani.fr/bimi/logo.svg`.

L'enregistrement DNS n'a **pas** été créé, et ce n'est pas un oubli.
BIMI exige une politique DMARC **à l'application** — `p=quarantine` ou
`p=reject`, avec `pct=100`. `zoumani.fr` est à `p=none`, qui observe
sans rien bloquer : un enregistrement `default._bimi` posé maintenant
échouerait à la validation de tous les fournisseurs, et donnerait
l'illusion que la chose est faite.

Et l'application de DMARC suppose elle-même DKIM, qui n'est pas activé
sur le domaine — aucun sélecteur n'est publié.

**Ce que ça coûte :** rien aujourd'hui. Le logo dans la liste des
messages est un signal de légitimité, pas une fonction.
**Déclencheur :** l'ordre est contraint, et l'inverser coupe les envois.
1. Activer DKIM chez OVH.
2. Observer les rapports DMARC deux à quatre semaines.
3. Passer `p=quarantine`, puis `p=reject`.
4. Alors seulement créer `default._bimi.zoumani.fr`.

**Réserve :** Gmail et Apple Mail n'affichent le logo qu'avec un VMC —
un certificat adossé à une **marque déposée**, facturé de l'ordre de
1 000 à 1 500 € par an. Sans dépôt de la marque Zoumani, l'affichage
restera limité aux fournisseurs acceptant le BIMI auto-déclaré, ce qui
exclut la majorité des destinataires.

### `prelaunch_success` n'est pas marqué comme événement clé

GA4 mesure depuis le 30 août 2026 : `G-DYN8TLDTJ0` est posé en direct,
et les événements du tunnel arrivent — vérifié sur le trafic réel,
`prelaunch_success` compris, avec ses paramètres `intent_role`,
`origin`, `destination` et `already_known`.

Il n'est pas marqué **événement clé** dans GA4. Il compte donc comme un
événement ordinaire, pas comme une conversion.

**Ce que ça coûte :** les rapports d'acquisition n'affichent aucun taux
de conversion, et aucune campagne payante ne pourra optimiser sur cet
objectif — c'est précisément ce pour quoi la mesure a été posée.
**Déclencheur :** immédiat, et c'est trois clics. GA4 → Admin →
Événements clés → activer `prelaunch_success`. Reporté par Marc le
30 août 2026, et **toujours à faire au 4 septembre 2026** : c'est la
dernière action hors code avant le micro-test.

### GTM a été retiré au profit de GA4 direct

`NEXT_PUBLIC_GTM_ID` valait `GTM-PMJC9J5Q`, mais le conteneur est resté
vide — `gtm.js` renvoyait `"tags":[]`. La balise ne pouvant être créée
que depuis l'interface Google, GA4 a été branché directement, par
`NEXT_PUBLIC_GA_MEASUREMENT_ID`.

Le code garde les deux chemins et la règle qui les sépare : GTM l'emporte
quand il est configuré, sinon `gtag` reçoit. Elle vaut pour le chargement
**et** pour l'émission des événements — `gtag.js` ignore la forme
`{ event: "..." }` que comprend GTM.

Le pixel Meta a été posé le 4 septembre 2026 **sans** GTM, par un
composant dédié (`components/analytics/meta-pixel.tsx`), sur le modèle de
Clarity. C'était le choix le moins risqué avant une campagne : rebrancher
GTM aurait fait changer de convention d'émission aux dix-huit événements
du tunnel, et il aurait fallu tout revérifier.

**Ce que ça coûte :** un troisième pixel — TikTok, Google Ads — demandera
soit un composant de plus, soit la bascule vers GTM, et un redéploiement
dans les deux cas.
**Déclencheur :** une deuxième régie publicitaire. Reposer
`NEXT_PUBLIC_GTM_ID`, retirer `NEXT_PUBLIC_GA_MEASUREMENT_ID`, déplacer
la balise GA4 et le pixel dans le conteneur — le code bascule seul, mais
la vérification des dix-huit événements est à refaire.

### Le suivi des pages repose sur un réglage de la propriété GA4

Le site est une application à navigation client, et il paraît évident
qu'il faille émettre soi-même un `page_view` à chaque changement de
route. On l'a écrit, puis retiré : la mesure a montré que **GA4 le fait
déjà**, par sa « mesure améliorée ». Il l'envoie simplement en différé,
au premier signal d'engagement qui suit la navigation — reconnaissable au
paramètre `ae=a`. Une observation trop courte après le clic ne le voit
pas.

Vérifié le 4 septembre 2026 sur les deux versions : la production, sans
aucun appel manuel, émet bien un `page_view` portant
`dl=https://zoumani.fr/preinscription?type=sender` ; la version locale
avec l'appel manuel en émettait **deux** pour la même page.

Le suivi dépend donc de : Admin › Flux de données › Mesure améliorée ›
« Changements de page basés sur les événements de l'historique du
navigateur ». Il est actif.

**Ce que ça coûte :** si quelqu'un le désactive, `/preinscription`
disparaît des rapports de pages sans que rien n'échoue. Le tunnel, lui,
resterait mesuré : `prelaunch_view` et `funnel_step_viewed` partent
immédiatement et ne dépendent d'aucun réglage.
**Déclencheur :** constater que les navigations n'apparaissent plus.
`page()` reste exportée dans `lib/marketing/events.ts` ; il suffit de la
rebrancher dans `AnalyticsRuntime`, avec une garde sur le premier
passage.

### La Conversions API de Meta n'est pas branchée

Le pixel envoie `Lead` avec un `eventID` — l'identifiant de la
préinscription rendu par le serveur. C'est exactement celui que la
Conversions API réutiliserait, et le poser maintenant coûtait une chaîne
de caractères.

Rien d'autre n'est fait : ni route serveur, ni jeton, ni envoi.

**Ce que ça coûte :** les conversions perdues par les bloqueurs de
publicité et par l'ITP d'iOS ne remontent pas. Sur un test à 25 €, le
volume ne permettrait de toute façon rien d'en conclure.
**Déclencheur :** une campagne qui dépasse quelques centaines d'euros, ou
un écart constaté entre les leads en base et les `Lead` vus par Meta. Le
backend stocke déjà `fbclid` sur chaque préinscription : c'est la moitié
du travail.

### Le choix de consentement n'expire pas

`zoumani.consent.v2` reste dans le navigateur jusqu'à ce que la personne
efface les données du site. La CNIL recommande de reposer la question au
bout de six mois ; rien ne le fait, et la page `/cookies` le dit
désormais tel quel plutôt que d'annoncer une durée qu'on ne tient pas.

**Ce que ça coûte :** un manquement à une recommandation, pas à une
obligation. Mais c'est aussi un consentement qui vieillit sans être
revalidé, et l'on ne peut pas prouver qu'il est encore éclairé.
**Déclencheur :** peu de travail — un horodatage dans la valeur stockée,
et `readConsent` qui rend `null` au-delà de six mois. À faire avant que
la première cohorte de visiteurs n'atteigne cet âge, soit mars 2027.

### La section des logos partenaires est masquée, pas supprimée

`AFFICHER_PARTENAIRES` vaut `false` dans
`features/home/components/hero-section.tsx`. La section montrait treize
marques — La Poste, DHL, UPS, FedEx, AXA, Allianz… — sous « Zoumani
s'appuie sur les acteurs de l'acheminement et de l'assurance », alors
qu'aucun partenariat n'est conclu. L'avertissement existait, en petit et
sous les logos.

Une régie refuse une annonce dont la page laisse croire à un partenariat
qui n'existe pas, et le refus tombe à l'examen de l'annonce — au moment
précis où l'on veut lancer.

**Ce que ça coûte :** la page perd un argument de réassurance, qui n'en
était pas vraiment un puisqu'il n'était pas vrai.
**Déclencheur :** un partenariat réellement signé. Repasser la valeur à
`true`, ne garder que les marques concernées, et réécrire le titre pour
qu'il dise ce qui est.

### Les pages d'entrée ne mesurent toujours pas les clics

`/envoyer-un-colis` et `/proposer-un-voyage` retiennent désormais
l'attribution — `AnalyticsRuntime` s'en charge pour toutes les pages —
mais elles n'ont ni `PageInstrumentation`, ni `data-cta` sur leur bouton.
On sait donc qu'une visite y arrive, et qu'elle finit ou non en
préinscription, mais pas où elle s'arrête sur la page elle-même.

**Ce que ça coûte :** si une créa vise ces pages et convertit mal, on ne
saura pas si le bouton n'a pas été vu ou pas été voulu.
**Déclencheur :** une campagne qui les vise. Pour le premier test, toutes
les annonces pointent sur `/`, où la mesure est complète.

### Trois événements d'intention ne se déclenchent presque jamais

`intent_selected`, `sender_selected` et `traveler_selected` n'existent
que si l'on arrive sur `/preinscription` **sans** `?type=`. Or les cinq
liens du site le portent. `route_started` est par ailleurs émis dans le
même effet que `prelaunch_view`, et `contact_started` dans le même clic
que `details_completed` : deux noms pour un seul fait, chaque fois.

Ils sont conservés tels quels, délibérément : les renommer ou les
supprimer couperait en deux l'historique GA4 commencé le 30 août.

**Ce que ça coûte :** une taxonomie qui porte trois événements morts et
deux doublons, dans laquelle quelqu'un finira par définir une audience
qui renverra zéro.
**Déclencheur :** la fin du micro-test, quand on saura quels événements
servent réellement. C'est le moment de renommer, pas avant.

### Le jeton d'export Clarity doit être révoqué

Un jeton d'API *Data Export* Clarity a été généré le 30 août 2026 et
transmis dans une conversation. Le site n'en a **aucun besoin** : seul
`NEXT_PUBLIC_CLARITY_PROJECT_ID` sert au chargement. D'après son
contenu, il n'expire qu'en 2126.

**Ce que ça coûte :** un jeton d'export en circulation donne accès aux
enregistrements de session à qui le détient, pour un siècle.
**Déclencheur :** immédiat. Clarity → Settings → Data Export → révoquer.
N'en générer un que le jour d'un export réel vers un outil tiers.

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
