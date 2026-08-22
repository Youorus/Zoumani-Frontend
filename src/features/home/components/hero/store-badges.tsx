import { cn } from "@/lib/utils/cn";
import type { HomeContent } from "../home-content";

/**
 * Les deux badges de magasin.
 *
 * ═══ Pourquoi les badges sont dessinés ici ═══
 *
 * Apple et Google fournissent des images officielles, soumises à leurs
 * règles de marque — proportions, marges, couleurs, mentions légales. Les
 * embarquer demande de les télécharger depuis leurs kits et d'accepter
 * leurs conditions. Ce sont des fichiers à poser, pas du code à écrire :
 * le jour où l'application est publiée, on remplace ces deux blocs par les
 * images officielles, ce qui est aussi le moment où l'on a le droit de
 * s'en servir.
 *
 * ═══ Pourquoi ils ne sont pas cliquables sans adresse ═══
 *
 * Un badge qui mène à une fiche inexistante coûte plus cher que pas de
 * badge : le visiteur en conclut que le service n'existe pas, et il a
 * raison. Tant que `NEXT_PUBLIC_APP_STORE_URL` et son équivalent Play sont
 * vides, ce sont des `<div>`, pas des liens — et la mention « Bientôt »
 * dit pourquoi.
 *
 * ═══ Les deux tons ═══
 *
 * `dark` sur le crème du hero, `light` sur l'argile du pied de page. Ce
 * n'est pas un thème : les deux coexistent sur la même page, dans la même
 * lumière. Un badge sombre sur l'argile disparaîtrait.
 */

const APP_STORE = process.env.NEXT_PUBLIC_APP_STORE_URL;
const PLAY_STORE = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

function Pomme({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-[1.625rem] shrink-0", className)}
      aria-hidden
    >
      <path d="M17.05 12.94c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.15-3 .9-3.78.9-.78 0-1.98-.88-3.25-.86-1.67.02-3.21.97-4.07 2.46-1.73 3-.44 7.45 1.25 9.89.82 1.19 1.81 2.53 3.11 2.48 1.25-.05 1.72-.81 3.23-.81 1.51 0 1.93.81 3.25.78 1.34-.02 2.19-1.21 3.01-2.41.95-1.38 1.34-2.72 1.36-2.79-.03-.01-2.61-1-2.63-3.96ZM14.6 5.6c.69-.83 1.15-2 1.02-3.15-.99.04-2.19.66-2.9 1.49-.64.73-1.19 1.9-1.04 3.02 1.1.09 2.23-.56 2.92-1.36Z" />
    </svg>
  );
}

function Play() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.625rem] shrink-0" aria-hidden>
      <path
        d="M3.6 2.3a1 1 0 0 0-.5.87v17.66a1 1 0 0 0 .5.87l9.36-9.7L3.6 2.3Z"
        fill="#34a853"
      />
      <path
        d="M17.9 9.02 14.4 7 12.96 12l1.44 5 3.5-2.02c1.2-.7 1.2-2.26 0-2.96Z"
        fill="#fbbc04"
      />
      <path
        d="m3.6 2.3 9.36 9.7L14.4 7 5.02 1.6a1.2 1.2 0 0 0-1.42.7Z"
        fill="#ea4335"
      />
      <path
        d="m3.6 21.7 9.36-9.7 1.44 5-9.38 5.4a1.2 1.2 0 0 1-1.42-.7Z"
        fill="#4285f4"
      />
    </svg>
  );
}

type Tone = "dark" | "light";

function Badge({
  href,
  tone,
  icone,
  ligneHaute,
  ligneBasse,
  stack,
}: {
  href?: string;
  tone: Tone;
  icone: React.ReactNode;
  ligneHaute: string;
  ligneBasse: string;
  stack: boolean;
}) {
  const classe = cn(
    "inline-flex h-[3.625rem] items-center gap-[0.8rem] rounded-[0.875rem] px-6",
    // Pleine largeur tant qu'ils sont empilés : deux boutons de largeurs
    // differentes l'un sous l'autre se lisent comme une erreur de gabarit.
    stack ? "w-full justify-center" : "w-full justify-center sm:w-auto sm:justify-start",
    tone === "dark"
      ? "bg-foreground text-inverse-foreground"
      : "bg-inverse-foreground text-foreground",
  );

  const contenu = (
    <>
      {icone}
      <span className="text-left leading-tight">
        <span
          className={cn(
            "block text-[0.625rem] font-semibold tracking-[0.06em]",
            tone === "dark"
              ? "text-inverse-muted-foreground"
              : "text-muted-foreground",
          )}
        >
          {ligneHaute}
        </span>
        <span className="block text-[1.125rem] font-bold tracking-[-0.01em]">
          {ligneBasse}
        </span>
      </span>
    </>
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`focus-ring ${classe}`}
    >
      {contenu}
    </a>
  ) : (
    <div className={classe} aria-disabled="true">
      {contenu}
    </div>
  );
}

export function StoreBadges({
  copy,
  tone = "dark",
  stack = false,
  className,
}: {
  copy: HomeContent["stores"];
  tone?: Tone;
  /**
   * Empilés à toutes les largeurs. Par défaut ils s'empilent sous `sm` et
   * se mettent en ligne au-delà — la disposition du hero. Le pied de page,
   * lui, les garde toujours en colonne dans sa propre colonne étroite.
   */
  stack?: boolean;
  className?: string;
}) {
  const publie = Boolean(APP_STORE || PLAY_STORE);

  return (
    <div
      className={cn(
        "flex gap-3.5",
        stack
          ? "w-full flex-col items-stretch"
          : "w-full flex-col items-stretch sm:w-auto sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      <Badge
        href={APP_STORE}
        tone={tone}
        icone={<Pomme />}
        ligneHaute={copy.appleTop}
        ligneBasse={copy.appleBottom}
        stack={stack}
      />
      <Badge
        href={PLAY_STORE}
        tone={tone}
        icone={<Play />}
        ligneHaute={copy.playTop}
        ligneBasse={copy.playBottom}
        stack={stack}
      />
      {publie ? null : (
        <span
          className={cn(
            "self-center rounded-full text-[0.6875rem] font-extrabold tracking-[0.14em] uppercase",
            stack ? "" : "sm:self-center",
            tone === "dark"
              ? "bg-secondary/28 px-3 py-1.5 text-accent"
              : "text-inverse-muted-foreground",
          )}
        >
          {copy.soon}
        </span>
      )}
    </div>
  );
}
