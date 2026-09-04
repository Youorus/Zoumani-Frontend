"use client";

import { useEffect } from "react";

import { readAttribution } from "@/lib/marketing/attribution";
import { EVENTS, track } from "@/lib/marketing/events";

/**
 * Ce que la page mesure d'elle-même.
 *
 * ═══ Pourquoi ces mesures-là ═══
 *
 * Quand personne ne clique, une visite et un rebond se ressemblent. La
 * **profondeur de défilement** et le **temps passé** les séparent : on
 * apprend qu'une publicité amène du monde qui repart au premier écran —
 * ce qui se corrige — plutôt qu'un simple « ça ne convertit pas ».
 *
 * Les **sections vues** disent où l'on s'arrête. Si la moitié des
 * visiteurs ne voit jamais la FAQ, c'est qu'elle est trop bas.
 *
 * ═══ Ce qu'on ne mesure pas ═══
 *
 * Aucun mouvement de souris, aucune frappe, aucun enregistrement de
 * session. Ce qui est mesuré ici est ce qui sert à décider ; le reste
 * serait de la surveillance sans usage.
 *
 * ═══ Rien ne part avant qu'une régie existe ═══
 *
 * `track` pousse dans `dataLayer` si un conteneur est présent, et se
 * contente de la console sinon. Aucun appel réseau n'est ajouté au site.
 */

/** Les paliers de défilement. Quatre suffisent : au-delà, on mesure du
 *  bruit, et chaque palier est un événement de plus à payer. */
const PALIERS = [25, 50, 75, 100] as const;

/** Les instants qui distinguent un coup d'œil d'une lecture. */
const INSTANTS = [10, 30, 60] as const;

export function PageInstrumentation() {
  useEffect(() => {
    // La campagne a déjà été retenue par `AnalyticsRuntime`, monté plus
    // haut dans le gabarit racine : on se contente de la relire. La
    // capture se fait désormais à un seul endroit, pour toutes les pages
    // d'arrivée et non plus pour les deux qui y pensaient.
    const attribution = readAttribution();
    track(EVENTS.landingViewed, {
      utm_source: attribution.utm_source,
      utm_campaign: attribution.utm_campaign,
      utm_medium: attribution.utm_medium,
    });

    // ── Le défilement ──
    const vus = new Set<number>();
    const auDefilement = () => {
      const hauteur = document.documentElement.scrollHeight - window.innerHeight;
      if (hauteur <= 0) return;
      const part = Math.round(((window.scrollY || 0) / hauteur) * 100);
      for (const palier of PALIERS) {
        if (part >= palier && !vus.has(palier)) {
          vus.add(palier);
          track(EVENTS.scrollDepth, { depth: palier });
        }
      }
    };
    // `passive` : sans lui, le navigateur attend de savoir si l'on va
    // annuler le défilement, et la page saccade sur téléphone.
    window.addEventListener("scroll", auDefilement, { passive: true });

    // ── Le temps passé ──
    const minuteries = INSTANTS.map((secondes) =>
      window.setTimeout(() => track(EVENTS.timeOnPage, { seconds: secondes }), secondes * 1000),
    );

    // ── Les sections atteintes ──
    //
    // Un `IntersectionObserver` plutôt qu'un calcul au défilement :
    // le navigateur le fait hors du fil principal, sans coûter une image.
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    const annonces = new Set<string>();
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          const id = entree.target.id;
          if (!entree.isIntersecting || annonces.has(id)) continue;
          annonces.add(id);
          track(EVENTS.sectionViewed, { section: id });
        }
      },
      // La moitié visible : un bord qui affleure ne prouve pas qu'on a lu.
      { threshold: 0.5 },
    );
    sections.forEach((section) => observateur.observe(section));

    // ── Les appels à l'action ──
    //
    // Un seul écouteur sur le document plutôt qu'un par bouton : les
    // composants n'ont rien à savoir de la mesure, et un CTA ajouté
    // demain est suivi sans qu'on y pense — il lui suffit d'un
    // `data-cta`.
    const auClic = (event: MouseEvent) => {
      const cible = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cta]");
      if (!cible) return;
      track(EVENTS.ctaClicked, {
        cta: cible.dataset.cta,
        href: cible.getAttribute("href") ?? undefined,
      });
    };
    document.addEventListener("click", auClic);

    return () => {
      window.removeEventListener("scroll", auDefilement);
      document.removeEventListener("click", auClic);
      minuteries.forEach(window.clearTimeout);
      observateur.disconnect();
    };
  }, []);

  return null;
}
