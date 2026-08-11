"use client";

import { BaggageClaim, CircleUser } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";

/**
 * Le bouton d'action de la navigation, selon qu'on est connecté ou non.
 *
 * ═══ Pourquoi ce composant existe ═══
 *
 * Un bouton « Je suis voyageur » qui ramène à la connexion alors qu'on
 * vient de se connecter donne l'impression que la session n'a pas tenu.
 * C'est le seul repère visible depuis la page d'accueil : tant qu'il ne
 * change pas, la persistance a beau fonctionner, elle ne se voit nulle
 * part.
 *
 * ═══ Pourquoi l'état de chargement compte ═══
 *
 * Au premier rendu, on ne sait pas encore. Afficher « Se connecter » en
 * attendant ferait clignoter le bouton chez toutes les personnes
 * connectées, à chaque page. On garde donc le libellé d'invitation, mais
 * la destination n'est décidée qu'une fois la réponse connue — un clic
 * pendant ce court instant mène à la connexion, qui redirigera vers
 * l'espace de toute façon.
 */
export function AccountCta({
  label,
  spaceLabel,
  className,
}: {
  /** Libellé pour un visiteur — celui de la page, dans sa langue. */
  label: string;
  /** Libellé une fois connecté. */
  spaceLabel: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Button asChild className={className}>
        <Link href="/compte">
          <CircleUser className="size-5" />
          {spaceLabel}
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      {/* Directement `/connexion` : `/signup` ne fait plus que rediriger
          ici, et le détour coûtait un aller-retour visible. */}
      <Link href="/connexion">
        <BaggageClaim className="size-5" />
        {label}
      </Link>
    </Button>
  );
}
