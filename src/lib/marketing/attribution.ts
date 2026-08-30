/**
 * D'où vient le visiteur, et comment on le retient jusqu'à l'inscription.
 *
 * ═══ Pourquoi conserver ═══
 *
 * Les paramètres d'une campagne ne vivent que dans l'URL d'arrivée. Un
 * clic sur « en savoir plus », un retour en arrière, et ils ont disparu —
 * alors que l'inscription, elle, arrive trois écrans plus loin. Sans
 * conservation, toutes les inscriptions paraîtraient organiques et l'on
 * ne saurait plus quelle campagne paie.
 *
 * ═══ Pourquoi `sessionStorage` ═══
 *
 * La visite est l'unité qui compte. `localStorage` attribuerait à une
 * publicité de janvier une inscription de mars — un mensonge flatteur
 * qui fausse le coût d'acquisition.
 *
 * ═══ Ce qu'on ne fait pas ═══
 *
 * Aucune normalisation : c'est la régie qui nomme ces valeurs, et les
 * retoucher empêcherait de recouper avec ses propres rapports.
 */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/** Identifiants de clic : Google, Meta, TikTok, Microsoft. */
export const CLICK_KEYS = ["gclid", "fbclid", "ttclid", "msclkid"] as const;

export type Attribution = Partial<
  Record<(typeof UTM_KEYS)[number] | (typeof CLICK_KEYS)[number], string>
>;

const KEY = "zoumani.attribution";
const MAX = 255;

/**
 * Lit l'URL, garde ce qui s'y trouve, et rend l'attribution complète.
 *
 * La première visite fait foi : une campagne déjà retenue n'est pas
 * écrasée par une navigation interne qui aurait perdu les paramètres.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const trouve: Attribution = {};
  for (const key of [...UTM_KEYS, ...CLICK_KEYS]) {
    const value = params.get(key)?.trim().slice(0, MAX);
    if (value) trouve[key] = value;
  }

  const retenu = readAttribution();
  if (Object.keys(trouve).length === 0) return retenu;

  // Ce que l'URL porte l'emporte : on vient d'arriver par ce lien.
  const fusion = { ...retenu, ...trouve };
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(fusion));
  } catch {
    /* Navigation privée, quota : on continue sans mémoire. */
  }
  return fusion;
}

/** Rend l'attribution retenue. Un objet vide signifie « visite organique »,
 *  ce qui est une information en soi. */
export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
