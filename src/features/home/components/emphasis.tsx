import type { ReactNode } from "react";

/**
 * Pose un mot en italique dans un titre.
 *
 * Le contenu écrit `{em}` là où le mot tombe, et le mot à part : la
 * traduction peut le déplacer dans la phrase sans toucher au balisage,
 * et le test du dictionnaire vérifie que les deux moitiés existent.
 *
 * Le `<em>` est sémantique autant que visuel : un lecteur d'écran
 * marque l'insistance, et Fraunces y prend ses formes calligraphiques.
 */
export function Emphasis({
  text,
  emphasis,
  className,
}: {
  text: string;
  emphasis: string;
  className?: string;
}): ReactNode {
  const [avant, apres] = text.split("{em}");
  if (apres === undefined) return text;
  return (
    <>
      {avant}
      <em className={className}>{emphasis}</em>
      {apres}
    </>
  );
}
