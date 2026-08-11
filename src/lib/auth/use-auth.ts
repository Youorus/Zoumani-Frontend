"use client";

import { useCallback } from "react";

import { useAuthStore } from "./auth-store";
import { can, canAny, type Permission } from "./auth.types";
import {
  loginWithPassword,
  logout as logoutRequest,
  restoreSession,
  startLogin,
  submitEmailCode,
  submitPhoneCode,
  type LoginStep,
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

  /**
   * Étape 1 — demande un code par e-mail.
   *
   * Réussit **toujours**, même pour une adresse inconnue : l'API refuse de
   * dire qui est inscrit, et l'interface ne doit pas la contredire en
   * affichant « compte introuvable ». L'écran passe donc à la saisie du
   * code dans les deux cas.
   */
  const beginLogin = useCallback(
    async (email: string): Promise<LoginStep> => startLogin(email),
    [],
  );

  /** Étape 2 — valide le code de l'e-mail ; le SMS part alors. */
  const submitEmailStep = useCallback(
    async (challengeId: string, code: string): Promise<LoginStep> =>
      submitEmailCode(challengeId, code),
    [],
  );

  /** Étape 3 — valide le code du SMS. La session s'ouvre au retour. */
  const submitPhoneStep = useCallback(
    async (challengeId: string, code: string) => {
      await submitPhoneCode(challengeId, code);
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
    beginLogin,
    submitEmailStep,
    submitPhoneStep,
    signOut,
    refresh,
    can: (permission: Permission) => can(user, permission),
    canAny: (permissions: Permission[]) => canAny(user, permissions),
  };
}
