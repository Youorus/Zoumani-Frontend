import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import type { HomeContent } from "../home-content";

const APP_STORE = process.env.NEXT_PUBLIC_APP_STORE_URL;
const PLAY_STORE = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

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

type Tone = "dark" | "light";
type Store = "apple" | "play";

function Badge({
  href,
  src,
  alt,
  store,
  stack,
  alwaysInline,
}: {
  href?: string;
  src: string;
  alt: string;
  store: Store;
  stack: boolean;
  alwaysInline: boolean;
}) {
  const className = cn(
    "focus-ring inline-flex min-w-0 items-center justify-center rounded-[0.65rem]",
    store === "apple" ? "max-w-[11rem]" : "max-w-[12rem]",
    alwaysInline
      ? "flex-1"
      : stack
        ? "w-full"
        : "w-full sm:w-auto sm:flex-none",
  );

  const artwork = (
    <Image
      src={src}
      alt={alt}
      width={store === "apple" ? 177 : 194}
      height={store === "apple" ? 56 : 75}
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
    >
      {artwork}
    </a>
  ) : (
    <div className={className} aria-disabled="true">
      {artwork}
    </div>
  );
}

export function StoreBadges({
  copy,
  tone = "dark",
  stack = false,
  alwaysInline = false,
  className,
}: {
  copy: HomeContent["stores"];
  tone?: Tone;
  stack?: boolean;
  alwaysInline?: boolean;
  className?: string;
}) {
  const published = Boolean(APP_STORE || PLAY_STORE);
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
        href={APP_STORE}
        src={assets.apple}
        alt={`${copy.appleTop} ${copy.appleBottom}`}
        store="apple"
        stack={stack}
        alwaysInline={alwaysInline}
      />
      <Badge
        href={PLAY_STORE}
        src={assets.play}
        alt={`${copy.playTop} ${copy.playBottom}`}
        store="play"
        stack={stack}
        alwaysInline={alwaysInline}
      />
      {published ? null : (
        <span
          className={cn(
            "self-center text-[0.6875rem] font-extrabold tracking-[0.14em] uppercase",
            alwaysInline ? "w-full text-center" : stack ? "" : "sm:self-center",
            tone === "dark" ? "text-accent" : "text-inverse-muted-foreground",
          )}
        >
          {copy.soon}
        </span>
      )}
    </div>
  );
}
