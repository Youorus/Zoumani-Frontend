"use client";

import {
  CreditCard,
  LogOut,
  MessageCircle,
  Package,
  Plane,
  Coins,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccountCopy } from "@/features/account/components/account-copy-provider";
import { useAccountUser } from "@/features/account/components/account-user-provider";
import { UserAvatar } from "@/features/account/components/user-avatar";
import { VerificationBadge } from "@/features/verification/components/verification-badge";
import { VerificationMenuEntry } from "@/features/verification/components/verification-menu-entry";
import type { VerificationStage } from "@/features/verification/types/verification.types";
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
export function AccountMenu({
  stage,
}: {
  /** Où en est la vérification d'identité de cette personne. */
  stage: VerificationStage;
}) {
  const { user } = useAccountUser();
  const router = useRouter();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const menu = useAccountCopy().menu;

  const entries = [
    { href: "/compte/envois", label: menu.shipments, icon: Package },
    { href: "/compte/trajets", label: menu.trips, icon: Plane },
    // Placé juste après les trajets : c'est en les publiant qu'on gagne
    // des points, et l'entrée n'a de sens que dans ce voisinage.
    { href: "/compte/points", label: menu.rewards, icon: Coins },
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
          <span className="relative inline-flex">
            <UserAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              imageUrl={user.profilePictureUrl}
              className="size-10"
            />
            {/* En bas à droite, là où tout le monde a appris à la
                chercher : c'est la position qu'emploient les réseaux
                sociaux depuis quinze ans. */}
            <VerificationBadge
              stage={stage}
              className="absolute -right-0.5 -bottom-0.5"
            />
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-64">
        <DropdownMenuLabel>
          <span className="block truncate font-semibold">{user.fullName}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user.email ?? user.phone}
          </span>
        </DropdownMenuLabel>

        {/* L'état de vérification est ici et pas ailleurs : c'est le
            premier endroit où l'on regarde quand on se demande « où
            j'en suis ». Et il est cliquable, parce qu'un état sans
            action laisse démuni. */}
        <VerificationMenuEntry stage={stage} />
        <DropdownMenuSeparator />

        {entries.map((entry) => (
          <DropdownMenuItem key={entry.href} asChild>
            <Link href={entry.href} className="flex items-center gap-3">
              <entry.icon className="size-4 text-primary" aria-hidden="true" />
              {entry.label}
            </Link>
          </DropdownMenuItem>
        ))}

        {/* Visible seulement pour un opérateur. Afficher une entrée
            qui mène à une redirection serait une fausse promesse. */}
        {user.permissions.some((permission) =>
          permission.startsWith("identity_verifications:"),
        ) ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                {menu.admin}
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}

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
