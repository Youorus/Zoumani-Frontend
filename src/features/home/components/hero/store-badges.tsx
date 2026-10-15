import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import type { HomeContent } from "../home-content";

/**
 * L'adresse de l'application sur l'App Store.
 *
 * ═══ Pourquoi une valeur par défaut dans le code ═══
 *
 * Elle était lue dans l'environnement seul, et absente : le badge
 * portait « Bientôt » alors que l'application est publiée depuis le
 * 1er octobre 2026. Une adresse de magasin est publique et stable — la
 * figer ici garantit qu'un déploiement sans la variable n'annonce plus
 * une indisponibilité fausse. L'environnement peut toujours la
 * remplacer, par exemple pour un lien de campagne.
 */
export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ||
  "https://apps.apple.com/fr/app/zoumani/id6803543420";

/**
 * L'adresse de l'application sur Google Play, publiée le 15 octobre 2026.
 *
 * Figée dans le code pour la même raison que l'App Store : sans valeur
 * par défaut, un déploiement oublieux remettrait « Bientôt » sur une
 * application disponible.
 */
export const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
  "https://play.google.com/store/apps/details?id=com.zoumani.app";

const BADGES = {
  fr: {
    apple: "/images/stores/app-store-badge-fr.svg",
    play: "/images/stores/google-play-badge-fr.png",
  },
  en: {
    apple: "/images/stores/app-store-badge-en.svg",
    play: "/images/stores/google-play-badge-en.png",
  },
} as const;

/**
 * Les PNG de Google portent une marge vide autour du badge — 29 px sur
 * 250 en haut et en bas pour le français, 41 px tout autour pour
 * l'anglais. On les dessine plus grands, rognés par une marge négative,
 * pour que le badge visible ait la hauteur du SVG d'Apple (3,25 rem).
 */
const PLAY_FIT = {
  fr: { height: "4.23rem", margin: "-0.49rem 0" },
  en: { height: "4.84rem", margin: "-0.79rem" },
} as const;

type Store = "apple" | "play";

function Badge({
  href,
  src,
  alt,
  store,
  stack,
  alwaysInline,
  cta,
}: {
  href?: string;
  src: string;
  alt: string;
  store: Store;
  stack: boolean;
  alwaysInline: boolean;
  cta?: string;
}) {
  const className = cn(
    "focus-ring inline-flex min-w-0 items-center justify-center rounded-[0.65rem] transition-transform duration-200",
    store === "apple" ? "max-w-[11rem]" : "max-w-[12rem]",
    href ? "hover:-translate-y-0.5" : "opacity-70 saturate-0",
    alwaysInline ? "flex-1" : stack ? "w-full" : "w-full sm:w-auto sm:flex-none",
  );

  const artwork = (
    <Image
      src={src}
      alt={alt}
      width={store === "apple" ? 177 : 194}
      height={store === "apple" ? 56 : 75}
      loading="eager"
      sizes="(max-width: 640px) 44vw, 12rem"
      style={{ width: "100%", height: "auto" }}
    />
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={alt}
      className={className}
      data-cta={cta}
    >
      {artwork}
    </a>
  ) : (
    <div className={className} aria-disabled="true">
      {artwork}
    </div>
  );
}

/**
 * Les deux badges côte à côte, à la hauteur du badge App Store seul.
 *
 * C'est l'appel principal de la page : il est posé dans chaque chapitre
 * et dans le bandeau final. `cta` nomme l'emplacement pour la mesure —
 * suffixé `-apple` ou `-play`, il dit aussi quel magasin convertit.
 */
export function AppBadges({
  copy,
  cta,
  className,
}: {
  copy: HomeContent["stores"];
  cta: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <AppStoreBadge copy={copy} cta={`${cta}-apple`} />
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label={`${copy.playTop} ${copy.playBottom}`}
        data-cta={`${cta}-play`}
        className="focus-ring inline-flex shrink-0 rounded-[0.7rem] transition-transform duration-200 hover:-translate-y-0.5"
      >
        <Image
          src={BADGES[copy.locale].play}
          alt=""
          width={194}
          height={75}
          style={{ width: "auto", ...PLAY_FIT[copy.locale] }}
        />
      </a>
    </div>
  );
}

/** Le badge App Store seul, cliquable. */
export function AppStoreBadge({
  copy,
  cta,
  className,
}: {
  copy: HomeContent["stores"];
  cta: string;
  className?: string;
}) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`${copy.appleTop} ${copy.appleBottom}`}
      data-cta={cta}
      className={cn(
        "focus-ring inline-flex shrink-0 rounded-[0.7rem] transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      <Image
        src={BADGES[copy.locale].apple}
        alt=""
        width={177}
        height={56}
        priority
        style={{ width: "auto", height: "3.25rem" }}
      />
    </a>
  );
}

export function StoreBadges({
  copy,
  stack = false,
  alwaysInline = false,
  className,
  cta = "stores",
}: {
  copy: HomeContent["stores"];
  stack?: boolean;
  alwaysInline?: boolean;
  className?: string;
  cta?: string;
}) {
  const assets = BADGES[copy.locale];

  return (
    <div
      className={cn(
        "flex gap-2.5",
        alwaysInline
          ? "w-full flex-row flex-wrap items-center justify-center"
          : stack
            ? "w-full flex-col items-start"
            : "w-full flex-col items-start sm:w-auto sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      <Badge
        href={APP_STORE_URL}
        src={assets.apple}
        alt={`${copy.appleTop} ${copy.appleBottom}`}
        store="apple"
        stack={stack}
        alwaysInline={alwaysInline}
        cta={`${cta}-apple`}
      />
      <Badge
        href={PLAY_STORE_URL}
        src={assets.play}
        alt={`${copy.playTop} ${copy.playBottom}`}
        store="play"
        stack={stack}
        alwaysInline={alwaysInline}
        cta={`${cta}-play`}
      />
    </div>
  );
}
