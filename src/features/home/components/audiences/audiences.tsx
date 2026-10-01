import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import { Emphasis } from "../emphasis";
import type { HomeContent } from "../home-content";
import { AppStoreBadge } from "../hero/store-badges";
import styles from "./audiences.module.css";

/**
 * Les trois chapitres : expéditeur, voyageur, entreprise de fret.
 *
 * ═══ Un chapitre, un canevas ═══
 *
 * Trois cartes identiques côte à côte auraient dit « voici trois cibles »
 * sans parler à aucune. Chaque chapitre occupe toute la largeur, avec sa
 * couleur — sable, soleil, ébène — et sa propre mise en page : la photo
 * pour celui qui envoie, la valise qui se remplit pour celui qui part,
 * les offres pour l'entreprise. On tourne une page à chaque fois.
 *
 * ═══ Les ancres ═══
 *
 * `#envoyer`, `#voyager`, `#entreprises` : les trois entrées du menu
 * mènent chacune à son chapitre. Elles sont posées sur les `<article>`,
 * pas sur la section : c'est la page qu'on vise, pas le sommaire.
 */

const ANCRES: Record<HomeContent["audiences"]["chapters"][number]["id"], string> = {
  sender: "envoyer",
  traveler: "voyager",
  business: "entreprises",
};

function Action({
  action,
  stores,
  whatsapp,
  chapterId,
  secondary = false,
}: {
  action: NonNullable<HomeContent["audiences"]["chapters"][number]["secondaryCta"]>;
  stores: HomeContent["stores"];
  whatsapp: HomeContent["whatsapp"];
  chapterId: string;
  secondary?: boolean;
}) {
  const cta = `chapter-${chapterId}-${secondary ? "secondary" : "primary"}`;
  if (action.kind === "store") {
    return secondary ? (
      <a
        href="https://apps.apple.com/fr/app/zoumani/id6803543420"
        target="_blank"
        rel="noreferrer"
        className={`focus-ring ${styles.linkCta}`}
        data-cta={cta}
      >
        {action.label}
        <span aria-hidden="true">→</span>
      </a>
    ) : (
      <AppStoreBadge copy={stores} cta={cta} />
    );
  }
  if (action.kind === "whatsapp") {
    return (
      <a
        href={buildWhatsAppUrl(whatsapp.businessMessage)}
        target="_blank"
        rel="noreferrer"
        className={`focus-ring ${secondary ? styles.linkCta : styles.buttonCta}`}
        data-cta={cta}
      >
        {action.label}
        {secondary ? <span aria-hidden="true">→</span> : null}
      </a>
    );
  }
  return (
    <Link href={action.href ?? "/"} className={`focus-ring ${styles.linkCta}`} data-cta={cta}>
      {action.label}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function Audiences({
  copy,
  stores,
  whatsapp,
}: {
  copy: HomeContent["audiences"];
  stores: HomeContent["stores"];
  whatsapp: HomeContent["whatsapp"];
}) {
  return (
    <section className={styles.section} aria-labelledby="audiences-title">
      <Container className={styles.intro} data-story-section>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="audiences-title" className={styles.sectionTitle}>
          {copy.title}
        </h2>
      </Container>

      {copy.chapters.map((chapitre) => (
        <article
          key={chapitre.id}
          id={ANCRES[chapitre.id]}
          className={styles.chapter}
          data-chapter={chapitre.id}
          data-story-section
          aria-labelledby={`chapter-${chapitre.id}-title`}
        >
          <Container className={styles.grid}>
            <div className={styles.lead}>
              <p className={styles.index}>
                <span>{chapitre.index}</span>
                {chapitre.eyebrow}
              </p>
              <h3 id={`chapter-${chapitre.id}-title`} className={styles.title}>
                <Emphasis text={chapitre.title} emphasis={chapitre.titleEmphasis} />
              </h3>
              <p className={styles.lede}>{chapitre.lede}</p>
              <div className={styles.actions}>
                <Action action={chapitre.cta} stores={stores} whatsapp={whatsapp} chapterId={chapitre.id} />
                {chapitre.secondaryCta ? (
                  <Action
                    action={chapitre.secondaryCta}
                    stores={stores}
                    whatsapp={whatsapp}
                    chapterId={chapitre.id}
                    secondary
                  />
                ) : null}
              </div>
            </div>

            <div className={styles.aside}>
              {chapitre.id === "sender" ? (
                <figure className={styles.photo}>
                  <Image
                    src="/images/hero/zoumani-airport-campaign.webp"
                    alt=""
                    fill
                    sizes="(max-width: 64rem) 100vw, 44vw"
                    className={styles.photoImage}
                  />
                </figure>
              ) : null}

              {chapitre.id === "traveler" ? (
                /* Les kilos du chapeau, dessinés : vingt-trois cases, quinze
                   pleines, huit qui comptent. C'est l'exemple du texte, pas
                   une statistique. */
                <div className={styles.luggage} aria-hidden="true">
                  <div className={styles.luggageRow}>
                    {Array.from({ length: 23 }, (_, i) => (
                      <span key={i} className={styles.kilo} data-free={i >= 15 ? "true" : undefined} />
                    ))}
                  </div>
                  <p className={styles.luggageCaption}>
                    <span>15 kg</span>
                    <span>8 kg</span>
                  </p>
                </div>
              ) : null}

              <ol className={styles.points}>
                {chapitre.points.map((point, index) => (
                  <li key={point.title} className={styles.point}>
                    <span className={styles.pointIndex}>{index + 1}</span>
                    <div>
                      <h4 className={styles.pointTitle}>{point.title}</h4>
                      <p className={styles.pointDetail}>{point.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {chapitre.offers ? (
                <div className={styles.offers}>
                  <p className={styles.offersIntro}>{chapitre.offers.intro}</p>
                  <p className={styles.offersNote}>{chapitre.offers.trial}</p>
                  <p className={styles.offersToday}>{chapitre.offers.today}</p>
                </div>
              ) : null}
            </div>
          </Container>
        </article>
      ))}
    </section>
  );
}
