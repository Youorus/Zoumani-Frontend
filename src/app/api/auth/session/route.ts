import { NextResponse } from "next/server";

import { callApi } from "@/lib/api/upstream.server";
import { clearSessionCookies, hasRestorableSession } from "@/lib/auth/session.server";
import { toAuthenticatedUser, type RawCurrentUser } from "@/lib/auth/auth.types";

/**
 * « Qui suis-je ? » — la route de la reconnexion automatique.
 *
 * Appelée au premier rendu de l'application. Si le jeton d'accès a expiré
 * mais que le rafraîchissement tient encore, `callApi` fait tourner la
 * session **silencieusement** et la personne ne remarque rien : c'est
 * exactement ce qu'on entend par « rester connecté ».
 *
 * Rend `null` plutôt qu'un 401 lorsque personne n'est connecté : être
 * anonyme n'est pas une erreur, et un 401 ferait afficher un message
 * d'échec au premier chargement pour un simple visiteur.
 */
export async function GET(): Promise<NextResponse> {
  if (!(await hasRestorableSession())) {
    return NextResponse.json({ user: null });
  }

  const result = await callApi({ path: "/auth/me" });

  if (result.status !== 200) {
    // La session est définitivement finie — révoquée, expirée, ou coupée
    // parce qu'un rejeu de jeton a été détecté.
    await clearSessionCookies();
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: toAuthenticatedUser(result.body as RawCurrentUser),
  });
}
