import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

import styles from "../confidentialite/page.module.css";

/**
 * La page cookies.
 *
 * ═══ Elle décrit ce qui existe, pas ce qui est habituel ═══
 *
 * La tentation serait de recopier une liste standard. Annoncer des
 * traceurs qu'on n'a pas est un mensonge dans le sens inverse de
 * l'habituel, mais un mensonge quand même, et il fait refuser des gens
 * qui auraient accepté. L'inverse — taire ce qu'on dépose — est la faute
 * qu'elle a réellement commise : Clarity mesurait depuis le 30 août
 * pendant que cette page affirmait « aucun enregistrement de session »,
 * et nommait un Google Tag Manager retiré le même jour. Une page
 * contractuelle qui décrit un site qu'on n'a plus est pire que pas de
 * page : c'est celle-là qu'on croit.
 *
 * ═══ Elle se met à jour dans le commit qui change le code ═══
 *
 * Pas après. Le pixel Meta et cette page sont arrivés ensemble, et c'est
 * la seule discipline qui tienne : une déclaration remise à plus tard
 * n'est jamais faite.
 *
 * ═══ Le stockage local est un traceur au sens de la CNIL ═══
 *
 * Le brouillon du formulaire et le choix de consentement vivent dans le
 * navigateur sans être des cookies. La CNIL les traite pareil — et les
 * exempte, parce qu'ils sont strictement nécessaires au service demandé.
 * Les taire serait incomplet ; demander leur autorisation serait absurde.
 */

export const metadata: Metadata = pageMetadata({
  path: "/cookies",
  title: "Cookies et traceurs",
  description:
    "Ce que Zoumani dépose dans votre navigateur, pourquoi, et comment refuser.",
});

/** Ce que le site pose réellement. Une ligne de plus ici est une ligne de
 *  plus dans le navigateur : les deux se modifient ensemble. */
const TRACEURS = [
  {
    nom: "zoumani.prelaunch.draft",
    nature: "Stockage de session",
    role: "Retient ce que vous avez saisi dans le formulaire de pré-inscription, pour que reculer d’une étape n’efface pas vos réponses.",
    duree: "Effacé à la fermeture de l’onglet.",
    consentement: "Exempté : sans lui, le formulaire perdrait vos réponses.",
  },
  {
    nom: "zoumani.attribution",
    nature: "Stockage de session",
    role: "Retient les paramètres de campagne présents dans l’adresse par laquelle vous êtes arrivé, pour savoir quelle publicité nous a fait connaître.",
    duree: "Effacé à la fermeture de l’onglet.",
    consentement:
      "Exempté : il mesure une provenance, pas une personne, et ne quitte pas ce site.",
  },
  {
    nom: "zoumani.consent.v2",
    nature: "Stockage local",
    role: "Retient vos réponses aux deux questions — mesure d’audience, publicité — pour ne pas vous les reposer à chaque visite.",
    duree:
      "Conservé jusqu’à ce que vous effaciez les données de ce site dans votre navigateur.",
    consentement: "Exempté : c’est votre choix lui-même qu’il conserve.",
  },
];

/**
 * Les outils tiers, leurs cookies et leurs durées.
 *
 * ═══ Les durées sont relevées, pas recopiées ═══
 *
 * Celles de Google et de Microsoft ont été mesurées dans un navigateur
 * sur la version en production le 4 septembre 2026, et non reprises
 * d'une documentation d'éditeur — celles-ci décrivent une valeur par
 * défaut qui n'est pas toujours celle qui s'applique. Une durée annoncée
 * qu'on n'a pas vérifiée est une affirmation de plus à défendre.
 *
 * `_fbp` a d'abord été annoncé sur la seule foi de la documentation de
 * Meta, faute de pixel réel à observer. Il a été relevé depuis, sur la
 * production, et vaut bien 90 jours.
 */
