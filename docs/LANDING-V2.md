# Zoumani — proposition de landing V2

Proposition du 6 octobre 2026. **Le Hero est validé et intégré à `/`, en FR/EN.**
Les autres sections de l’accueil sont conservées.
La proposition se visite sur `/preview/v2`, avec un lien de comparaison vers `/`.
Elle est statique, `noindex, nofollow`, et absente du sitemap.

## Intégration du Hero validé

Marc a validé la photo et la disposition du Hero, puis demandé le commit et le
push sur la version de base. Le dépôt et GitHub `main` pointaient sur `2aa85be`
avant cette intégration ; le contenu et le CSS de l’accueil en ligne sur
`https://zoumani.fr` correspondaient à cette base.

Seul le Hero reprend la proposition : photo arrondie, téléphone superposé,
carte de trajet d’exemple, promesse et actions. La navigation, le choix FR/EN,
les indicateurs, les partenaires, la carte, les chapitres, le fonctionnement,
le réseau, la FAQ, le téléchargement et le footer restent ceux du site existant.

En production, « Envoyer un colis » rejoint `#envoyer`, « Je voyage » rejoint
`#voyager`, et le lien entreprise rejoint `#entreprises`. La recherche de la
preview et son offre de 10 expéditions ne sont pas intégrées à l’accueil.
Les CTA passent par l’unique écouteur existant, avec le rôle de leur public.
Le sitemap date la modification de l’accueil au 6 octobre 2026.

Fichiers de production modifiés : `hero/hero.tsx`, `hero/hero.module.css`,
`home-content.ts` (uniquement le Hero FR/EN), `hero-section.tsx`,
`page-instrumentation.tsx` et `src/app/sitemap.ts`. Les tests existants couvrent
le maintien des sections, le basculement en anglais, le mobile 320–430 px et
les trois actions du Hero avec une seule mesure par clic.

Vérifications après intégration : TypeScript, lint (aucune erreur, avertissement
préexistant dans `src/app/error.tsx`), 67 tests unitaires, 13 parcours Playwright
et build de production réussis. Toutes les routes restent statiques. Captures
FR/EN sur desktop, mobile 390 px et contrôle de largeur à 320, 360, 390, 430,
600, 768, 1024 et 1440 px : aucune erreur JavaScript, aucun débordement,
images chargées, CTA de 52 px et lien entreprise de 44 px.

## Audit rapide

Le dépôt utilisé est `zoumani-landing` (`Youorus/Zoumani-Frontend`). Le dossier
voisin nommé `zoumani-frontend` contient Postly et n’est pas la source de ce travail.

L’identité actuelle est conservée : orange Teranga, soleil africain, sable,
ébène, logo et symbole existants, Bricolage Grotesque pour les titres, Manrope
pour le texte. Aucun changement à `tokens.css`, aux polices ou à la charte mobile.

L’accueil de départ assemble un Hero, des indicateurs, des logos de réseaux, une carte
Europe–Afrique, trois chapitres par public, deux parcours de fonctionnement,
le réseau, dix questions de FAQ, un téléchargement final et un grand footer.

| Observation | Conséquence | Proposition |
|---|---|---|
| Le Hero privilégie le téléchargement et répète trois chiffres du bandeau suivant. | L’émotion et l’action « envoyer » passent au second plan. | Promesse émotionnelle, deux actions explicites, photo et capture produit. |
| Le chapitre expéditeur et les étapes réexpliquent le choix du voyageur, la réservation et le suivi. | Le visiteur relit le même parcours. | Recherche, trois étapes et trois bénéfices. |
| Logos, carte Europe–Afrique et réseau occupent trois sections. | Beaucoup de contenu avant les parcours utiles. | Exemples de destinations dans la recherche ; détails conservés sur les pages actuelles. |
| Le fonctionnement voyageur répète le chapitre voyageur. | Une seconde explication après la promesse. | Un seul bloc voyageur : kilos, tarif, choix et CTA. |
| Le bloc entreprise contient six bénéfices et l’offre à 60 jours revient dans la FAQ. | L’offre centrale se dilue. | Une promesse de valeur, un quota unique, quatre étapes courtes. |
| Les chiffres sont déclarés dans le contenu sans justificatifs dans ce dépôt. | Le code seul ne certifie pas une preuve commerciale. | Aucun chiffre, avis ou logo partenaire ajouté ; seule la carte d’activité porte des exemples explicitement signalés. |
| Les logos d’assureurs sont affichés alors que l’assurance est à l’étude. | La nuance textuelle est loin de l’impression visuelle. | Retirer ce bloc de la proposition ; conserver les explications dans l’actuelle. |
| Le footer répète la promesse et le téléchargement, avec un grand mot-logo. | Beaucoup de hauteur après le dernier CTA. | Footer compact avec parcours et informations légales. |

