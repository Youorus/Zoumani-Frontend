/**
 * Les règles du formulaire, sans React : ce qui peut partir, et pourquoi
 * pas. Testées à part, parce que c'est ici qu'une régression coûterait
 * une demande refusée à tort — ou envoyée sans confirmation.
 */

export type Step = "email" | "code" | "done";

/** Ne refuse que l'évidence : le serveur revalide, et une adresse
 *  inhabituelle mais réelle ne doit pas être bloquée ici. */
export function emailLooksValid(email: string): boolean {
  const clean = email.trim();
  return clean.length >= 3 && clean.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

/** Le code est numérique, six chiffres côté serveur — on tolère l'espace
 *  qu'un copier-coller depuis le courriel ajoute parfois. */
export function normalizeCode(code: string): string {
  return code.replace(/\s+/g, "");
}

export function codeLooksValid(code: string): boolean {
  return /^\d{4,12}$/.test(normalizeCode(code));
}

export function canRequest(email: string, confirmed: boolean): boolean {
  return emailLooksValid(email) && confirmed;
}
