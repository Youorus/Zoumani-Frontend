import { ArrowRight, Plane, Sparkles } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildSignupHref } from "@/features/account/lib/build-signup-href";

import type { HomeContent, HomeLanguage } from "../home-content";
import styles from "./how-it-works.module.css";
import { StoryRoute } from "./story-route";
import { storyMedia } from "./story-media";
import { StoryStep } from "./story-step";

export function HowItWorks({
  copy,
  language,
}: {
  copy: HomeContent["howItWorks"];
  language: HomeLanguage;
}) {
  return (
    <section id="fonctionnement" className={styles.section} aria-labelledby="how-it-works-title">
      <Container className={styles.container}>
        <header className={styles.intro}>
          <Badge variant="primary">{copy.eyebrow}</Badge>
          <h2 id="how-it-works-title">
            {copy.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <p>{copy.description}</p>
        </header>

        <div className={styles.timeline} data-story-timeline="">
          <StoryRoute />
          {storyMedia.map((medium, index) => {
            const stepCopy = copy.steps[index];
            return stepCopy ? <StoryStep key={medium.id} medium={medium} copy={stepCopy} /> : null;
          })}
        </div>

        <div className={styles.closing}>
          <span className={styles.closingIcon} aria-hidden="true">
            <Sparkles size={26} />
          </span>
          <p className={styles.closingEyebrow}>{copy.closingEyebrow}</p>
          <h3>{copy.closingTitle}</h3>
          <p className={styles.closingDescription}>{copy.closingDescription}</p>
          <div className={styles.actions}>
            <Button asChild size="lg">
              <Link href="#search">
                {copy.senderCta}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={buildSignupHref("traveler", language)}>
                <Plane size={18} aria-hidden="true" />
                {copy.travelerCta}
              </Link>
            </Button>
          </div>
          <p className={styles.legalNote}>{copy.legalNote}</p>
        </div>
      </Container>
    </section>
  );
}
