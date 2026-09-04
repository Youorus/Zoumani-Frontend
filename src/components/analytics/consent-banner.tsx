"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { env } from "@/lib/env/env";
import {
  CONSENT_ALL,
  CONSENT_NONE,
  consentServerSnapshot,
  consentSnapshot,
  subscribeConsent,
  writeConsent,
} from "@/lib/marketing/consent";
import styles from "./consent-banner.module.css";

/**
 * Le bandeau de consentement.
 *
 * ═══ Trois boutons de même poids ═══
 *
 * « Refuser » plus petit, plus pâle, ou caché derrière « paramétrer » est
 * exactement ce que la CNIL sanctionne — et ce qui fait qu'un
 * consentement obtenu ne vaut rien. Refuser coûte ici le même geste
 * qu'accepter, et « Personnaliser » ouvre un panneau au lieu de mener à
 * une page où l'on se perd.
 *
 * ═══ Ce que « Personnaliser » sert vraiment ═══
 *
 * Deux interrupteurs, pas douze. Le panneau n'existe pas pour décourager
 * — c'est l'autre façon de fabriquer un « tout accepter ». Il existe
 * parce que la mesure d'audience et la publicité sont deux finalités
 * distinctes, et qu'accepter l'une n'autorise pas l'autre.
 *
 * ═══ Rien à fermer ═══
 *
 * Pas de croix. Une croix laisse un choix indéterminé, qu'il faudrait
 * interpréter — et l'interpréter comme un accord serait l'abus même. On
 * répond, ou le bandeau reste.
 *
 * ═══ Il ne s'affiche que s'il y a quelque chose à autoriser ═══
 *
 * Sans GTM, sans GA4 et sans Clarity, rien n'est mesuré : demander
 * l'autorisation de ne rien faire userait la patience dont on aura
 * besoin le jour où l'on mesure vraiment.
 */
export function ConsentBanner() {
  /**
   * ═══ Pourquoi la réponse n'est plus lue au premier rendu ═══
   *
   * Elle l'était, dans un initialiseur paresseux : `typeof window ===
   * "undefined" ? "pending" : readConsent()`. Le serveur rendait donc
   * `"pending"` — c'est-à-dire rien — et le navigateur, au tout premier
   * rendu, rendait le bandeau. React trouvait deux arbres différents et
   * jetait le sien pour tout refaire côté client : c'est l'erreur
   * `#418` relevée en production sur **chaque** chargement.
   *
   * Une erreur d'hydratation n'est pas seulement un message dans la
   * console. Elle fait re-rendre l'application entière au chargement, et
   * surtout elle masque les vraies erreurs : pendant une campagne, c'est
   * le bruit dans lequel un défaut réel passerait inaperçu.
   *
   * Le stockage est donc lu dans un effet, qui ne s'exécute que sur le
   * navigateur et après l'hydratation. Serveur et premier rendu client
   * sont identiques : `"pending"`, qui n'affiche rien.
   *
   * Le rendu supplémentaire que cela coûte est réel, et sans
   * conséquence : le bandeau n'apparaît qu'après, et rien ne se déplace
   * — il est en surimpression.
   */
  const choice = useSyncExternalStore(
    subscribeConsent,
    consentSnapshot,
    consentServerSnapshot,
  );
  const [panneau, setPanneau] = useState(false);
  const [mesure, setMesure] = useState(true);
  const [publicite, setPublicite] = useState(false);

  const mesurable =
    env.NEXT_PUBLIC_GTM_ID ||
    env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    env.NEXT_PUBLIC_CLARITY_PROJECT_ID ||
    env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!mesurable) return null;
  // `undefined` : rendu serveur et hydratation. On n'affiche rien plutôt
  // que de faire apparaître puis disparaître le bandeau chez qui a déjà
  // répondu — et surtout plutôt que de rendre deux arbres différents.
  if (choice !== null) return null;

  // Pas de `setState` : `writeConsent` écrit dans le stockage et émet
  // l'événement, dont l'abonnement ci-dessus fait redescendre la valeur.
  // Une seule source de vérité, et elle est hors de React.
  const repondre = writeConsent;

  return (
    <aside
      className={styles.banner}
      role="dialog"
      aria-modal="false"
      aria-label="Vos préférences de confidentialité"
    >
      <p className={styles.text}>
        Nous aimerions mesurer les visites pour comprendre ce qui est utile sur ce
        site, et savoir quelles annonces nous font connaître. Rien n’est déposé sans
        votre accord, les deux se refusent séparément, et refuser n’enlève rien au
        site.{" "}
        <Link href="/cookies" className={styles.link}>
          En savoir plus
        </Link>
        .
      </p>

      {panneau && (
        <div className={styles.panel}>
          <div className={styles.row}>
            <div>
              <strong className={styles.rowTitle}>Strictement nécessaire</strong>
              <span className={styles.rowText}>
                Retient ce que vous saisissez dans le formulaire et votre réponse à
                cette question. Sans eux, le site ne fonctionne pas — ils sont
                exemptés de consentement.
              </span>
            </div>
            <span className={styles.always}>Toujours actif</span>
          </div>

          <label className={styles.row}>
            <div>
              <strong className={styles.rowTitle}>Mesure d’audience</strong>
              <span className={styles.rowText}>
                Combien de personnes viennent, ce qu’elles lisent, où elles
                s’arrêtent. Google Analytics et Microsoft Clarity. Jamais votre nom,
                votre e-mail ni votre téléphone.
              </span>
            </div>
            <input
              type="checkbox"
              className={styles.toggle}
              checked={mesure}
              onChange={(e) => setMesure(e.target.checked)}
            />
          </label>

          <label className={styles.row}>
            <div>
              <strong className={styles.rowTitle}>Publicité</strong>
              <span className={styles.rowText}>
                Rattacher une pré-inscription à l’annonce qui l’a amenée, pour
                savoir laquelle sert à quelque chose. Pixel Meta. Ni votre prénom,
                ni votre e-mail, ni votre téléphone ne lui sont transmis.
              </span>
            </div>
            <input
              type="checkbox"
              className={styles.toggle}
              checked={publicite}
              onChange={(e) => setPublicite(e.target.checked)}
            />
          </label>
        </div>
      )}

      <div className={styles.actions}>
        {panneau ? (
          <button
            type="button"
            className={`${styles.button} ${styles.refuse}`}
            onClick={() => repondre({ analytics: mesure, marketing: publicite })}
          >
            Enregistrer mes choix
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.button} ${styles.refuse}`}
            onClick={() => setPanneau(true)}
            aria-expanded={panneau}
          >
            Personnaliser
          </button>
        )}
        <button
          type="button"
          className={`${styles.button} ${styles.refuse}`}
          onClick={() => repondre(CONSENT_NONE)}
        >
          Refuser
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.accept}`}
          onClick={() => repondre(CONSENT_ALL)}
        >
          Accepter
        </button>
      </div>
    </aside>
  );
}
