import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";
import { setSessionCookies, type IssuedTokens } from "@/lib/auth/session.server";

/**
 * Étape 3 — valide le code reçu par SMS et ouvre la session.
 *
 * **C'est ici, et seulement ici, que les cookies sont posés** : les deux
 * barrières sont franchies. Les jetons ne franchissent pas la frontière du
 * serveur — le navigateur ne reçoit que les permissions, de quoi afficher
 * l'interface.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as unknown;
  const result = await callPublicApi({ method: "POST", path: "/auth/login/phone", body });

  if (result.status !== 200) {
    return NextResponse.json(result.body, { status: result.status });
  }

  const tokens = result.body as IssuedTokens & { permissions: string[] };
  await setSessionCookies(tokens);

  return NextResponse.json({ permissions: tokens.permissions });
}
