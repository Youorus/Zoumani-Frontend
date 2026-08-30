import { describe, expect, it } from "vitest";

import { ENTRY_PAGES } from "@/features/prelaunch/model/entry-pages";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";
import { organizationSchema } from "@/lib/seo/structured-data";
import sitemap from "@/app/sitemap";

/**
 * Ce que ces tests protègent réellement.
 *
 * Chacun correspond à un défaut trouvé en production le 30 août 2026, et
 * non à une bonne pratique récitée. Un test de référencement qui ne
 * décrit pas une panne observée ne fait que figer une opinion.
 */

describe("Métadonnées de page", () => {
  const meta = pageMetadata({
    path: "/preinscription",
    title: "Se pré-inscrire à l’ouverture",
    description: "Dites-nous votre trajet.",
  });

  it("porte toujours une image sociale", () => {
    // Trois pages en manquaient — préinscription, envoyer un colis,
    // proposer un voyage — parce que déclarer `openGraph` dans une page
    // remplace celui du layout au lieu de le compléter. Partagées, elles
    // s'affichaient en lien nu.
    const images = meta.openGraph?.images;
    expect(Array.isArray(images) && images.length).toBeTruthy();
  });

  it("fait pointer og:url sur la page, pas sur la racine", () => {
    // Les quatre pages contractuelles annonçaient toutes
    // `og:url = https://zoumani.fr`, quelle que soit la page partagée.
    expect(meta.openGraph?.url).toBe(`${siteConfig.url}/preinscription`);
  });

  it("aligne la canonique sur le chemin de la page", () => {
    expect(meta.alternates?.canonical).toBe("/preinscription");
  });
});

describe("Identité déclarée à Google", () => {
  it("n'affirme aucun profil social non vérifié", () => {
    // `sameAs` n'est pas une liste de liens, c'est une déclaration
    // d'identité. Quatre adresses devinées y figuraient, dont
    // `instagram.com/zoumani` — le compte personnel d'une personne
    // réelle, sans lien avec la marque.
    const sameAs = (organizationSchema as { sameAs?: readonly string[] }).sameAs;
    for (const url of sameAs ?? []) {
      expect(Object.values(siteConfig.social)).toContain(url);
    }
  });

  it("laisse la clé absente plutôt que vide", () => {
    // `sameAs: []` affirme que l'entreprise n'a aucun profil. Le silence
    // laisse la question ouverte, ce qui est la vérité.
    if (Object.keys(siteConfig.social).length === 0) {
      expect("sameAs" in organizationSchema).toBe(false);
    }
  });
});

describe("FAQ", () => {
  it("donne à chaque page d’entrée ses propres questions", () => {
    // Les deux pages affichaient la FAQ de l'accueil, au mot près, et la
    // déclaraient chacune en `FAQPage`. Trois pages du même site portant
    // un contenu principal identique se concurrencent : Google en retient
    // une pour la requête, et les deux autres ont travaillé contre elle.
    const paires = ENTRY_PAGES.flatMap((a, i) =>
      ENTRY_PAGES.slice(i + 1).map((b) => [a, b] as const),
    );
    for (const [a, b] of paires) {
      const communes = a.faq
        .map((q) => q.question)
        .filter((q) => b.faq.some((autre) => autre.question === q));
      expect(communes).toEqual([]);
    }
  });

  it("répond depuis le côté du marché de la page", () => {
    // Une FAQ d'expéditeur servie à un voyageur répond à côté : il veut
    // savoir ce qu'il gagne et ce qu'il risque, pas ce que coûte un envoi.
    const voyageur = ENTRY_PAGES.find((p) => p.intention === "traveler");
    const texte = voyageur?.faq.map((q) => q.question).join(" ") ?? "";
    expect(texte).toMatch(/gagner|payé|responsable/i);
  });

  it("ne laisse aucune page d’entrée sans FAQ", () => {
    // La déclarer en JSON-LD sans rien afficher expose à une action
    // manuelle qui retire tous les résultats enrichis du site.
    for (const page of ENTRY_PAGES) {
      expect(page.faq.length).toBeGreaterThan(2);
      for (const item of page.faq) {
        expect(item.answer.length).toBeGreaterThan(80);
      }
    }
  });
});

describe("Plan du site", () => {
  const entrees = sitemap();

  it("ne déclare que des adresses absolues, sur le domaine canonique", () => {
    // Le protocole n'est pas testé en dur : en test `NEXT_PUBLIC_APP_URL`
    // vaut localhost, et exiger « https » ici ferait échouer une suite
    // pour une raison qui n'a rien à voir avec le plan du site. Ce qui
    // compte est qu'aucune adresse ne soit relative ni sur un autre hôte
    // — c'est le seul défaut que ce fichier puisse introduire. Le HTTPS
    // de production est vérifié en dehors, sur les URL réelles.
    for (const entree of entrees) {
      expect(entree.url.startsWith(siteConfig.url)).toBe(true);
    }
  });

  it("n'a pas de barre finale, comme les canoniques", () => {
    // Le plan annonçait « https://zoumani.fr/ » quand la canonique de
    // l'accueil dit « https://zoumani.fr » : deux adresses pour une page,
    // dont l'une contredit l'autre.
    for (const entree of entrees) {
      expect(entree.url).not.toMatch(/.+\/$/);
    }
  });

  it("date chaque page, sans prétendre qu'elle vient de changer", () => {
    // `lastModified` valait `new Date()` : toutes les pages annonçaient
    // avoir changé à l'instant, en permanence. Google cesse alors de se
    // fier au signal pour tout le site.
    const aujourdhui = new Date().toISOString().slice(0, 10);
    for (const entree of entrees) {
      expect(entree.lastModified).toBeTruthy();
      expect(String(entree.lastModified)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const fraiches = entrees.filter((e) => String(e.lastModified) === aujourdhui);
    expect(fraiches.length).toBeLessThan(entrees.length);
  });

  it("contient chaque page publique, et rien d'autre", () => {
    const chemins = entrees.map((e) => e.url.replace(siteConfig.url, "") || "/");
    for (const page of ENTRY_PAGES) {
      expect(chemins).toContain(`/${page.slug}`);
    }
    for (const contractuel of ["/cgu", "/confidentialite", "/cookies", "/mentions-legales"]) {
      expect(chemins).toContain(contractuel);
    }
    // Aucune adresse paramétrée : `?type=sender` mène au même contenu que
    // `/preinscription`, et l'indexer produirait trois adresses pour une
    // page.
    expect(chemins.some((c) => c.includes("?"))).toBe(false);
  });
});
