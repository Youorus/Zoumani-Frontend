import type { Metadata } from "next";
import Link from "next/link";

import styles from "../confidentialite/page.module.css";

/**
 * Les mentions légales.
 *
 * ═══ Ce qui manque, et comment on le traite ═══
 *
 * L'identité de l'éditeur — raison sociale, forme juridique, siège,
 * immatriculation, directeur de publication — n'est connue de personne
 * dans ce dépôt. Elle est donc rassemblée dans `EDITEUR`, un seul objet
 * à compléter.
 *
 * Tant qu'il est vide, la page **le dit** plutôt que d'afficher des
 * crochets. Une mention légale qui annonce « [raison sociale] » en
 * production est pire qu'une page absente : elle donne l'apparence de la
 * conformité sans en avoir la substance, et c'est ce qu'un contrôle
 * relèverait en premier.
 *
 * ═══ Ce qui est vrai dès aujourd'hui ═══
 *
 * L'hébergeur, la nature du site, la propriété intellectuelle, le renvoi
 * à la politique de confidentialité. Rien n'y est inventé : l'hébergeur
 * a été vérifié sur l'adresse qui sert ce site.
 */

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeur et nature du site Zoumani.",
  alternates: { canonical: "/mentions-legales" },
};

/**
 * L'identité de l'éditeur.
 *
 * ⚠️ À compléter avant toute campagne publicitaire : la loi pour la
 * confiance dans l'économie numérique les rend obligatoires, et une régie
 * peut refuser une annonce pointant vers un site qui n'en a pas.
 *
 * Renseigner ces cinq champs suffit : la page s'affiche alors
 * entièrement, sans autre changement de code.
 */
const EDITEUR = {
  raisonSociale: "",
  formeJuridique: "",
  siege: "",
  immatriculation: "",
  directeurDePublication: "",
  contact: "contact@zoumani.fr",
} as const;

const IDENTITE_CONNUE = Boolean(EDITEUR.raisonSociale && EDITEUR.siege);

export default function MentionsLegalesPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Mentions légales</h1>
      <p className={styles.lede}>
        Qui édite ce site, qui l’héberge, et ce qu’il est — ou n’est pas encore.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Éditeur du site</h2>
        {IDENTITE_CONNUE ? (
          <p className={styles.paragraph}>
            {EDITEUR.raisonSociale}, {EDITEUR.formeJuridique}.
            <br />
            Siège social : {EDITEUR.siege}.
            <br />
            {EDITEUR.immatriculation}.
            <br />
            Directeur de la publication : {EDITEUR.directeurDePublication}.
            <br />
            Contact : {EDITEUR.contact}
          </p>
        ) : (
          <p className={styles.paragraph}>
            Zoumani est un projet en cours de constitution. Les informations
            d’immatriculation seront publiées ici dès l’enregistrement de la société,
            et avant toute mise en service commerciale.
            <br />
            Contact : {EDITEUR.contact}
          </p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Hébergement</h2>
        <p className={styles.paragraph}>
          Hetzner Online GmbH — Industriestr. 25, 91710 Gunzenhausen, Allemagne.
          <br />
          Serveurs situés à Falkenstein (Saxe), Allemagne. hetzner.com
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Nature du site</h2>
        <p className={styles.paragraph}>
          Ce site présente un service <strong>en cours de préparation</strong>. Il ne
          constitue ni une offre commerciale, ni un service de transport, ni un
          contrat. Aucune transaction n’y est possible, et aucun transporteur,
          assureur ou partenaire n’y est engagé à ce jour.
        </p>
        <p className={styles.paragraph}>
          S’inscrire à la liste de lancement n’engage à rien, et ne réserve aucune
          place.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Propriété intellectuelle</h2>
        <p className={styles.paragraph}>
          La marque Zoumani, les textes, l’identité visuelle et le code de ce site
          sont protégés. Toute reproduction, même partielle, sans autorisation
          préalable est interdite.
        </p>
        <p className={styles.paragraph}>
          Les logos App Store et Google Play appartiennent respectivement à Apple Inc.
          et Google LLC.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Données personnelles</h2>
        <p className={styles.paragraph}>
          Ce que nous recueillons, pourquoi, combien de temps et comment le faire
          effacer est décrit dans notre{" "}
          <Link href="/confidentialite" className={styles.link}>
            politique de confidentialité
          </Link>
          .
        </p>
      </section>

      <p className={styles.updated}>Dernière mise à jour : 30 août 2026.</p>
    </main>
  );
}
