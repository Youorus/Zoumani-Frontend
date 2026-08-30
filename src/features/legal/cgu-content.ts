/**
 * Le texte des conditions générales.
 *
 * ═══ Il est recopié, et c'est délibéré ═══
 *
 * La source vit dans `zoumani_api/docs/CGU.md`, à côté du code dont elle
 * décrit les règles : c'est là qu'on la corrige quand une règle change,
 * et c'est là qu'on vérifie qu'un article dit vrai.
 *
 * Ce fichier en est la copie publiée. Le lien entre les deux est humain,
 * pas mécanique — et c'est le prix de deux dépôts séparés. Une règle
 * modifiée côté serveur se recopie ici dans le même commit.
 *
 * ═══ Ce qui n'est pas publié ═══
 *
 * La section 14 du document source recense les règles **décidées mais
 * pas encore exécutoires** — l'assurance, le gel des sommes après
 * enquête, le retour d'un colis non conforme. Les publier créerait un
 * engagement que le code ne tient pas. Elle est retirée à la copie, et
 * les renvois qui la visaient avec.
 *
 * ⚠️ Ce texte n'a pas été relu par un juriste. Plusieurs clauses
 * engagent la plateforme et doivent l'être.
 */

export const CGU_VERSION = "2026-08-v2";
export const CGU_UPDATED = "30 août 2026";

