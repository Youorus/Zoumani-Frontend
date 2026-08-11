import type { HomeLanguage } from "@/features/home/components/home-content";

/**
 * La langue d'un compte, ramenée à ce que l'interface sait écrire.
 *
 * `preferred_language` accepte n'importe quel code ISO 639-1 — quelqu'un
 * peut parfaitement demander le wolof. L'interface, elle, n'existe qu'en
 * deux langues. Tout le reste retombe sur le français, qui est la langue
 * administrative du corridor principal de Zoumani : quelqu'un dont on ne
 * sait rien a bien plus de chances de le lire que l'anglais.
 *
 * La même règle vaut côté API pour les e-mails et les SMS — l'écran et la
 * boîte mail ne se contredisent donc jamais.
 */
export function accountLanguage(preferred: string | null | undefined): HomeLanguage {
  return preferred?.slice(0, 2).toLowerCase() === "en" ? "en" : "fr";
}
