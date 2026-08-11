"use client";

import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { accountContent } from "@/features/account/content/account-content";

/**
 * La cloche des notifications.
 *
 * ═══ Ce qu'elle fait aujourd'hui, et ce qu'elle ne fait pas ═══
 *
 * Elle ouvre un panneau qui dit qu'il n'y a rien. **Aucune pastille, aucun
 * compteur** : le backend n'émet pas encore de notifications, et afficher
 * un « 3 » décoratif serait mentir à l'utilisateur — une pastille qui ne
 * correspond à rien apprend à ignorer toutes les suivantes, y compris les
 * vraies.
 *
 * La place est prise, le geste existe, et le jour où l'API rendra une
 * liste, seul le contenu de ce panneau changera.
 *
 * ═══ Pourquoi elle est là malgré tout ═══
 *
 * Les événements qui comptent — un voyageur accepte votre colis, un
 * paiement est libéré — partent par e-mail. Beaucoup les manqueront : une
 * boîte pleine, un dossier promotions, un téléphone partagé. La cloche est
 * l'endroit où l'on va vérifier quand on doute, et il doit exister avant
 * qu'on en ait besoin.
 */
export function NotificationBell() {
  const copy = accountContent.notifications;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-ring grid size-10 place-items-center rounded-full border border-border/70 text-foreground transition-colors hover:bg-muted"
          aria-label={copy.label}
        >
          <Bell className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        // Bornée à la largeur de l'écran : sur un téléphone, un panneau
        // de 20 rem déborderait et se ferait rogner.
        className="w-[min(20rem,calc(100vw-2rem))]"
      >
        <DropdownMenuLabel>{copy.title}</DropdownMenuLabel>
        <p className="px-2 pt-1 pb-3 text-sm leading-5 text-muted-foreground">
          {copy.empty}
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
