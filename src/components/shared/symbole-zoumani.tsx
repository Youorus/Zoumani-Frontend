import Image from "next/image";

/**
 * Le symbole de Zoumani : deux personnes qui se tendent la main, et dont
 * les bras forment une lemniscate.
 *
 * ═══ Pourquoi un fichier et non des tracés en ligne ═══
 *
 * Le vecteur fait 45 ko de coordonnées. Recopié dans un composant, il
 * partirait dans le bundle JavaScript de chaque page qui l'affiche —
 * ici, la page d'accueil, celle qu'un visiteur charge en premier.
 *
 * Servi comme fichier, il est mis en cache par le navigateur, partagé
 * entre tous ses usages sur la page, et compressé par le serveur. Et il
 * n'existe qu'en un exemplaire : `public/images/zoumani-symbole.svg` est
 * le même fichier que le favicon, donc rien ne peut diverger.
 *
 * ═══ Il est décoratif ═══
 *
 * `alt=""`. Le nom de la marque est toujours écrit à côté, en toutes
 * lettres. Un lecteur d'écran qui annoncerait « logo Zoumani » puis
 * « Zoumani » le dirait deux fois.
 */
export function SymboleZoumani({
  largeur,
  className = "",
}: {
  /** En pixels. La hauteur suit le ratio du dessin (1536 × 1024). */
  largeur: number;
  className?: string;
}) {
  return (
    <Image
      src="/images/zoumani-symbole.svg"
      alt=""
      width={largeur}
      height={Math.round((largeur * 1024) / 1536)}
      className={className}
      priority
    />
  );
}
