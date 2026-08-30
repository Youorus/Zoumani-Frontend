import type { MetadataRoute } from "next";

import { ENTRY_PAGES } from "@/features/prelaunch/model/entry-pages";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Le plan du site.
 *
 * ═══ Pourquoi `lastmod` est écrit à la main ═══
 *
 * Il valait `new Date()`, recalculé à chaque requête : toutes les pages
 * annonçaient donc avoir changé à l'instant, en permanence. Google traite
 * un `lastmod` systématiquement égal à maintenant comme une valeur non
 * fiable et **cesse de s'y fier pour tout le site** — on perd alors le
 * seul signal qui permet de dire « cette page-ci a vraiment changé,
 * reviens la voir ».
 *
 * Une date écrite à la main est tenue à la main : elle se met à jour dans
 * le commit qui change le contenu de la page, comme le reste de la
 * documentation. C'est un peu de discipline contre un signal qui marche.
 *
 * ═══ Ce qu'on n'écrit pas ═══
 *
 * Ni `changefreq` ni `priority`. Google a annoncé publiquement les
 * ignorer, et les valeurs qui y figuraient — « daily » pour un site qui
 * change une fois par semaine, une priorité de 0,2 pour des mentions
 * légales — étaient inventées. Un signal faux n'est pas neutre : il
 * apprend au moteur à se méfier du fichier.
 *
 * ═══ Ce que le plan ne contient pas ═══
 *
 * Aucune adresse portant `?type=sender` ou `?type=traveler` : elles
 * mènent au même contenu que `/preinscription`, et les indexer
 * produirait trois adresses pour une page. Aucune route d'API, aucune
 * page privée — il n'en existe pas encore, et le jour où il en existera,
 * elles n'entreront pas ici.
 */

/**
 * Date de dernière modification réelle de chaque page.
 *
 * **À mettre à jour dans le commit qui change la page.** Une date qui ne
 * bouge pas quand le contenu bouge vaut mieux qu'une date toujours
 * fraîche : dans le premier cas Google recrawle un peu tard, dans le
 * second il n'écoute plus.
 */
const MODIFIE_LE: Readonly<Record<string, string>> = {
  "/": "2026-08-30",
  "/preinscription": "2026-08-30",
  "/envoyer-un-colis": "2026-08-29",
  "/proposer-un-voyage": "2026-08-29",
  "/cgu": "2026-08-30",
  "/confidentialite": "2026-08-30",
  "/cookies": "2026-08-30",
  "/mentions-legales": "2026-08-30",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const chemins = [
    "/",
    "/preinscription",
    ...ENTRY_PAGES.map((page) => `/${page.slug}`),
    "/cgu",
    "/confidentialite",
    "/cookies",
    "/mentions-legales",
  ];

  return chemins.map((chemin) => ({
    // `absoluteUrl("/")` rend « https://zoumani.fr/ » avec une barre
    // finale, quand la canonique de l'accueil dit « https://zoumani.fr ».
    // Deux adresses pour une page, dont l'une contredit l'autre : on
    // aligne le plan sur la canonique, qui fait foi.
    url: absoluteUrl(chemin).replace(/\/$/, "") || absoluteUrl("/"),
    lastModified: MODIFIE_LE[chemin],
  }));
}
