import { Apple, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * L'appel au téléchargement, à la place de la recherche de trajets.
 *
 * ═══ Ce qu'il remplace ═══
 *
 * Un formulaire de recherche de voyages, posé en bas du hero. Il
 * interrogeait l'API — catalogue d'aéroports, trajets disponibles — et
 * c'était le seul lien qui restait entre cette vitrine et le serveur.
 * L'enlever a rendu le site déployable en statique : plus de proxy, plus
 * de variables d'environnement, plus de panne quand l'API tombe.
 *
 * ═══ Pourquoi pas simplement deux boutons vers les stores ═══
 *
 * Parce que l'application n'y est pas encore. Un bouton qui mène à une
 * page « introuvable » coûte plus cher que pas de bouton du tout : le
 * visiteur conclut que le service n'existe pas, et il a raison de le
 * conclure.
 *
 * Les adresses viennent donc de l'environnement, et tant qu'elles sont
 * absentes le bloc annonce l'attente au lieu de la simuler. Le jour de la
 * publication, deux variables suffisent — aucun code à toucher.
 *
 * ═══ Pourquoi les lire ici et non dans un module de configuration ═══
 *
 * Ce sont les deux dernières variables du projet, et elles ne servent qu'à
 * cet endroit. Un module de validation d'environnement pour deux URL
 * facultatives serait plus long que ce qu'il valide.
 */

const APP_STORE = process.env.NEXT_PUBLIC_APP_STORE_URL;
const PLAY_STORE = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

export function AppCallout({
  id,
  titre,
  sousTitre,
  attente,
  className = "",
}: {
  /** Cible d'ancre, pour les boutons de la barre de navigation. */
  id?: string;
  titre: string;
  sousTitre: string;
  /** Ce qu'on affiche tant que l'application n'est pas publiée. */
  attente: string;
  className?: string;
}) {
  const publiee = Boolean(APP_STORE ?? PLAY_STORE);

  return (
    <div
      id={id}
      className={`rounded-3xl border border-border/10 bg-surface/95 p-6 shadow-soft backdrop-blur sm:p-8 ${className}`}
    >
      <p className="text-lg font-black text-foreground sm:text-xl">{titre}</p>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">{sousTitre}</p>

      {publiee ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {APP_STORE ? (
            <Button asChild className="px-6">
              <a href={APP_STORE} target="_blank" rel="noreferrer">
                <Apple className="size-5" />
                App Store
              </a>
            </Button>
          ) : null}
          {PLAY_STORE ? (
            <Button asChild variant="secondary" className="px-6">
              <a href={PLAY_STORE} target="_blank" rel="noreferrer">
                <Smartphone className="size-5" />
                Google Play
              </a>
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/15 px-4 py-2 text-sm font-bold text-muted-foreground">
          <Smartphone className="size-4" />
          {attente}
        </p>
      )}
    </div>
  );
}
