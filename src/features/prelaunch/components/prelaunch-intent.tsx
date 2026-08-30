"use client";

import { useSearchParams } from "next/navigation";

import type { Intention } from "../api/prelaunch-api";
import { PrelaunchFunnel } from "./prelaunch-funnel";

/**
 * Lit l'intention passée dans l'URL, et rien d'autre.
 *
 * `?type=sender` et `?type=traveler` permettent à une campagne de mener
 * droit au bon parcours — une publicité qui vise les voyageurs ne doit
 * pas leur faire choisir ce qu'elle vient de leur demander. Le choix
 * reste modifiable : on n'enferme personne dans une case décidée par une
 * régie.
 *
 * Ce composant n'existe que pour isoler `useSearchParams`, qui impose
 * une frontière de suspense. Le tunnel lui-même n'a pas à savoir d'où
 * vient son intention.
 */
export function PrelaunchIntent() {
  const params = useSearchParams();
  const raw = params.get("type");
  const intent: Intention | null = raw === "sender" || raw === "traveler" ? raw : null;

  return <PrelaunchFunnel initialIntent={intent} />;
}
