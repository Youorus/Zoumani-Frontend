"use client";

import type { PropsWithChildren } from "react";

import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/lib/theme/theme-provider";

/**
 * Les fournisseurs de la vitrine.
 *
 * ═══ Ce qui a disparu, et pourquoi ═══
 *
 * `AuthProvider`, `QueryClientProvider`, `RealtimeProvider` et les
 * devtools de TanStack Query. Tous les quatre existaient pour un site qui
 * parlait à l'API : une session à porter, des requêtes à mettre en cache,
 * des événements à recevoir.
 *
 * La vitrine ne parle plus au serveur. Les garder aurait envoyé au
 * navigateur un client de requêtes, un magasin de session et un client
 * temps réel qui n'auraient jamais rien eu à faire — du poids sur la
 * première page que voit un visiteur, c'est-à-dire au pire endroit
 * possible.
 *
 * ═══ Ce qui reste ═══
 *
 * Le thème, parce que la page s'adapte au réglage du système. Les
 * notifications, parce que le changement de langue en émet une.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
