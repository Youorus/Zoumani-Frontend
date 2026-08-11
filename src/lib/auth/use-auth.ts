"use client";

import { useCallback } from "react";

import { useAuthStore } from "./auth-store";
import { can, canAny, type Permission } from "./auth.types";
import {
  loginWithCode,
  loginWithPassword,
  logout as logoutRequest,
  requestLoginCode,
  restoreSession,
} from "./auth-client";

/**
 * Tout ce dont un composant a besoin pour parler de la session.
 *
 * Les vérifications de permission (`can`, `canAny`) ne servent qu'à
 * l'affichage : ne pas montrer un bouton qui répondrait 403. Le contrôle
 * qui compte reste celui de l'API, et il n'est pas contournable.
 */
export function useAuth() {
  const { status, user } = useAuthStore();
  const setUser = useAuthStore((state) => state.setUser);
  const setAnonymous = useAuthStore((state) => state.setAnonymous);

  /** Recharge la session après une connexion réussie. */
  const refresh = useCallback(async () => {
    const restored = await restoreSession();
    if (restored) {
      setUser(restored);
    } else {
      setAnonymous();
    }
  }, [setUser, setAnonymous]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      await loginWithPassword(email, password);
      await refresh();
    },
    [refresh],
  );

  const signInWithCode = useCallback(
    async (countryCode: string, nationalNumber: string, code: string) => {
      await loginWithCode(countryCode, nationalNumber, code);
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    await logoutRequest();
    setAnonymous();
  }, [setAnonymous]);

  return {
    status,
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signInWithPassword,
    signInWithCode,
    requestCode: requestLoginCode,
    signOut,
    refresh,
    can: (permission: Permission) => can(user, permission),
    canAny: (permissions: Permission[]) => canAny(user, permissions),
  };
}
