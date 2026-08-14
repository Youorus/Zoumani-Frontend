"use client";

import { useCallback, useState } from "react";

import { AuthError } from "@/lib/auth/auth-client";
import { useAuth } from "@/lib/auth/use-auth";

import type { AuthScreen, LoginStep } from "../types/auth-flow";
import { screenFor } from "../types/auth-flow";
import type { RegistrationInput } from "../schemas/auth.schema";

/**
 * La machine du parcours, du premier écran à la session ouverte.
 *
 * ═══ Pourquoi un état ici, et pas dans l'URL ═══
 *
 * L'identifiant de parcours ne doit pas se retrouver dans la barre
 * d'adresse : elle est copiée, partagée, enregistrée dans l'historique et
 * transmise en `Referer` aux sites tiers. Il vit donc en mémoire, et un
 * rechargement de page renvoie au début — ce qui est le bon comportement
 * pour un parcours de quinze minutes.
 *
 * ═══ L'erreur, portée par sa raison ═══
 *
 * Le message vient du serveur, jamais d'ici. `reason` sert à orienter :
 * un compte suspendu renvoie au support, un contact incomplet vers son
 * profil. Recomposer ces messages côté client les ferait diverger au
 * premier ajustement de ton.
 */
export function useAuthFlow() {
  const { refresh } = useAuth();
  const [screen, setScreen] = useState<AuthScreen>("email");
  const [step, setStep] = useState<LoginStep | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [busy, setBusy] = useState(false);
  // Un état et non une référence : la valeur est lue au rendu — pour
  // rappeler à qui le code a été envoyé — et une référence ne
  // déclencherait aucun réaffichage.
  const [email, setEmail] = useState("");

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T | null> => {
    setBusy(true);
    setError(null);
    try {
      return await action();
    } catch (caught) {
      setError(
        caught instanceof AuthError
          ? caught
          : new AuthError("Une erreur est survenue. Réessayez.", undefined, 0),
      );
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const advance = useCallback(
    async (next: LoginStep) => {
      setStep(next);

      // Une étape peut **clore** le parcours : c'est le cas de l'e-mail et
      // de l'inscription tant que l'API n'exige pas la preuve du
      // téléphone. Les cookies sont alors déjà posés, mais l'interface
      // ignore encore qui est connecté — d'où ce rafraîchissement avant
      // d'afficher l'écran d'arrivée, sinon la navigation montrerait un
      // visiteur pendant une fraction de seconde.
      //
      // Aucun drapeau n'est consulté : on suit ce que le serveur répond.
      if (next.session) {
        await refresh();
      }
      setScreen(screenFor(next.step));
    },
    [refresh],
  );

  /** Écran 1 — l'adresse. Le serveur envoie un code, quoi qu'il arrive. */
  const submitEmail = useCallback(
    async (value: string) => {
      setEmail(value);
      const next = await run(() => startLoginRequest(value));
      if (next) {
        await advance(next);
      }
    },
    [run, advance],
  );

  /** Écran 2 — le code reçu par mail. C'est ici que le chemin bifurque. */
  const submitEmailCode = useCallback(
    async (code: string) => {
      if (!step) {
        return;
      }
      const next = await run(() => submitEmailCodeRequest(step.challengeId, code));
      if (next) {
        await advance(next);
      }
    },
    [run, advance, step],
  );

  /** Écran 3 — les informations manquantes, si le compte n'existe pas. */
  const submitRegistration = useCallback(
    async (input: RegistrationInput) => {
      if (!step) {
        return;
      }
      const next = await run(() => registerRequest(step.challengeId, input));
      if (next) {
        await advance(next);
      }
    },
    [run, advance, step],
  );

  /** Écran 4 — le code reçu par SMS. La session s'ouvre au retour. */
  const submitPhoneCode = useCallback(
    async (code: string) => {
      if (!step) {
        return;
      }
      const done = await run(async () => {
        await submitPhoneCodeRequest(step.challengeId, code);
        await refresh();
        return true;
      });
      if (done) {
        setScreen("done");
      }
    },
    [run, refresh, step],
  );

  /** Repart de l'adresse — le parcours a expiré, ou la personne s'est trompée. */
  const restart = useCallback(() => {
    setStep(null);
    setError(null);
    setScreen("email");
  }, []);

  return {
    screen,
    step,
    error,
    busy,
    email,
    /** Vrai si ce parcours **crée** un compte plutôt que d'y connecter. */
    isRegistering: screen === "registration" || step?.step === "registration_pending",
    submitEmail,
    submitEmailCode,
    submitRegistration,
    submitPhoneCode,
    restart,
  };
}

async function startLoginRequest(email: string): Promise<LoginStep> {
  const { startLogin } = await import("@/lib/auth/auth-client");
  return toStep(await startLogin(email));
}

async function submitEmailCodeRequest(
  challengeId: string,
  code: string,
): Promise<LoginStep> {
  const { submitEmailCode } = await import("@/lib/auth/auth-client");
  return toStep(await submitEmailCode(challengeId, code));
}

async function submitPhoneCodeRequest(challengeId: string, code: string): Promise<void> {
  const { submitPhoneCode } = await import("@/lib/auth/auth-client");
  await submitPhoneCode(challengeId, code);
}

async function registerRequest(
  challengeId: string,
  input: RegistrationInput,
): Promise<LoginStep> {
  const { completeRegistration } = await import("@/lib/auth/auth-client");
  return toStep(await completeRegistration(challengeId, input));
}

/** Complète une étape venue du client, dont les champs sont optionnels. */
function toStep(raw: Omit<LoginStep, "requiredFields"> & { requiredFields?: string[] }) {
  return { ...raw, requiredFields: raw.requiredFields ?? [] };
}
