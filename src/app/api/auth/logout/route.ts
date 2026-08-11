import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";
import { clearSessionCookies, readRefreshToken } from "@/lib/auth/session.server";

/**
 * Déconnexion.
 *
 * Les cookies sont effacés **quoi qu'il arrive**, même si l'API ne répond
 * pas : quelqu'un qui clique sur « se déconnecter » doit voir sa session
 * disparaître ici et maintenant. Une session laissée ouverte parce qu'un
 * serveur distant était lent serait le pire des deux mondes.
 */
export async function POST(): Promise<NextResponse> {
  const refreshToken = await readRefreshToken();

  if (refreshToken) {
    // L'échec est ignoré volontairement : la révocation côté serveur est
    // souhaitable, la disparition du cookie est indispensable.
    await callPublicApi({
      method: "POST",
      path: "/auth/logout",
      body: { refresh_token: refreshToken },
    }).catch(() => undefined);
  }

  await clearSessionCookies();
  return new NextResponse(null, { status: 204 });
}
