/**
 * L'adaptateur Meta, et rien d'autre.
 *
 * ═══ Pourquoi un fichier séparé de `events.ts` ═══
 *
 * `events.ts` décide **quoi** mesurer ; ce fichier sait **comment** le
 * dire à Meta. La frontière n'est pas cosmétique : le jour où le pixel
 * part, c'est ce fichier qu'on supprime, et la taxonomie ne bouge pas.
 *
 * ═══ Il ne charge rien ═══
 *
 * Le chargement du pixel appartient à `components/analytics/meta-pixel.tsx`,
 * qui attend le consentement publicitaire. Ici, on se contente de parler
 * à `fbq` **s'il existe**. Absent — consentement refusé, pixel non
 * configuré, bloqueur —, chaque fonction ne fait rien. Une mesure qui
 * échoue ne doit jamais interrompre une inscription.
 *
 * ═══ L'identifiant d'événement, posé dès maintenant ═══
 *
 * `eventID` sert à la déduplication entre le pixel et la Conversions API.
 * Celle-ci n'est pas branchée, et ne le sera pas pour ce premier test.
 * Mais un événement envoyé sans identifiant est un événement qu'on ne
 * pourra jamais dédupliquer rétroactivement : le jour où le serveur
 * enverra le même `Lead`, Meta le comptera deux fois. Le poser coûte une
 * chaîne de caractères ; l'ajouter après coup coûte l'historique.
 *
 * On y met **l'identifiant de la préinscription rendu par le serveur** :
 * il est unique, opaque, et c'est précisément celui que la Conversions
 * API réutiliserait. Aucune donnée personnelle n'y transite.
 */

/** Les événements standards de Meta que ce site émet. Deux, pas plus. */
export type MetaStandardEvent = "PageView" | "Lead";

export type MetaParams = Record<string, string | number | boolean>;

type Fbq = ((...args: unknown[]) => void) & { loaded?: boolean };

function fbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  const candidat = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof candidat === "function" ? candidat : null;
}

/**
 * Les identifiants d'événements déjà envoyés.
 *
 * ═══ Pourquoi une garde, alors que React n'appelle qu'une fois ═══
 *
 * Un gestionnaire de clic ne se rejoue pas, mais un effet si — deux fois
 * en mode strict, et une fois de plus à chaque remontage. Le `Lead` est
 * la seule conversion du site : le compter deux fois fausserait le coût
 * d'acquisition dans le sens flatteur, celui qu'on ne remet pas en
 * question.
 *
 * La garde est portée par le module, donc elle survit au démontage du
 * composant et ne coûte rien.
 */
const dejaEnvoyes = new Set<string>();

/**
 * Signale un événement standard à Meta.
 *
 * Rend `true` si l'appel est parti — utile aux tests, et à personne
 * d'autre : aucun appelant ne doit changer de comportement selon qu'une
 * régie écoute ou non.
 */
export function metaTrack(
  event: MetaStandardEvent,
  params: MetaParams = {},
  eventId?: string,
): boolean {
  const track = fbq();
  if (!track) return false;

  if (eventId) {
    if (dejaEnvoyes.has(eventId)) return false;
    dejaEnvoyes.add(eventId);
  }

  track("track", event, params, eventId ? { eventID: eventId } : undefined);
  return true;
}

/** Remet la garde à zéro. Réservé aux tests — jamais appelé en production. */
export function _reinitialiserDedoublonnage() {
  dejaEnvoyes.clear();
}
