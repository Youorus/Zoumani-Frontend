"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/lib/theme/theme-provider";

/**
 * La bascule clair / sombre de l'espace personnel.
 *
 * ═══ Deux états et non trois ═══
 *
 * Le réglage complet propose aussi « comme le système ». Il n'apparaît
 * pas ici : dans un en-tête, un bouton doit répondre à une question
 * simple — « je veux clair ou sombre » — et un troisième choix oblige à
 * réfléchir à ce que fait son téléphone. Le mode système reste
 * accessible par les réglages, pour qui le cherche.
 *
 * ═══ Ce que dit le bouton ═══
 *
 * L'icône montre **ce vers quoi on va**, jamais l'état courant : une
 * lune sur fond clair veut dire « passer en sombre ». L'inverse se lit
 * comme une information et personne ne clique.
 */
export function ThemeToggle({ label }: { label: { toDark: string; toLight: string } }) {
  const { colorScheme, setColorScheme } = useTheme();
  const sombre = colorScheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setColorScheme(sombre ? "light" : "dark")}
      className="focus-ring grid size-10 place-items-center rounded-full border border-border/70 text-foreground transition-colors hover:bg-muted"
      aria-label={sombre ? label.toLight : label.toDark}
      title={sombre ? label.toLight : label.toDark}
    >
      {sombre ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
