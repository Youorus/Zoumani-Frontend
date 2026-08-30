import { CITIES, COUNTRY_NAMES, type City } from "./cities";

/**
 * La recherche de ville, pour la complétion.
 *
 * ═══ Ce qui est comparé ═══
 *
 * La saisie est repliée : accents ôtés, casse ignorée, tirets et
 * apostrophes traités comme des espaces. « abidjan », « Abidjan » et
 * « ABIDJAN » trouvent la même chose, et « cote d ivoire » trouve la
 * Côte d'Ivoire — sur un clavier de téléphone, personne ne compose une
 * apostrophe typographique.
 *
 * ═══ Ce qui remonte en premier ═══
 *
 * Ce qui **commence** par la saisie, avant ce qui la contient. Taper
 * « dou » doit donner Douala avant Bandoua : on cherche presque toujours
 * par le début, et l'ordre inverse donne l'impression que la complétion
 * ne comprend pas.
 *
 * ═══ Pourquoi la liste reste ouverte ═══
 *
 * Ces suggestions ne contraignent rien : le champ accepte n'importe quel
 * texte. Fermer la liste ferait renoncer exactement les personnes dont
 * le trajet nous apprendrait le plus — celles qu'on n'avait pas prévues.
 */

/** Assez pour choisir, trop peu pour avoir à lire. */
export const MAX_SUGGESTIONS = 6;

/** En dessous, toute liste serait du bruit. */
const MIN_QUERY = 2;

function fold(value: string): string {
  return value
    .normalize("NFD")
    // Les diacritiques, que `NFD` a séparés de leur lettre.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’\-_.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Le repli d'une ville, calculé une fois pour toutes au chargement. */
const FOLDED: ReadonlyArray<readonly [City, string]> = CITIES.map(
  (city) => [city, fold(city[0])] as const,
);

export type Suggestion = {
  city: string;
  countryCode: string;
  /** « Douala, Cameroun » — ce qu'on affiche dans la liste. */
  label: string;
};

export function searchCities(query: string): Suggestion[] {
  const needle = fold(query);
  if (needle.length < MIN_QUERY) return [];

  const starts: Suggestion[] = [];
  const contains: Suggestion[] = [];

  for (const [city, folded] of FOLDED) {
    if (starts.length >= MAX_SUGGESTIONS) break;
    const position = folded.indexOf(needle);
    if (position < 0) continue;
    const suggestion: Suggestion = {
      city: city[0],
      countryCode: city[1],
      label: `${city[0]}, ${COUNTRY_NAMES[city[1]] ?? city[1]}`,
    };
    if (position === 0) starts.push(suggestion);
    else if (contains.length < MAX_SUGGESTIONS) contains.push(suggestion);
  }

  return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
}
