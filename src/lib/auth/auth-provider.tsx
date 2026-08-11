"use client";

import { useEffect, type ReactNode } from "react";

import { useAuthStore } from "./auth-store";
import { restoreSession } from "./auth-client";

/**
 * Restaure la session au démarrage de l'application.
 *
 * ═══ La reconnexion automatique, vue d'ici ═══
 *
 * Un seul appel au montage. Le serveur lit le cookie `httpOnly`,
 * rafraîchit les jetons si le jeton d'accès a expiré, et rend la personne.
 * Quelqu'un qui revient le lendemain retrouve son écran sans rien
 * ressaisir.
 *
 * Un seul appel, et pas un par composant : c'est le rôle d'un fournisseur.
 * Sans lui, dix composants demanderaient « qui suis-je ? » en parallèle au
 * premier rendu, et chacun déclencherait sa propre rotation de jeton.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setAnonymous = useAuthStore((state) => state.setAnonymous);

  useEffect(() => {
    let cancelled = false;

    void restoreSession()
      .then((user) => {
        // Le composant peut avoir été démonté pendant l'appel : écrire
        // dans un store démonté n'a pas d'effet visible, mais suivre le
        // signal évite un avertissement et une écriture inutile.
        if (cancelled) {
          return;
        }
        if (user) {
          setUser(user);
        } else {
          setAnonymous();
        }
      })
      .catch(() => {
        // Une panne réseau n'est pas une preuve de déconnexion, mais
        // l'interface doit sortir de l'état « je ne sais pas » : rester en
        // chargement indéfiniment afficherait un écran vide.
        if (!cancelled) {
          setAnonymous();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setUser, setAnonymous]);

  return <>{children}</>;
}
