import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import { ComingSoon } from "@/features/account/components/coming-soon";

/*
 * Aucun titre traduit ici : `metadata` est calculée côté serveur, sans
 * accès à la langue du compte, qui vit dans un contexte de rendu. Le
 * titre du navigateur reste donc celui de l'application — c'est un
 * moindre mal comparé à un onglet en français sur un écran anglais.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ComingSoon section="profile" icon={UserRound} />;
}
