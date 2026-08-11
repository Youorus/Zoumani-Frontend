/**
 * Le pays d'un numéro de téléphone : drapeau, nom, indicatif.
 *
 * ═══ Ce que ce fichier NE contient pas ═══
 *
 * Aucune liste de pays. Elle vient de `GET /auth/phone-countries`, donc de
 * la bibliothèque qui **valide** les numéros côté serveur. Embarquer la
 * nôtre ici serait le réflexe naturel, et produirait la panne la plus
 * pénible qui soit : quelqu'un choisit son pays, saisit un numéro correct,
 * et se voit refuser sans comprendre pourquoi.
 *
 * Aucune traduction non plus. Le navigateur sait nommer un pays dans la
 * langue de qui regarde, et il le fait mieux que nous : deux cent
 * quarante-cinq noms à traduire, puis à maintenir, pour un résultat déjà
 * présent dans le système.
 *
 * ═══ Le drapeau se calcule, il ne se télécharge pas ═══
 *
 * Un drapeau emoji est la suite des deux lettres du code pays décalées
 * dans le bloc des « indicateurs régionaux » d'Unicode. Deux caractères,
 * aucune image, aucune requête, et le rendu suit la police du système.
 */

/** Un pays proposable, tel que l'API le rend. */
export interface RawPhoneCountry {
  code: string;
  calling_code: string;
  example_national_number: string;
}

/** Un pays prêt à afficher. */
export interface PhoneCountry {
  /** Région ISO 3166-1 alpha-2, par exemple `CM`. */
  code: string;
  /** Nom dans la langue de qui regarde, par exemple « Cameroun ». */
  name: string;
  /** Indicatif international, par exemple `+237`. */
  callingCode: string;
  /** Drapeau emoji, par exemple 🇨🇲. */
  flag: string;
  /** Numéro d'exemple du pays, repère de saisie. Vide si inconnu. */
  example: string;
}

/**
 * Point de code de la lettre `A` dans le bloc des indicateurs régionaux.
 *
 * Un couple d'indicateurs — `🇨` + `🇲` — s'affiche comme un drapeau unique.
 * Sur les systèmes qui n'en embarquent pas le rendu (Windows), les deux
 * lettres restent lisibles : la dégradation est acceptable, elle affiche
 * « CM » au lieu de rien.
 */
const REGIONAL_INDICATOR_A = 0x1f1e6;
const LETTER_A = "A".charCodeAt(0);

/** Drapeau emoji correspondant à un code pays ISO. */
export function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) {
    return "";
  }
  return [...code.toUpperCase()]
    .map((letter) =>
      String.fromCodePoint(letter.charCodeAt(0) - LETTER_A + REGIONAL_INDICATOR_A),
    )
    .join("");
}

/**
 * Nom du pays dans la langue demandée.
 *
 * Pour une région qu'il ne connaît pas, le système rend lui-même une
 * étiquette traduite — « région inconnue » — plutôt que de lever. Le repli
 * sur le code ne sert donc que dans les rares environnements où
 * `Intl.DisplayNames` manque ou échoue : afficher « ZZ » reste préférable
 * à une ligne vide dans un sélecteur.
 */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Prépare la liste pour l'affichage : nom traduit, drapeau, tri local.
 *
 * Le tri se fait avec `Intl.Collator` et non avec `<` : en français,
 * « Égypte » doit se ranger entre « Écosse » et « Émirats », ce qu'une
 * comparaison de points de code place au contraire après « Zimbabwe ».
 */
export function toDisplayCountries(
  raw: readonly RawPhoneCountry[],
  locale: string,
): PhoneCountry[] {
  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  return raw
    .map((country) => ({
      code: country.code,
      name: countryName(country.code, locale),
      callingCode: country.calling_code,
      flag: flagEmoji(country.code),
      example: country.example_national_number,
    }))
    .sort((left, right) => collator.compare(left.name, right.name));
}

/**
 * Pays présélectionné, deviné puis vérifié.
 *
 * La région de la langue du navigateur est le meilleur indice disponible
 * sans rien demander : quelqu'un dont le système est en `fr-CM` est très
 * probablement au Cameroun. On ne fait que **préremplir** — le sélecteur
 * reste ouvert, et une erreur de devinette coûte un clic.
 *
 * Vérifié contre la liste réelle avant d'être retenu : une région devinée
 * mais absente du référentiel donnerait un formulaire impossible à
 * soumettre, sans que rien n'explique pourquoi.
 */
export function guessCountry(
  countries: readonly PhoneCountry[],
  locales: readonly string[],
  fallback: string,
): string {
  const known = new Set(countries.map((country) => country.code));

  for (const locale of locales) {
    const region = regionOf(locale);
    if (region && known.has(region)) {
      return region;
    }
  }
  return known.has(fallback) ? fallback : (countries[0]?.code ?? fallback);
}

/** Région d'une étiquette de langue — `fr-CM` donne `CM`. */
function regionOf(locale: string): string | null {
  try {
    return new Intl.Locale(locale).maximize().region ?? null;
  } catch {
    return null;
  }
}
