import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import type { HomeContent } from "../home-content";
import styles from "./hero.module.css";

export function Hero({
  copy,
}: {
  copy: HomeContent["hero"];
}) {
  const [beforeAccent, afterAccent] = copy.description.split("{accent}");

  return (
    <section id="telecharger" className={styles.hero}>
      <div className={styles.photoLayer} aria-hidden="true">
        <Image
          src="/images/hero/zoumani-airport-campaign.webp"
          alt=""
          fill
          preload
          sizes="100vw"
          className={styles.photo}
        />
        <span className={styles.photoScrim} />
      </div>

      <span className={styles.orangeRoute} aria-hidden="true" />

      {/* ═══ Ce que le hero ne fait plus ═══

          Il portait une pastille « France · Afrique · Le monde », un
          titre, une phrase, trois cartes de garantie et une carte de
          préinscription à deux étages. Six blocs empilés : au premier
          coup d'œil, on ne savait pas lequel regarder, et sur un
          téléphone les boutons tombaient sous la ligne de flottaison.

          Il ne reste que ce qui décide : la promesse, une phrase qui
          l'explique, et les deux portes. Les trois garanties n'ont pas
          disparu — elles ont leur propre bande, juste dessous, où elles
          se lisent au lieu de concurrencer l'appel à l'action. */}
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.title}>
            <span className={styles.titlePrimary}>{copy.titleLineOne}</span>
            <span className={styles.titleAccent}>{copy.titleLineTwo}</span>
          </h1>

          <p className={styles.description}>
            {beforeAccent}
            <strong>{copy.descriptionAccent}</strong>
            {afterAccent}
          </p>
        </div>

        {/* ═══ Ce qui a remplacé le téléphone ═══

            Le hero montrait une maquette d'application avec trois
            voyageurs — Alex D., Fatou N., Samuel K. — leurs prix et une
            pastille « vérifié ». Personne n'existait. Montrer une offre
            qu'on n'a pas est le plus court chemin vers la déception au
            premier vrai écran, et vers un magasin d'applications où rien
            n'est encore publié.

            À la place, la seule chose qu'on puisse honnêtement demander
            aujourd'hui : votre trajet. Deux portes, parce que les deux
            versants du marché ne se reconnaissent pas dans les mêmes
            mots — et parce qu'un bouton qui nomme l'intention de celui
            qui le lit vaut tous les « Rejoindre la liste » du monde.

            Plus de carte autour : le titre porte déjà l'annonce, les
            boutons n'ont plus besoin d'être présentés. */}
        <div className={styles.waitlist}>
          <div className={styles.waitlistActions}>
            <Link
              href="/preinscription?type=sender"
              className={styles.waitlistPrimary}
              data-cta="hero-sender"
            >
              {copy.waitlist.senderCta}
            </Link>
            <Link
              href="/preinscription?type=traveler"
              className={styles.waitlistSecondary}
              data-cta="hero-traveler"
            >
              {copy.waitlist.travelerCta}
            </Link>
          </div>
          <p className={styles.waitlistNote}>{copy.waitlist.note}</p>
        </div>
      </div>

      <div className={styles.routeLine} aria-hidden="true">
        <svg viewBox="0 0 1000 90" preserveAspectRatio="none">
          <path d="M0 75C320 82 555 86 790 54c86-12 143-29 210-49" />
        </svg>
        <span>
          <MapPin />
        </span>
      </div>
    </section>
  );
}
