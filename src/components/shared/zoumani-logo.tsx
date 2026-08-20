import { cn } from "@/lib/utils/cn";

/**
 * Le mot-logo « Zoumani ».
 *
 * ═══ Du texte, et non une image ═══
 *
 * Il reste net à toute densité, se sélectionne, se lit par un lecteur
 * d'écran, et suit les réglages de taille du navigateur. Une image aurait
 * demandé trois exports et n'aurait suivi ni le thème ni le zoom.
 *
 * ═══ La casse ═══
 *
 * Capitale initiale. C'est un nom propre, et la charte le pose ainsi. Le
 * mot était en bas-de-casse ici et dans l'application mobile — une
 * divergence qui rendait le logo différent de lui-même selon l'écran où on
 * le regardait.
 *
 * ═══ Le crénage ═══
 *
 * `-0.02em`, et non `-0.055em`. Le serrage avait été réglé pour un mot tout
 * en minuscules, où les lettres ont la même hauteur ; une capitale initiale
 * à ce serrage vient toucher le `o` qui la suit.
 *
 * ═══ La couleur ═══
 *
 * `text-wordmark` : le bordeaux profond de la charte, crème en mode sombre.
 * Ce n'est plus `text-foreground` — le mot-logo n'est pas du texte
 * d'interface qui suivrait la couleur de lecture, c'est la marque. Les deux
 * se confondaient tant que la marque n'avait pas sa couleur.
 *
 * `inverse` reste distinct du mode sombre : il sert à poser le mot sur une
 * photographie ou un aplat foncé, qui ne s'éclaircissent pas le jour.
 */
export function ZoumaniLogo({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span
      className={cn(
        "block font-sans text-[2rem] leading-none font-black tracking-[-0.02em] sm:text-[2.4rem]",
        inverse ? "text-inverse-foreground" : "text-wordmark",
        className,
      )}
    >
      Zoumani
    </span>
  );
}