Le Hero de départ utilisait **déjà** la photo souriante et une capture de l’app.
La V2 et le Hero intégré réutilisent ces assets. Elle n’utilise pas l’inclinaison au pointeur, les
orbites animées, le défilement continu ni les révélations au scroll de l’actuelle.
Le contenu apparaît directement, même sans JavaScript.

### Conserver

- Identité, logo, polices, photographie existante et capture de Zoumani.
- Trois publics et CTA propres à chacun.
- Choix des solutions, informations utiles et étapes de fonctionnement.
- Pages `/envoyer-un-colis`, `/proposer-un-voyage`, pages légales et FAQ complète actuelle.
- App Store, configuration Google Play, WhatsApp, consentement et mesure existants.

### Fusionner

- Chapitre expéditeur + fonctionnement expéditeur → recherche, trois étapes et bénéfices.
- Chapitre voyageur + fonctionnement voyageur → une section concise.
- Carte + corridors → exemples de destinations dans la recherche.
- Réseau + informations produit → bénéfices concis et détails accessibles par les pages existantes.

### Retirer de la proposition ou déplacer après validation

- Chiffres répétés, logos exploratoires et défilement des 34 corridors.
- Grands textes introductifs et répétitions de téléchargement.
- Vérification, points relais, paiement et assurance : conserver leurs détails
  sur les pages par intention ou une FAQ dédiée avant le remplacement final.
- L’offre « 60 jours » reste dans l’actuelle pour comparaison ; elle n’apparaît
  pas dans la V2. Le nouveau quota ne change ni facturation ni conditions réelles.

**Les sections SEO après le Hero sont conservées.** Avant
remplacement du reste de la page, décider de la destination de chaque contenu utile et aligner
FAQ/HowTo avec le contenu réellement affiché.

## Architecture et copywriting

| Section | Question | Message / action |
|---|---|---|
| Hero | C’est quoi ? | **Vos colis voyagent. Vos liens restent proches.** |
| Recherche | Où envoyer ? | **Où va votre colis ?** Départ → destination → consulter les trajets dans l’app. |
| Fonctionnement | Comment ? | **Le bon trajet. La bonne personne.** Trouvez votre trajet ; choisissez qui l’emporte ; gardez le lien. |
| Bénéfices | Pourquoi ? | **Moins de distance. Plus de confiance.** Le choix vous appartient ; des profils à consulter ; tout au même endroit. |
| Voyageurs | Qu’est-ce que j’y gagne ? | **Vos kilos libres ont de la valeur.** Publiez votre trajet et valorisez la place disponible dans votre valise. |
| Entreprises de fret | Pourquoi rejoindre ? | **On vous apporte d’abord des clients.** À nous de vous prouver notre valeur. Ensuite, vous choisissez votre formule partenaire. |
| Clarté / FAQ | Que savoir avant ? | **L’essentiel, en toute clarté.** Disponibilité, tarif et contenu autorisé. |
| CTA final | Que faire ? | **Votre prochain colis commence ici.** Rechercher un trajet. |
| Footer | Où aller ensuite ? | Parcours, FAQ actuelle et liens légaux. |

Sous-titre du Hero : « Trouvez un voyageur ou une entreprise de fret pour vos
colis. Vous voyagez ? Valorisez vos kilos libres. »

- **Envoyer un colis** → recherche dans la page.
- **Je voyage** → section voyageurs.
- **Je suis une entreprise de fret** → section entreprise.
- **Publier un voyage** → application via la destination App Store existante.
- **Rejoindre le réseau Zoumani** → contact WhatsApp existant.

## Direction visuelle

