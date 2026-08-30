"use client";

import Link from "next/link";
import { useState } from "react";

import { env } from "@/lib/env/env";
import { readConsent, writeConsent } from "@/lib/marketing/consent";
import styles from "./consent-banner.module.css";

/**
 * Le bandeau de consentement à la mesure d'audience.
 *
 * ═══ Deux boutons de même poids ═══
 *
 * Un « refuser » plus petit, plus pâle, ou caché derrière un lien
 * « paramétrer » est exactement ce que la CNIL sanctionne — et ce qui
 * fait qu'un consentement obtenu ne vaut rien. Refuser doit coûter le
 * même geste qu'accepter.
 *
 * ═══ Rien à fermer ═══
 *
 * Pas de croix. Une croix laisse un choix indéterminé, qu'il faudrait
 * interpréter — et l'interpréter comme un accord serait précisément
 * l'abus. On répond, ou le bandeau reste.
 *
 * ═══ Il ne s'affiche pas sans conteneur ═══
 *
 * Sans identifiant GTM, rien n'est mesuré : demander l'autorisation de
 * ne rien faire serait absurde, et userait la patience qu'on aura besoin
 * le jour où l'on mesure vraiment.
 */
export function ConsentBanner() {
  // L'état initial est lu paresseusement : un `setState` en effet
  // déclencherait un rendu en cascade, et le bandeau clignoterait.
  const [choice, setChoice] = useState<"granted" | "denied" | null | "pending">(
    () => (typeof window === "undefined" ? "pending" : readConsent()),
  );

  if (!env.NEXT_PUBLIC_GTM_ID) return null;
  // `pending` : rendu serveur. On n'affiche rien plutôt que de faire
  // apparaître puis disparaître le bandeau chez qui a déjà répondu.
  if (choice !== null) return null;

  function answer(state: "granted" | "denied") {
    writeConsent(state);
    setChoice(state);
  }

  return (
    <aside
      className={styles.banner}
      role="dialog"
      aria-live="polite"
      aria-label="Mesure d’audience"
    >
      <p className={styles.text}>
        Nous aimerions mesurer les visites pour comprendre ce qui est utile sur ce
        site. Rien n’est déposé sans votre accord, et vous pouvez refuser sans rien
        perdre.{" "}
        <Link href="/confidentialite" className={styles.link}>
          En savoir plus
        </Link>
        .
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.refuse}`}
          onClick={() => answer("denied")}
        >
          Refuser
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.accept}`}
          onClick={() => answer("granted")}
        >
          Accepter
        </button>
      </div>
    </aside>
  );
}
