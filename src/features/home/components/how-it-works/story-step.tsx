import {
  BellRing,
  Check,
  Heart,
  MapPin,
  PackageCheck,
  PackageOpen,
  Plane,
  ShieldCheck,
  Star,
  Truck,
  UserCheck,
  Wallet,
} from "lucide-react";
import Image from "next/image";

import type { HomeContent } from "../home-content";
import styles from "./how-it-works.module.css";
import type { StoryMedium, StoryMoment } from "./story-media";

const momentIcons = {
  prepare: PackageOpen,
  match: UserCheck,
  journey: Plane,
  arrival: MapPin,
} as const;

const proofIcons = {
  check: Check,
  rating: Star,
  shield: ShieldCheck,
  transit: Truck,
  wallet: Wallet,
} as const;

interface StoryStatusProps {
  moment: StoryMoment;
  proof: NonNullable<HomeContent["howItWorks"]["steps"][number]["proof"]>;
}

function StoryStatus({ moment, proof }: StoryStatusProps) {
  const StatusIcon =
    moment === "arrival"
      ? BellRing
      : moment === "journey"
        ? PackageCheck
        : ShieldCheck;

  return (
    <div className={`${styles.status} ${styles[`status-${moment}`]}`}>
      <div className={styles.statusHeading}>
        <span className={styles.statusIcon} aria-hidden="true">
          <StatusIcon size={16} strokeWidth={2} />
        </span>
        <div>
          <strong>{proof.label}</strong>
          <span>{proof.meta}</span>
        </div>
        <Check className={styles.statusCheck} size={16} aria-hidden="true" />
      </div>

      {proof.origin && proof.destination ? (
        <div
          className={styles.statusRoute}
          aria-label={`${proof.origin} – ${proof.destination}`}
        >
          <span>{proof.origin}</span>
          <span className={styles.statusRouteLine} aria-hidden="true">
            <Plane size={13} />
          </span>
          <span>{proof.destination}</span>
        </div>
      ) : null}

      {proof.benefits?.length ? (
        <ul className={styles.statusBenefits}>
          {proof.benefits.map((benefit) => {
            const BenefitIcon = proofIcons[benefit.icon];

            return (
              <li key={benefit.label}>
                <BenefitIcon size={13} strokeWidth={2} aria-hidden="true" />
                <span>{benefit.label}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

interface StoryStepProps {
  copy: HomeContent["howItWorks"]["steps"][number];
  medium: StoryMedium;
}

export function StoryStep({ copy, medium }: StoryStepProps) {
  const MomentIcon = momentIcons[medium.id];

  return (
    <article
      className={`${styles.step} ${styles[`step-${medium.side}`]}`}
      data-moment={medium.id}
    >
      <div className={styles.visual}>
        <div className={styles.imageFrame}>
          <Image
            src={medium.image}
            alt={copy.imageAlt}
            fill
            sizes="(min-width: 1024px) 46vw, (min-width: 640px) 82vw, calc(100vw - 4.5rem)"
            className={styles.storyImage}
          />
          <span className={styles.imageWash} aria-hidden="true" />
          {copy.note ? (
            <p className={styles.humanNote}>
              <Heart size={14} strokeWidth={1.8} aria-hidden="true" />
              {copy.note}
            </p>
          ) : null}
          {copy.proof ? (
            <StoryStatus moment={medium.id} proof={copy.proof} />
          ) : null}
        </div>
      </div>

      <div className={styles.marker} aria-hidden="true">
        <span>
          <MomentIcon size={20} strokeWidth={1.8} />
        </span>
      </div>

      <div className={styles.stepCopy}>
        <p className={styles.stepNumber}>{copy.number}</p>
        <h3>{copy.title}</h3>
        <p>{copy.description}</p>
      </div>
    </article>
  );
}
