"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { HERO_PHOTOS, HERO_PHOTO_CONTROLS, HERO_PHOTO_INTERVAL_MS } from "../../model/hero-photos";
import type { HomeLanguage } from "../home-content";
import styles from "./hero-portrait.module.css";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function motionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function visibilitySnapshot() {
  return document.visibilityState === "visible";
}

const motionServerSnapshot = () => true;
const visibilityServerSnapshot = () => false;

export function HeroPortrait({ language, caption, captionEmphasis }: {
  language: HomeLanguage;
  caption: string;
  captionEmphasis: string;
}) {
  const portrait = useRef<HTMLElement>(null);
  const loadedPhotos = useRef(new Set<number>());
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [ready, setReady] = useState<ReadonlySet<number>>(() => new Set());
  const [warmNext, setWarmNext] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, motionServerSnapshot);
  const pageVisible = useSyncExternalStore(subscribeVisibility, visibilitySnapshot, visibilityServerSnapshot);
  const next = (current + 1) % HERO_PHOTOS.length;
  const canRotate = visible && pageVisible && !reducedMotion && !paused;
  const currentReady = ready.has(current);
  const labels = HERO_PHOTO_CONTROLS[language];

  useEffect(() => {
    const element = portrait.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.15)),
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // La première photo reçoit seule la priorité. La suivante est préparée
  // après son chargement, uniquement si le diaporama peut tourner.
  useEffect(() => {
    if (!canRotate || !currentReady || warmNext) return;
    const timer = window.setTimeout(() => setWarmNext(true), 300);
    return () => window.clearTimeout(timer);
  }, [canRotate, currentReady, warmNext]);

  // Cinq secondes de lecture, puis un fondu si la suivante est prête.
  // Une connexion lente garde la photo en place plutôt qu'un cadre vide.
  useEffect(() => {
    if (!canRotate || !currentReady) return;
    let timer: number;
    const advance = () => {
      if (!loadedPhotos.current.has(next)) {
        timer = window.setTimeout(advance, 500);
        return;
      }
      setPrevious(current);
      setCurrent(next);
    };
    timer = window.setTimeout(advance, HERO_PHOTO_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [canRotate, current, currentReady, next]);

  const photoLoaded = (index: number) => {
    loadedPhotos.current.add(index);
    setReady((photos) => photos.has(index) ? photos : new Set([...photos, index]));
  };

  return (
    <figure ref={portrait} className={styles.portrait} data-hero-photo={HERO_PHOTOS[current].id}>
      {HERO_PHOTOS.map((photo, index) => (
        index === current || index === previous || (warmNext && index === next) ? (
          <Image
            key={photo.id}
            src={photo.src}
            alt={photo.alt[language]}
            fill
            sizes="(max-width: 600px) 82vw, (max-width: 1000px) 55vw, 480px"
            loading="eager"
            fetchPriority={index === 0 ? "high" : "low"}
            className={styles.photo}
            data-photo={photo.id}
            data-active={index === current}
            aria-hidden={index !== current}
            onLoad={() => photoLoaded(index)}
          />
        ) : null
      ))}
      <figcaption className={styles.caption}>
        {caption}<br /><strong>{captionEmphasis}</strong>
      </figcaption>
      {currentReady ? (
        <button
          type="button"
          className={styles.pauseButton}
          aria-label={paused ? labels.resume : labels.pause}
          title={paused ? labels.resume : labels.pause}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      ) : null}
    </figure>
  );
}
