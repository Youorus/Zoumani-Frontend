import {
  Globe2,
  Heart,
  HeartHandshake,
  Plane,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

import type { HomeContent } from "../home-content";
import { AboutConnectionIllustration } from "./about-connection-illustration";
import styles from "./about-section.module.css";

const valueIcons = [HeartHandshake, ShieldCheck, Globe2] as const;

export function AboutSection({ copy }: { copy: HomeContent["about"] }) {
  return (
    <section
      id="trust"
      className={styles.section}
      aria-labelledby="about-title"
    >
      <span className={styles.atmosphere} aria-hidden="true" />
      <AboutConnectionIllustration />
      <Container className={styles.container}>
        <div className={styles.manifesto}>
          <div className={styles.copy}>
            <Badge variant="primary">{copy.eyebrow}</Badge>
            <h2 id="about-title">
              {copy.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
            <p className={styles.lead}>{copy.lead}</p>
            <p className={styles.body}>{copy.body}</p>
            <blockquote>{copy.quote}</blockquote>
          </div>

          <figure className={styles.visual}>
            <Image
              src="/images/about/zoumani-community.webp"
              alt={copy.imageAlt}
              fill
              sizes="(min-width: 1024px) 48vw, (min-width: 640px) 82vw, calc(100vw - 2rem)"
              className={styles.image}
            />
            <span className={styles.imageReveal} aria-hidden="true" />
            <span className={styles.imageWash} aria-hidden="true" />
            <span className={styles.routeMark} aria-hidden="true">
              <span />
              <Plane size={16} strokeWidth={1.8} />
              <span />
            </span>
            <figcaption>
              <Heart size={16} strokeWidth={1.8} aria-hidden="true" />
              {copy.imageCaption}
            </figcaption>
          </figure>
        </div>

        <div className={styles.values} aria-label={copy.valuesLabel}>
          {copy.values.map((value, index) => {
            const Icon = valueIcons[index] ?? HeartHandshake;

            return (
              <article key={value.title}>
                <div className={styles.valueHeading}>
                  <span className={styles.valueIcon} aria-hidden="true">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <span className={styles.valueNumber}>0{index + 1}</span>
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            );
          })}
        </div>

        <p className={styles.signature}>
          <span aria-hidden="true" />
          {copy.signature}
          <span aria-hidden="true" />
        </p>
      </Container>
    </section>
  );
}
