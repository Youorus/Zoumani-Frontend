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
 * La tentation serait de recopier une liste standard — publicité,
 * personnalisation, réseaux sociaux. Ce site n'en dépose aucun. Annoncer
 * des traceurs qu'on n'a pas est un mensonge dans le sens inverse de
 * l'habituel, mais un mensonge quand même, et il fait refuser des gens
 * qui auraient accepté.
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
    nom: "zoumani.consent.analytics",
    nature: "Stockage local",
    role: "Retient votre réponse à la question de la mesure d’audience, pour ne pas vous la reposer à chaque visite.",
    duree: "Six mois.",
    consentement: "Exempté : c’est le refus lui-même qu’il conserve.",
  },
];

export default function CookiesPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <h1 className={styles.title}>Cookies et traceurs</h1>
        <p className={styles.lede}>
          Ce site dépose peu de choses, et rien qui vous suive ailleurs. Voici la
          liste complète.
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
            <strong>La mesure d’audience</strong>, par Google Analytics via Google Tag
            Manager. Elle compte les visites et les pages lues, pour savoir ce qui est
            utile sur ce site.
          </p>
          <p className={styles.paragraph}>
            Rien n’est déposé avant que vous ayez accepté : les balises se chargent en
            mode « refusé », et n’écrivent aucun cookie tant que la réponse n’est pas
            donnée. Refuser n’enlève rien au site — les mêmes pages, les mêmes
            fonctions.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ce que nous ne déposons pas</h2>
          <p className={styles.paragraph}>
            Aucun cookie publicitaire, aucun bouton de réseau social, aucun traceur
            qui vous suivrait d’un site à l’autre, aucun enregistrement de session.
            Cette liste n’est pas une promesse d’intention : elle décrit ce que le
            code fait aujourd’hui, et la page changera le jour où cela changera.
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

        <p className={styles.updated}>Dernière mise à jour : 30 août 2026.</p>
      </main>
      <SiteFooter />
    </>
  );
}