export const CGU_MARKDOWN = `## 1. Objet

Zoumani met en relation deux personnes : **un voyageur**, qui dispose
d'espace libre dans ses bagages sur un trajet donné, et **un
expéditeur**, qui souhaite faire acheminer un colis sur ce trajet.

Zoumani est un **intermédiaire technique**. La plateforme n'est ni
transporteur, ni commissionnaire de transport, ni dépositaire des colis.
Elle n'a à aucun moment la garde matérielle des biens acheminés.

### 1.1 Il n'existe qu'un seul type de compte

Personne n'« est » voyageur ou expéditeur. Ces mots désignent une
**position dans une transaction**, jamais une qualité de la personne :
un même compte est le voyageur d'un trajet et l'expéditeur d'un envoi.

---

## 2. Le compte

### 2.1 Création

Un compte se crée par adresse e-mail, par Apple ou par Google. Dans les
trois cas, la preuve de possession de l'identifiant ouvre le compte.

Un compte n'est **utilisable** qu'une fois renseignés :

- un prénom et un nom d'affichage ;
- l'acceptation des présentes conditions ;
- l'acceptation de la politique de confidentialité.

Tant que l'un manque, le compte existe mais n'ouvre aucune
fonctionnalité.

### 2.2 Le consentement est daté et versionné

Chaque acceptation conserve **la version acceptée et l'instant de
l'acceptation**, horodaté par le serveur. Une acceptation n'est jamais
réécrite : la mise à jour des présentes conditions donne lieu à une
nouvelle acceptation, sans effacer la précédente.

### 2.3 Vérification d'identité

Publier un trajet ou envoyer un colis exige une identité vérifiée. La
vérification est **distincte** de la création du compte : une connexion
par Apple ou Google atteste un identifiant, jamais une identité.

L'adresse déclarée lors de la vérification détermine la position
géographique du compte, qui conditionne le mode de remise (§5.2).

### 2.4 Suppression

Le compte se supprime à tout moment depuis les réglages. La suppression
est **refusée** tant que subsiste :

- un acheminement en cours, dans l'un ou l'autre rôle ;
- une expédition payée non encore prise en charge ;
- des gains non versés, dont le montant est alors indiqué.

Après suppression, les données personnelles sont effacées et l'historique
des transactions est anonymisé. Une nouvelle inscription reste possible
avec la même adresse.

---

## 3. Le voyage

### 3.1 Déclaration et vérification

Le voyageur déclare un vol : compagnie, numéro, date, aéroports. La
plateforme le confronte au programme des vols. À défaut de source
automatique exploitable, une vérification humaine intervient sur pièces
— billet électronique ou carte d'embarquement.

Un trajet non vérifié ne peut recevoir aucun colis.

### 3.2 Limite

Un voyageur ne peut avoir plus de **dix trajets en cours** simultanément.
Cette limite est un garde-fou contre les publications de masse ; elle
n'est pas négociable au cas par cas.

### 3.3 Offre de transport

Le voyageur publie l'espace qu'il propose, en kilogrammes, et fixe
**lui-même** ses tarifs par catégorie de contenu — au kilo ou à la pièce.
Zoumani n'impose ni prix, ni catégorie obligatoire.

Il indique également s'il accepte la **remise en main propre** (§5.2).

### 3.4 Annulation

Un trajet s'annule tant qu'aucun colis n'y est réservé. Dès qu'un
expéditeur a payé, l'annulation est **refusée** : le voyageur peut
retirer son offre de la recherche pour ne plus recevoir de nouveaux
colis, mais il reste engagé envers ceux déjà réservés.

---

## 4. L'expédition

### 4.1 Déclaration du contenu

L'expéditeur déclare le contenu de son colis par catégorie, avec sa
quantité ou son poids, et joint **au moins trois photographies par
catégorie déclarée**.

**Cette déclaration engage l'expéditeur.** Elle est conservée et sert de
référence en cas de litige (§9). Déclarer un contenu différent de celui
effectivement remis constitue un manquement grave.

### 4.2 Contenus interdits

Est interdit tout bien dont le transport ou la possession est prohibé,
réglementé ou soumis à autorisation, et notamment : stupéfiants, armes et
munitions, espèces protégées, matières dangereuses, inflammables ou
corrosives, produits contrefaits, numéraire, et denrées périssables.

L'expéditeur est **seul responsable** de la licéité de ce qu'il confie, y
compris au regard des règles douanières du pays de destination.

### 4.3 On n'expédie pas avec soi-même

Une même personne ne peut être à la fois l'expéditeur et le voyageur d'un
acheminement.

---

## 5. La remise du colis

### 5.1 Deux parcours

Selon le mode retenu, le colis suit l'un des deux parcours suivants, qui
ne se croisent jamais :

| Livraison | Main propre |
|---|---|
| dépôt · transit · en livraison · livré · réception confirmée | rendez-vous convenu · remise en main propre |

En livraison, l'expéditeur dépose le colis dans un point relais proche de
chez lui ; le transporteur l'achemine **jusqu'à l'adresse du voyageur**.
Celui-ci n'a rien à aller chercher.

Deux faits distincts closent ce parcours : le transporteur **atteste
avoir livré**, puis le voyageur **confirme avoir reçu**. C'est cette
seconde déclaration, et elle seule, qui vaut attestation de conformité du
contenu.

Les deux se terminent de la même façon : **arrivée du voyageur**, puis
**remise au destinataire**.

### 5.2 Le mode dépend de la distance, et du temps

**La distance.** Au-delà de **30 kilomètres** entre les adresses
vérifiées des deux personnes, le passage par un transporteur partenaire
est imposé et la remise en main propre n'est pas proposée. En deçà, elle
l'est si le voyageur l'a acceptée dans son offre.

**Le temps.** L'acheminement demande **trois jours**. Un vol qui part
plus tôt ferme la livraison : seule la remise en main propre reste
ouverte. Entre trois et cinq jours, elle reste possible mais l'écran le
signale comme serré.

Le temps prime sur la distance : une distance rend la rencontre
déraisonnable, un vol imminent la rend obligatoire — l'autre voie
n'existe plus.

Si le voyageur refuse par ailleurs la rencontre, aucune voie ne subsiste
et l'envoi ne peut pas se faire avec lui.

### 5.3 Le rendez-vous, en main propre

Le **voyageur propose** de un à cinq créneaux, chacun d'une durée
comprise entre quinze minutes et quatre heures, avec au moins une heure
de préavis et se terminant avant le départ du vol. L'**expéditeur en
retient un**.

L'expéditeur peut à tout moment retenir un autre créneau proposé ; le
précédent est alors libéré. Il n'existe pas de geste d'annulation qui
laisserait l'acheminement sans rendez-vous.

### 5.4 La remise se constate à deux

Le parcours ne franchit l'étape de remise que lorsque **les deux**
personnes l'ont déclarée : le voyageur qu'il a reçu le colis,
l'expéditeur qu'il l'a remis. L'ordre est libre.

Tant que l'une des deux n'a pas déclaré, l'acheminement reste en attente.
**Zoumani ne tranche pas** à la place des parties : la messagerie reste
ouverte, et le blocage se lève par l'accord des deux.

### 5.5 Attestation de conformité

En recevant le colis — en main propre comme au point relais — le voyageur
**atteste que son contenu correspond à ce que l'expéditeur a déclaré et
photographié**. Cette attestation est horodatée et conservée.

S'il constate le contraire, il ne déclare pas la remise : il signale un
incident (§9).

---

## 6. Prix et paiement

### 6.1 Composition du prix

Le montant réglé par l'expéditeur se compose de :

1. la **rémunération du voyageur**, fixée par lui dans son offre ;
2. le cas échéant, les **frais de transport** du partenaire, en point
   relais uniquement ;
3. les **frais de service Zoumani**, soit **15 %** des deux premiers
   postes, avec un minimum de **1,49 €**.

Aucune prime d'assurance n'y figure : aucun contrat n'est souscrit à ce
jour.

Tous les montants sont affichés toutes taxes comprises avant paiement.

### 6.2 Encaissement

Le paiement s'effectue par carte, auprès de notre prestataire. Zoumani ne
conserve aucune donnée de carte bancaire.

**L'espace est retenu dès la déclaration du colis**, pour une durée
limitée, puis réservé au paiement. Sans cette retenue, deux personnes
traverseraient le même parcours pour la même place et la seconde
paierait pour rien.

Une retenue qui expire libère la place sans préavis : elle ne vaut pas
réservation.

### 6.3 Annulation par l'expéditeur

Tant que le colis n'a pas été pris en charge — ni déposé au relais, ni
remis en main propre — l'expéditeur peut annuler. Le remboursement porte
sur l'intégralité des sommes **à l'exception des frais de service**, la
place ayant été bloquée et le voyageur engagé.

Passée la prise en charge, l'annulation est refusée : le colis circule.

---

## 7. La rémunération du voyageur

### 7.1 Elle est acquise à la livraison

Le gain du voyageur est **réalisé au moment de la remise au
destinataire**, et à ce moment seulement. Ni la prise en charge du colis,
ni le départ, ni l'arrivée ne l'acquièrent : la plateforme ne paie pas un
service à moitié rendu.

### 7.2 Versement

Le voyageur demande le versement de ses gains disponibles dès qu'ils
atteignent **10 €**. Le versement s'effectue par virement, sur un compte
bancaire dont il est titulaire, dans la zone SEPA.

Les coordonnées bancaires sont **chiffrées** au repos et ne sont jamais
affichées en clair, ni dans l'application, ni dans les journaux, ni dans
les messages d'erreur.

---

## 8. Obligations du voyageur

Le voyageur s'engage à :

- n'accepter que des colis dont il a pu vérifier le contenu ;
- transporter le colis avec la diligence d'une personne raisonnable ;
- déclarer sincèrement les étapes du parcours ;
- signaler tout incident plutôt que de rester silencieux ;
- respecter les règles douanières et de transport aérien applicables.

Il demeure **personnellement responsable**, au regard des autorités, du
contenu de ses bagages. L'attestation de conformité (§5.5) est le moment
prévu pour refuser ce qui ne lui convient pas.

---

## 9. Incidents et litiges

### 9.1 Signalement

Chacune des deux parties peut signaler un incident depuis le suivi du
colis, à un moment qui lui est propre :

- le **voyageur**, tant qu'il détient le colis : contenu différent de ce
  qui était déclaré, quantité non conforme, colis endommagé, contenu
  interdit ;
- l'**expéditeur**, après la livraison : colis jamais reçu, arrivé
  endommagé, contenu incomplet, voyageur resté injoignable.

### 9.2 Les preuves sont obligatoires

Un signalement comporte un motif, une explication et **au moins une
pièce justificative** — photographie ou document. Sans preuve, un
signalement n'est qu'une affirmation contre une autre et ne peut être
instruit.

### 9.3 Instruction contradictoire

Le signalement ouvre un dossier d'enquête. La partie mise en cause en est
informée, **accède au motif et aux preuves**, et peut y répondre. Un
échange réunit les deux parties et Zoumani.

Un signalement après livraison ne défait pas la livraison : il ouvre un
litige sur un acheminement qui a eu lieu.

### 9.4 Décision

Zoumani statue au vu des éléments produits par les deux parties, en
confrontant notamment la déclaration de contenu de l'expéditeur (§4.1) et
l'attestation du voyageur (§5.5).

---

## 10. Avis et réputation

À l'issue d'un acheminement, chaque partie peut évaluer l'autre. Les
avis sont rattachés à une transaction réelle : il n'est pas possible
d'évaluer une personne avec qui l'on n'a rien échangé.

---

## 11. Messagerie

La messagerie n'est **pas** un annuaire. Deux personnes ne peuvent
échanger que si elles partagent un acheminement. Cette règle protège les
utilisateurs : sans transaction commune, aucun message n'est possible.

Les échanges sont conservés et peuvent être produits en cas de litige.

---

## 12. Données personnelles

### 12.1 Documents et photographies

Les pièces d'identité, justificatifs, photographies de contenu et preuves
d'incident sont stockés de façon **privée** et ne sont accessibles que
par un lien signé, temporaire, recalculé à chaque consultation. Aucun de
ces liens n'est conservé.

Aucune donnée personnelle ne figure dans le chemin de stockage d'un
fichier.

### 12.2 Notifications

Les notifications reposent sur un jeton d'appareil, supprimé à la
déconnexion comme à la suppression du compte.

### 12.3 Droits

Les droits d'accès, de rectification, d'effacement et de portabilité
s'exercent depuis les réglages du compte ou auprès du support.

---

## 13. Suspension et fermeture

Zoumani peut suspendre ou fermer un compte en cas de manquement grave ou
répété, notamment : déclaration de contenu mensongère, transport de biens
interdits, signalements abusifs, ou tentative de contourner la plateforme
pour se soustraire à ses règles.

---

## 15. Modification des présentes conditions

Toute modification donne lieu à une **nouvelle version**, que chaque
utilisateur accepte à sa prochaine connexion. Les acceptations
précédentes sont conservées avec leur date : les conditions applicables à
un acheminement sont celles en vigueur au jour de sa réservation.
`;
