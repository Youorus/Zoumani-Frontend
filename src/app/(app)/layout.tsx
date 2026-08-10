import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * Espace applicatif : contenu dynamique destine aux utilisateurs, sans valeur
 * pour la recherche. Exclu de l'index en complement des regles de robots.txt.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppGroupLayout({ children }: PropsWithChildren) {
  return <AppShell>{children}</AppShell>;
}
