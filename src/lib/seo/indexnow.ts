import "server-only";

import { absoluteUrl, isIndexable, siteUrl } from "@/lib/seo/site";

/**
 * IndexNow — prévenir les moteurs qu'une page a changé.
 *
 * ═══ Ce que ça remplace ═══
 *
 * Sans lui, on attend que Bing ou Yandex repassent d'eux-mêmes, ce qui
 * prend de quelques jours à quelques semaines pour un site jeune et sans
 * historique. Une notification prend une seconde et déclenche la
 * visite. Google **ne participe pas** au protocole : pour lui, le plan
 * du site et Search Console restent la voie.
 *
 * ═══ Le fichier de clé, et pourquoi il n'est pas une route ═══
 *
 * Le protocole exige un fichier `{clé}.txt`, contenant la clé, servi à
 * la racine du domaine. Une route dynamique Next ne peut pas l'offrir :
 * le segment racine est déjà pris par `[intention]`, et deux segments
 * dynamiques au même niveau se refusent à la compilation.
 *
 * Le fichier est donc écrit dans `public/` avant la construction, par
 * `scripts/write-indexnow-key.mjs`. Il n'est pas versionné — c'est la
 * clé elle-même — et se régénère à chaque image.
 *
 * L'emplacement compte : une clé servie depuis un sous-dossier
 * n'autorise que les adresses de ce sous-dossier. À la racine, elle
 * autorise tout le domaine.
 *
 * ═══ Pourquoi rien n'est appelé depuis le navigateur ═══
 *
 * `INDEXNOW_KEY` n'est pas préfixé `NEXT_PUBLIC_` : elle ne doit jamais
 * entrer dans le paquet servi. Publiée, elle laisserait n'importe qui
 * signaler des changements en notre nom — et un signalement massif de
 * pages qui n'ont pas bougé fait retirer la clé par les moteurs.
 *
 * `import "server-only"` transforme l'oubli en erreur de compilation
 * plutôt qu'en fuite silencieuse.
 *
 * ═══ Quand l'appeler, et quand se taire ═══
 *
 * **À la publication ou à la modification réelle d'une page**, jamais à
 * la visite. Notifier sans changement est signalé comme abus par le
 * protocole, et le code 429 sanctionne. Concrètement : depuis un script
 * d'exploitation ou une action de publication, pas depuis un composant.
 *
 * ```ts
 * import { notifyIndexNow } from "@/lib/seo/indexnow";
 * await notifyIndexNow(["/envoyer-colis/paris-douala"]);
 * ```
 */

/** L'endpoint générique : il relaie aux moteurs participants. */
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** Le protocole accepte 10 000 adresses par envoi. */
const MAX_URLS = 10_000;

export type IndexNowResult =
  | { sent: true; count: number; status: number }
  | { sent: false; reason: string };

/**
 * Signale aux moteurs que ces adresses ont changé.
 *
 * @param paths Chemins relatifs (`/envoyer-un-colis`) ou adresses
 *   absolues sur le domaine du site. Les autres sont refusées : le
 *   protocole rend 422 si une adresse n'appartient pas à l'hôte déclaré.
 */
export async function notifyIndexNow(paths: readonly string[]): Promise<IndexNowResult> {
  const key = process.env.INDEXNOW_KEY;

  if (!key) return { sent: false, reason: "INDEXNOW_KEY absente" };
  if (!isIndexable) {
    // Un environnement de recette qui signalerait ses adresses ferait
    // indexer un domaine temporaire, en concurrence du vrai.
    return { sent: false, reason: "site non indexable" };
  }
  if (paths.length === 0) return { sent: false, reason: "aucune adresse" };
  if (paths.length > MAX_URLS) {
    return { sent: false, reason: `${paths.length} adresses, maximum ${MAX_URLS}` };
  }

  const host = new URL(siteUrl).host;
  const urlList = paths.map((path) =>
    path.startsWith("http") ? path : absoluteUrl(path),
  );

  const etrangere = urlList.find((url) => new URL(url).host !== host);
  if (etrangere) return { sent: false, reason: `adresse hors du domaine : ${etrangere}` };

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: absoluteUrl(`/${key}.txt`),
      urlList,
    }),
  });

  // 200 accepté, 202 reçu et en cours de validation. 403 signifie que le
  // fichier de clé n'est pas joignable — le cas le plus fréquent, et
  // celui qu'on veut lire en clair dans un journal plutôt que deviner.
  return { sent: response.ok, count: urlList.length, status: response.status } as IndexNowResult;
}
