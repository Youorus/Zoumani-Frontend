import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AfricaRouteIllustration } from "./africa-route-illustration";
import type { HomeContent } from "./home-content";
import styles from "./home-hero.module.css";

export function PromoCards({ copy }: { copy: HomeContent["promos"] }) {
  return (
    <section
      id="services"
      aria-label={copy.sectionLabel}
      className={`${styles.cardsReveal} relative z-20 mx-auto -mt-6 grid w-full max-w-[1536px] gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:px-[2.8rem]`}
    >
      <article className="group relative min-h-[13.25rem] overflow-hidden rounded-[1.25rem] bg-inverse-surface shadow-lifted">
        <Image
          src="/images/home/traveler-card.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
        />
        <div className={`absolute inset-0 ${styles.travelerOverlay}`} />
        <div className="relative z-10 flex min-h-[13.25rem] flex-col justify-center px-6 py-6 text-inverse-foreground sm:pl-[29%] sm:pr-7">
          <h2 className="max-w-[25rem] font-sans text-[1.35rem] leading-[1.2] font-extrabold tracking-[-0.025em] sm:text-2xl">
            {copy.travelerTitleOne}<br />{copy.travelerTitleTwo}
          </h2>
          <p className="mt-2 max-w-[20rem] text-sm leading-5 text-inverse-muted-foreground">
            {copy.travelerDescription}
          </p>
          <Link
            href="/trips"
            className="focus-ring mt-4 inline-flex h-11 w-full max-w-[240px] items-center justify-between rounded-lg bg-marketing-panel px-6 text-sm font-bold text-primary shadow-soft transition-transform group-hover:translate-x-1"
          >
            {copy.travelerCta}
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </article>

      <article className="group relative min-h-[13.25rem] overflow-hidden rounded-[1.25rem] bg-secondary shadow-lifted">
        <Image
          src="/images/home/parcel-card.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
        />
        <div className={`absolute inset-0 ${styles.parcelOverlay}`} />
        <AfricaRouteIllustration />
        <div className="relative z-10 flex min-h-[13.25rem] flex-col justify-center px-6 py-6 text-inverse-foreground sm:pl-[29%] sm:pr-[25%]">
          <h2 className="max-w-[22rem] font-sans text-[1.35rem] leading-[1.2] font-extrabold tracking-[-0.025em] sm:text-2xl">
            {copy.parcelTitleOne}<br />{copy.parcelTitleTwo}
          </h2>
          <p className="mt-2 max-w-[18rem] text-sm leading-5 text-inverse-muted-foreground">
            {copy.parcelDescription}
          </p>
          <Link
            href="#search"
            className="focus-ring mt-4 inline-flex h-11 w-full max-w-[275px] items-center justify-between rounded-lg bg-marketing-panel px-6 text-sm font-bold text-primary shadow-soft transition-transform group-hover:translate-x-1"
          >
            {copy.parcelCta}
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </article>
    </section>
  );
}
