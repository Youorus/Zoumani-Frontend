"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { captureAttribution } from "@/lib/marketing/attribution";

/**
 * Retenir d'où vient le visiteur, sur **toutes** les pages.
 *
 * ═══ Pourquoi ici, et pas dans chaque page ═══
 *
 * `captureAttribution()` n'était appelée que depuis l'accueil et depuis
 * le tunnel. Une annonce pointant sur `/proposer-un-voyage` perdait donc
 * tout : au moment où le visiteur atteignait `/preinscription`, l'URL ne
 * portait plus les paramètres de campagne et le stockage était vide. Le
 * lead arrivait en base sans campagne, indistinguable d'une visite
 * organique — vérifié en production le 4 septembre 2026.
 *
 * Monté dans le gabarit racine, ce composant couvre toute page
 * d'arrivée, présente ou future. C'est le seul endroit qui n'ait pas
 * besoin d'être tenu à jour quand une page s'ajoute.
 *
 * ═══ Ce qu'il n'émet PAS, et pourquoi c'est un choix ═══
 *
 * Pas de `page_view` sur les navigations client. On l'avait écrit — le
 * site ne rechargeant jamais son document, il paraissait évident que
 * `gtag.js` ne voyait qu'une seule page par visite.
 *
 * C'est faux, et la mesure l'a montré. GA4 **suit déjà** les
 * changements d'historique, par sa « mesure améliorée ». Il les envoie
 * simplement en différé : le `page_view` de la nouvelle page ne part pas
 * à la navigation, mais au premier signal d'engagement qui suit —
 * reconnaissable à son paramètre `ae=a`. Une observation trop courte
 * après le clic ne le voit pas, et fait conclure à tort qu'il manque.
 *
 * Vérifié le 4 septembre 2026 sur les deux versions :
 *
 * - production, **sans** aucun appel manuel : un `page_view` porte bien
 *   `dl=https://zoumani.fr/preinscription?type=sender` ;
 * - version locale **avec** l'appel manuel : deux `page_view` pour la
 *   même page, le nôtre puis celui de GA4.
 *
 * Doubler le comptage des pages pendant une campagne payée est
 * exactement l'inverse du but. L'appel a donc été retiré.
 *
 * ═══ La dépendance que cela crée, et où elle est écrite ═══
 *
 * Le suivi des navigations repose désormais sur un réglage de la
 * propriété GA4 — Admin › Flux de données › Mesure améliorée ›
 * « Changements de page basés sur les événements de l'historique du
 * navigateur ». Il est actif, et le désactiver rendrait
 * `/preinscription` invisible dans les rapports de pages. C'est consigné
 * dans `docs/PLUS-TARD.md`, avec la marche à suivre : `page()` reste
 * exportée dans `events.ts` et il suffirait de la rebrancher ici.
 *
 * Le tunnel, lui, ne dépend d'aucun réglage : `prelaunch_view` et
 * `funnel_step_viewed` partent immédiatement, et ce sont eux qui portent
 * la mesure du parcours.
 *
 * ═══ Pourquoi `usePathname` et non `useSearchParams` ═══
 *
 * `useSearchParams` impose une frontière de suspense et ferait basculer
 * en dynamique toute page qui n'en a pas — c'est-à-dire les huit pages
 * statiques du site.
 */
export function AnalyticsRuntime() {
  const chemin = usePathname();

  useEffect(() => {
    // À chaque route, y compris la première : une campagne peut viser
    // n'importe quelle page, et les paramètres déjà retenus ne sont
    // jamais écrasés par une URL qui n'en porte pas.
    captureAttribution();
  }, [chemin]);

  return null;
}