const OUTILS = [
  {
    nom: "Google Analytics 4",
    editeur: "Google Ireland Limited",
    finalite: "mesure d’audience",
    role: "Compte les visites, les pages lues et les étapes franchies dans le formulaire, pour savoir ce qui est utile sur ce site et ce qui ne l’est pas.",
    cookies: "_ga, _ga_… — déposés sur zoumani.fr, 400 jours.",
  },
  {
    nom: "Microsoft Clarity",
    editeur: "Microsoft Ireland Operations Limited",
    finalite: "mesure d’audience",
    role: "Enregistre le déroulement des visites — défilement, appuis, hésitations — pour comprendre où l’on se perd. Le texte que vous saisissez dans les champs n’est pas capturé : la coupure est faite dans votre navigateur, avant tout envoi.",
    cookies:
      "_clck (365 jours) et _clsk (1 jour) sur zoumani.fr ; MUID, SRM_B (390 jours), MR (7 jours), ANONCHK et SM sur les domaines clarity.ms et bing.com.",
  },
  {
    nom: "Pixel Meta",
    editeur: "Meta Platforms Ireland Limited",
    finalite: "publicité",
    role: "Rattache une pré-inscription à l’annonce qui l’a amenée, pour savoir laquelle sert à quelque chose. Nous ne lui transmettons ni votre nom, ni votre adresse électronique, ni votre téléphone.",
    cookies: "_fbp — déposé sur zoumani.fr, 90 jours.",
  },
];

export default function CookiesPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <h1 className={styles.title}>Cookies et traceurs</h1>
        <p className={styles.lede}>
          Ce site dépose peu de choses. Voici la liste complète, et ce que chacune
          sert à faire.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ce qui est déposé sans votre accord</h2>
          <p className={styles.paragraph}>
            Trois éléments, tous <strong>strictement nécessaires</strong> au
            fonctionnement de ce que vous demandez. Ce sont des espaces de stockage
            du navigateur, pas des cookies envoyés à un serveur : ils ne quittent
            jamais votre appareil.
          </p>
          {TRACEURS.map((traceur) => (
            <div key={traceur.nom} className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <code>{traceur.nom}</code>
              </h3>
              <p className={styles.paragraph}>
                <strong>{traceur.nature}.</strong> {traceur.role}
                <br />
                Durée : {traceur.duree}
                <br />
                {traceur.consentement}
              </p>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ce qui n’est déposé qu’avec votre accord</h2>
          <p className={styles.paragraph}>
            Deux finalités, deux questions distinctes. Le bandeau vous permet de
            répondre séparément à chacune : accepter la mesure n’autorise pas la
            publicité, et refuser l’une n’oblige pas à refuser l’autre.
          </p>

          {OUTILS.map((outil) => (
            <div key={outil.nom} className={styles.section}>
              <h3 className={styles.sectionTitle}>{outil.nom}</h3>
              <p className={styles.paragraph}>
                <strong>Finalité : {outil.finalite}.</strong> {outil.role}
                <br />
                Éditeur : {outil.editeur}.
                <br />
                Cookies : {outil.cookies}
              </p>
            </div>
          ))}

          <p className={styles.paragraph}>
            <strong>Rien n’est déposé avant que vous ayez accepté.</strong> Clarity et
            le pixel Meta ne sont pas seulement inertes tant que vous n’avez pas
            répondu : leur script n’est pas téléchargé, et leurs domaines ne sont pas
            contactés. Google Analytics, lui, se charge dès l’arrivée mais n’écrit
            aucun cookie et n’enregistre aucun identifiant tant que la mesure n’est
            pas acceptée.
          </p>
          <p className={styles.paragraph}>
            Refuser n’enlève rien au site — les mêmes pages, les mêmes fonctions.
          </p>
          <p className={styles.paragraph}>
            Ces trois outils sont édités par des sociétés établies dans l’Union
            européenne, appartenant à des groupes américains. Les données peuvent
            donc être transférées hors de l’Union, dans le cadre prévu par leurs
            conditions respectives.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ce que nous ne déposons pas</h2>
          <p className={styles.paragraph}>
            Aucun bouton de réseau social, aucune régie hors de celles nommées
            ci-dessus. Nous ne transmettons à aucune d’elles votre nom, votre adresse
            électronique ni votre numéro de téléphone : un filtre les écarte avant
            tout envoi.
          </p>
          <p className={styles.paragraph}>
            Cette liste n’est pas une promesse d’intention : elle décrit ce que le
            code fait aujourd’hui, et la page change dans le commit qui change le
            code.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Revenir sur votre choix</h2>
          <p className={styles.paragraph}>
            Effacez les données de ce site dans les réglages de votre navigateur : la
            question vous sera reposée à la visite suivante. Vous pouvez aussi
            refuser tous les cookies au niveau du navigateur, sans conséquence sur ce
            site.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pour aller plus loin</h2>
          <p className={styles.paragraph}>
            Ce que nous recueillons et pourquoi est décrit dans notre{" "}
            <Link href="/confidentialite" className={styles.link}>
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <p className={styles.updated}>Dernière mise à jour : 4 septembre 2026.</p>
      </main>
      <SiteFooter />
    </>
  );
}
