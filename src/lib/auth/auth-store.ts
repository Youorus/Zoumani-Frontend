import { create } from "zustand";

import type { AuthenticatedUser, SessionSnapshot } from "./auth.types";

/**
 * L'état de session, côté navigateur.
 *
 * ═══ Ce qu'il ne contient PAS, et pourquoi ═══
 *
 * **Aucun jeton.** Ils vivent dans des cookies `httpOnly`, invisibles du
 * JavaScript. Les remettre ici les rendrait lisibles par n'importe quelle
 * dépendance npm compromise — c'est précisément ce que l'ADR-0010 écarte.
 *
 * **Aucun rôle.** Le backend l'interdit (AGENTS.md §9) : le rôle n'est pas
 * un attribut de la personne mais une position dans une transaction.
 * L'interface dérive ce qu'elle affiche des permissions.
 *
 * Ce store ne sert donc qu'à une chose : éviter que chaque composant
 * redemande « qui suis-je ? » à chaque rendu.
 */
interface AuthStore extends SessionSnapshot {
  /** Installe la session connue. */
  setUser: (user: AuthenticatedUser) => void;
  /** Constate que personne n'est connecté. */
  setAnonymous: () => void;
  /** Repasse en « je ne sais pas encore » — au démarrage, ou après un logout. */
  setLoading: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // `loading` et non `anonymous` au départ : confondre « je ne sais pas
  // encore » et « personne » ferait clignoter l'écran de connexion à
  // chaque rechargement pour quelqu'un de parfaitement authentifié.
  status: "loading",
  user: null,
  setUser: (user) => set({ status: "authenticated", user }),
  setAnonymous: () => set({ status: "anonymous", user: null }),
  setLoading: () => set({ status: "loading" }),
}));
