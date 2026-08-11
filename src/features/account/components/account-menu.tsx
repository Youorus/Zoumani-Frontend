"use client";

import {
  CreditCard,
  LogOut,
  MessageCircle,
  Package,
  Plane,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { accountContent } from "@/features/account/content/account-content";
import type { AuthenticatedUser } from "@/lib/auth/auth.types";
import { useAuth } from "@/lib/auth/use-auth";

/**
 * L'avatar et son menu — la porte de tout l'espace personnel.
 *
 * ═══ Pourquoi un avatar plutôt qu'un mot ═══
 *
 * C'est le repère que tout le monde connaît, y compris quelqu'un qui lit
 * peu ou lit une autre langue : la petite pastille en haut à droite,
 * c'est moi. Mais l'icône seule ne suffit pas — elle porte un libellé
 * accessible, et le menu écrit chaque entrée en toutes lettres, avec son
 * symbole. Deux repères valent mieux qu'un quand les âges et les
 * habitudes varient autant que sur cette plateforme.
 *
 * ═══ Les initiales, et pourquoi elles suffisent ═══
 *
 * Sans photo, on affiche les initiales plutôt qu'une silhouette grise :
 * elles reconnaissent la personne. Sur un téléphone partagé — courant
 * dans une famille — voir « AD » plutôt que « MT » dit immédiatement
 * quel compte est ouvert.
 */
export function AccountMenu({ user }: { user: AuthenticatedUser }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const menu = accountContent.menu;

  const entries = [
    { href: "/compte/envois", label: menu.shipments, icon: Package },
    { href: "/compte/trajets", label: menu.trips, icon: Plane },
    { href: "/compte/messages", label: menu.messages, icon: MessageCircle },
    { href: "/compte/profil", label: menu.profile, icon: UserRound },
    { href: "/compte/paiements", label: menu.payments, icon: CreditCard },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-ring rounded-full"
          // Le nom dans le libellé : une personne qui navigue à la voix
          // ou au lecteur d'écran doit savoir de quel compte il s'agit,
          // pas seulement qu'il existe un menu.
          aria-label={`${menu.label} — ${user.firstName} ${user.lastName}`}
        >
          <Avatar className="size-10">
            {user.profilePictureUrl ? (
              <AvatarImage src={user.profilePictureUrl} alt="" />
            ) : null}
            <AvatarFallback>{initials(user)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-64">
        <DropdownMenuLabel>
          <span className="block truncate font-semibold">{user.fullName}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user.email ?? user.phone}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {entries.map((entry) => (
          <DropdownMenuItem key={entry.href} asChild>
            <Link href={entry.href} className="flex items-center gap-3">
              <entry.icon className="size-4 text-primary" aria-hidden="true" />
              {entry.label}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signingOut}
          onSelect={async (event) => {
            // Sans cela, le menu se referme avant la fin de l'appel et
            // l'on ne voit jamais que quelque chose se passe.
            event.preventDefault();
            setSigningOut(true);
            await signOut();
            router.replace("/");
            // Les pages de l'espace sont rendues côté serveur et mises en
            // cache par le routeur : sans invalidation, un retour arrière
            // les réafficherait au nom de qui vient de partir.
            router.refresh();
          }}
        >
          <span className="flex items-center gap-3">
            <LogOut className="size-4" aria-hidden="true" />
            {menu.signOut}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Deux lettres pour se reconnaître. */
function initials(user: AuthenticatedUser): string {
  const first = user.firstName.trim().charAt(0);
  const last = user.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}
