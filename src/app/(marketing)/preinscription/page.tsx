import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { Suspense } from "react";

import { PrelaunchIntent } from "@/features/prelaunch/components/prelaunch-intent";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./page.module.css";

/**
 * ═══ Une page serveur, un îlot client ═══
 *
 * Le titre, le chapeau et « comment ça marche » sont rendus à la
 * compilation : un moteur les lit sans exécuter une ligne de JavaScript.
 * Seul le tunnel est un composant client, et il ne porte aucun contenu
 * indexable.
 *
 * `useSearchParams` impose une frontière de suspense. Sans elle, Next
 * refuse de pré-rendre la page et bascule tout en dynamique — c'est-à-
 * dire perd exactement ce qu'on cherche.
 */

export const metadata: Metadata = pageMetadata({
  path: "/preinscription",
  title: "Se pré-inscrire à l’ouverture",
  description:
    "Dites-nous votre trajet : nous vous prévenons dès que Zoumani ouvre. Un colis à envoyer, ou des kilos libres dans votre valise.",
  ogDescription:
    "Dites-nous votre trajet : nous vous prévenons dès que Zoumani ouvre sur ce corridor.",
});

const ETAPES = [
  {
    titre: "Un voyageur annonce son trajet",
    texte: "Il indique sa destination, sa date, et les kilos qu’il peut partager.",
  },
  {
    titre: "Un expéditeur cherche ce trajet",
    texte: "Il trouve les voyageurs qui partent bientôt là où son colis doit aller.",
  },
  {
    titre: "Zoumani encadre la rencontre",
    texte:
      "Identités vérifiées, contenu déclaré, suivi du colis jusqu’à sa remise au destinataire.",
  },
];

export default function PreinscriptionPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Envoyez vos colis. Rentabilisez vos voyages.</h1>
          <p className={styles.lede}>
            Zoumani met en relation les expéditeurs et les voyageurs qui font déjà le même
            trajet. Dites-nous le vôtre : nous vous préviendrons dès l’ouverture.
          </p>
        </header>

        <Suspense fallback={<div className={styles.reserve} aria-hidden />}>
          <PrelaunchIntent />
        </Suspense>

        <section aria-labelledby="comment" className={styles.steps}>
          <h2 id="comment" className={styles.stepsTitle}>
            Comment ça marche
          </h2>
          <ol className={styles.stepsList}>
            {ETAPES.map((etape, i) => (
              <li key={etape.titre} className={styles.step}>
                <span aria-hidden className={styles.stepNumber}>
                  {i + 1}
                </span>
                <span>
                  <span className={styles.stepTitle}>{etape.titre}</span>
                  <span className={styles.stepText}>{etape.texte}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