Hero : fond ébène, titre crème et orange, photo humaine principale dans un
cadre arrondi, téléphone superposé avec la capture réelle existante et
carte « Exemple de trajet : Paris → Douala ». Aucun statut de livraison ou
résultat présenté comme un trajet réellement disponible.
La photo est celle déjà créditée dans `public/images/hero/CREDITS.md`.
Elle reste remplaçable à un seul endroit : `PREVIEW_ASSETS.hero`.

Voyageur : réemploi du visuel aéroport dans un bloc jaune. Cet asset est une
illustration de campagne ; son remplacement par une vraie photographie reste
une décision distincte, déjà documentée dans `PLUS-TARD.md`.

B2B : promesse à gauche, exemple d’espace partenaire crème à droite. Le quota
vient uniquement de `PARTNER_OFFER.complimentaryShipments`, initialement 10.
Le dashboard montre 7/10, 7 clients, 7 expéditions et 840 €, avec les mentions
« DÉMONSTRATION » et « Toutes les valeurs de cette carte sont des données de
démonstration ». Il ne lit aucun compte partenaire ou chiffre d’activité réel.

« Sans abonnement » est plus précis que « transport offert » : le transport
conserve les tarifs de l’entreprise. Le quota compte les expéditions
**finalisées et apportées par Zoumani**. L’offre est signalée comme proposée,
à valider. Cette page n’active aucune formule payante automatiquement.

Sur mobile : titre, explication et CTA avant la photo ; photo et aperçu app
restent présents ; chaque bloc devient une colonne. Aucun carrousel. Champs
à 16 px, CTA principaux d’au moins 44 px, contrôles natifs, focus visible,
FAQ utilisable avec Entrée et respect de `prefers-reduced-motion`.

## Fonctionnalités et conversion

L’app possède la recherche, les trajets/capacités, la messagerie et le suivi
(`zoumani_app/src/features/recherche`, `trajets`, `messagerie`, `suivi`).
La vitrine n’a pas de recherche connectée. La preview permet de choisir un
corridor, vérifie départ ≠ destination et propose d’ouvrir l’app. Elle ne simule
ni offre, prix, réservation, inscription ni enregistrement. Les villes sont
des exemples locaux, pas une déclaration de couverture. Le lien store ne
préremplit pas le trajet : le message invite explicitement à le saisir dans l’app.

Le lien App Store est repris de `hero/store-badges.tsx`. Google Play n’est
affiché que si sa variable d’URL est configurée ; sinon la preview propose
d’être prévenu via le contact actuel.

`/preinscription` est actuellement redirigée vers `/`. Les événements du tunnel
existent encore mais ne prouvent pas une inscription dans l’app. Mesurer les
débuts/fins d’inscription **dans le produit mobile** demande de vérifier
l’attribution entre le site, les stores et l’app. Aucune conversion fictive
n’a été ajoutée à la vitrine.

| Action | Événement existant | Identification |
|---|---|---|
| Envoyer un colis | `cta_clicked` | `v2-hero-sender`, rôle `sender` |
| Je voyage | `cta_clicked` | `v2-hero-traveler`, rôle `traveler` |
| Rejoindre le réseau | `cta_clicked` | `v2-join-business`, rôle `business` |
| App Store | `cta_clicked` | CTA `*-apple` ou publication voyageur |
| Google Play si disponible | `cta_clicked` | `v2-download-play` |
| Première interaction recherche | `route_started` | Départ, destination, rôle `sender` |
| Soumission d’un corridor valide | `route_completed` | Départ, destination, rôle `sender` |
| Préinscription existante | `contact_started`, `prelaunch_submit`, `prelaunch_success` | Inchangés ; tunnel actuellement retiré |

Les événements de la proposition portent `landing_variant=v2` et `preview=true`.
Un seul écouteur suit les CTA. Aucun appel direct à GA4, Meta ou Clarity : tout
passe par `events.ts`. Le layout, le consentement et l’attribution UTM restent
en place. Exclure la route preview des rapports de conversion réels.

## Vérifications de la proposition initiale

