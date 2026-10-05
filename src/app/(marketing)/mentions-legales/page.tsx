import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

import styles from "../confidentialite/page.module.css";

/**
 * Les mentions légales.
 *
 * ═══ L'identité de l'éditeur ═══
 *
 * Elle est connue depuis le 5 octobre 2026 : l'activité est immatriculée au
 * R.C.S. de Paris, et l'extrait Kbis mentionne explicitement l'exploitation
 * d'une plateforme de mise en relation pour l'envoi de colis — c'est Zoumani.
 *
 * Tout tient dans `EDITEUR`. Le repli qui disait « projet en cours de
 * constitution » reste en place : si quelqu'un vidait ces champs, la page le
 * dirait plutôt que d'afficher des crochets. Une mention légale qui annonce
 * « [raison sociale] » en production est pire qu'une page absente : elle donne
 * l'apparence de la conformité sans en avoir la substance.
 *
 * ⚠️ Zoumani n'est pas une société : c'est une activité exercée en entreprise
 * individuelle. D'où « adresse de l'établissement » et non « siège social »,
 * et le « (EI) » accolé au nom — la loi du 14 février 2022 l'impose.
 *
 * ═══ Ce qui est vrai dès aujourd'hui ═══
 *
 * L'hébergeur, la nature du site, la propriété intellectuelle, le renvoi
 * à la politique de confidentialité. Rien n'y est inventé : l'hébergeur
 * a été vérifié sur l'adresse qui sert ce site.
 */

export const metadata: Metadata = pageMetadata({
  path: "/mentions-legales",
  title: "Mentions légales",
  description:
    "Éditeur, hébergeur et nature du site Zoumani.",
});

/**
 * L'identité de l'éditeur, relevée sur l'extrait Kbis du 5 octobre 2026.
 *
 * La TVA : l'activité a commencé le 1er octobre 2026 et relève de la franchise
 * en base. Si un numéro de TVA intracommunautaire est obtenu, il remplace cette
 * ligne — annoncer la franchise en facturant de la TVA serait une erreur
 * visible par les clients.
 */
const EDITEUR = {
  raisonSociale: "Nkue Takoumba Marc Junior (EI)",
  formeJuridique: "entreprise individuelle (entrepreneur individuel)",
  siege: "23 avenue Léon Bollée, 75013 Paris, France",
  immatriculation: "R.C.S. Paris 130 777 196 — SIREN 130 777 196",
  tva: "TVA non applicable, article 293 B du Code général des impôts",
  directeurDePublication: "Marc Junior Nkue Takoumba",
  contact: "contact@zoumani.fr",
} as const;

const IDENTITE_CONNUE = Boolean(EDITEUR.raisonSociale && EDITEUR.siege);

export default function MentionsLegalesPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <h1 className={styles.title}>Mentions légales</h1>
        <p className={styles.lede}>
          Qui édite ce site, qui l’héberge, et ce qu’il est — ou n’est pas encore.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Éditeur du site</h2>
          {IDENTITE_CONNUE ? (
            <p className={styles.paragraph}>
              Zoumani est un service édité par {EDITEUR.raisonSociale},{" "}
              {EDITEUR.formeJuridique}.
              <br />
              Adresse de l’établissement : {EDITEUR.siege}.
              <br />
              {EDITEUR.immatriculation}.
              <br />
              {EDITEUR.tva}.
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

        <p className={styles.updated}>Dernière mise à jour : 5 octobre 2026.</p>
      </main>
      <SiteFooter />
    </>
  );
}
