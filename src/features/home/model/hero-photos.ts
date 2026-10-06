import type { HomeLanguage } from "../components/home-content";

export const HERO_PHOTO_INTERVAL_MS = 5_000;
export const HERO_PHOTO_LICENSE = "https://www.pexels.com/license/";

export interface HeroPhoto {
  id: string;
  src: string;
  author: string;
  source: string;
  alt: Record<HomeLanguage, string>;
}

/** Photographies Pexels hébergées localement ; crédits dans images/hero/CREDITS.md. */
export const HERO_PHOTOS: readonly HeroPhoto[] = [
  {
    id: "sourire-pagne",
    src: "/images/hero/zoumani-sourire-pagne.webp",
    author: "hashtag-melvin",
    source: "https://www.pexels.com/photo/36039096/",
    alt: {
      fr: "Un sourire chaleureux, avec une proche en arrière-plan.",
      en: "A warm smile, with a loved one in the background.",
    },
  },
  {
    id: "trois-generations",
    src: "/images/hero/zoumani-trois-generations.webp",
    author: "macd",
    source: "https://www.pexels.com/photo/38405256/",
    alt: {
      fr: "Deux femmes et une petite fille sourient, serrées les unes contre les autres.",
      en: "Two women and a little girl smiling as they hold each other close.",
    },
  },
  {
    id: "ouverture-colis",
    src: "/images/hero/zoumani-plaisir-colis.webp",
    author: "Mikhail Nilov",
    source: "https://www.pexels.com/photo/6969689/",
    alt: {
      fr: "Une femme sourit en ouvrant une boîte en carton.",
      en: "A woman smiling as she opens a cardboard box.",
    },
  },
  {
    id: "lien-video",
    src: "/images/hero/zoumani-lien-video.webp",
    author: "Askar Abayev",
    source: "https://www.pexels.com/photo/6193635/",
    alt: {
      fr: "Un couple en tenues colorées partage un sourire devant un téléphone.",
      en: "A couple in colourful outfits sharing a smile as they look at a phone.",
    },
  },
];

export const HERO_PHOTO_CONTROLS: Record<HomeLanguage, { pause: string; resume: string }> = {
  fr: { pause: "Mettre les photos en pause", resume: "Reprendre le défilement des photos" },
  en: { pause: "Pause photos", resume: "Resume photo slideshow" },
};