- TypeScript : réussite.
- ESLint : aucune erreur ; un avertissement préexistant dans `src/app/error.tsx`.
- Vitest : **68 tests réussis**.
- Playwright : **8 tests existants réussis et 4 tests V2 réussis**.
- Build de production : réussite, `/preview/v2` et `/` statiques ; aucune route dynamique.
- Captures desktop 1440 px et mobile 390 px ; aucune erreur JavaScript observée.
- Pas de débordement horizontal aux largeurs 320, 360, 390, 430, 600, 768, 1024 et 1440 px.
- `next/image`, dimensions réservées, Hero eager avec priorité haute, autres
  photographies et badge final en lazy loading ; aucun nouvel asset lourd.
- Mesure locale mobile, sans régies externes configurées, DPR 2, latence 150 ms,
  débit 1,6 Mb/s et CPU ×4 : LCP
  environ **1,15 s**, CLS **0,00019**. Observation en laboratoire sur serveur
  local, pas une mesure terrain ou une garantie de production.

| Largeur | Base avant intégration du Hero | Proposition complète | Réduction |
|---|---:|---:|---:|
| Desktop 1440 px | 10 812 px | 4 142 px | 61,7 % |
| Mobile 390 px | 14 745 px | 5 560 px | 62,3 % |

L’accueil original conserve metadata, canonical, Open Graph, Twitter,
structured data, sitemap, robots, tracking et consentement. La preview a
ses propres metadata et ne crée pas une deuxième page d’accueil indexable.

## Fichiers de la proposition

- `src/app/(marketing)/preview/v2/page.tsx` — route, metadata et noindex.
- `src/features/home-preview/components/landing-preview.tsx` — assemblage serveur et copywriting.
- `src/features/home-preview/components/landing-preview.module.css` — styles isolés et responsive.
- `src/features/home-preview/components/preview-search.tsx` — interaction locale et passage à l’app.
- `src/features/home-preview/components/preview-instrumentation.tsx` — façade analytics existante.
- `src/features/home-preview/model/preview-config.ts` — quota, données de démonstration et assets.
- `e2e/landing-preview.spec.ts` — quatre parcours de validation.
- `docs/LANDING-V2.md` — audit, arbitrages, vérifications et limites.

`README.md` et `docs/PLUS-TARD.md` documentent l’accès et les décisions en attente.

## Fichiers à traiter pour le remplacement final, après validation

1. `src/app/(marketing)/page.tsx` : assembler la version validée, garder les
   metadata de l’accueil et aligner JSON-LD sur les sections réellement affichées.
2. `src/features/home-preview/components/landing-preview.tsx` et son CSS : retirer
   le bandeau de proposition en production ; finaliser photographie et CTA.
3. `src/features/home-preview/model/preview-config.ts` : valider quota et offre.
   Le dashboard reste un exemple explicite ou est retiré.
4. `src/features/home/components/home-content.ts` : harmoniser FR/EN et retirer
   « 60 jours » de toutes les copies encore utilisées, y compris la FAQ.
5. `src/features/home/components/page-instrumentation.tsx` et/ou l’instrumentation
   V2 : conserver une seule instance et une seule nomenclature sur l’accueil final.
6. `src/features/prelaunch/model/entry-pages.ts` : accueillir les détails SEO
   utiles par intention et aligner les affirmations sur le produit ouvert.
7. Éventuelle FAQ dédiée, décidée avant de retirer les réponses longues : nouvelle
   route, metadata et structured data propres. Aucune route de ce type créée ici.
8. `src/app/sitemap.ts` : redater un futur changement de l’accueil ; intégrer une FAQ
   dédiée seulement si validée. La preview reste exclue.
9. `e2e/home-shell.spec.ts`, `e2e/landing-preview.spec.ts` et
   `src/features/home/components/__tests__/home-content.test.ts` : adapter les
   assertions au contenu final et vérifier le maintien du français/anglais.
10. `README.md`, `docs/LANDING-V2.md`, `docs/PLUS-TARD.md` : consigner la décision.

La proposition complète est française pour la revue. Le Hero et l’accueil
de production restent bilingues. Le reste de la V2 demande sa version anglaise
avant un éventuel remplacement.
La charte, les polices, les consentements et les connecteurs analytics ne
nécessitent pas de changement pour cette direction. Le quota commercial réel
relève du produit/backend et demande une validation métier séparée.
