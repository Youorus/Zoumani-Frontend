import { NextResponse } from "next/server";

import { callApi } from "@/lib/api/upstream.server";

/**
 * L'étiquette d'expédition, en PDF.
 *
 * ═══ Pourquoi une route dédiée ═══
 *
 * Le passe-plat générique rend du JSON. Un PDF passé par
 * `NextResponse.json` arriverait encodé en chaîne et illisible — d'où ce
 * relais, qui transmet les octets tels quels.
 *
 * ═══ Pourquoi ne pas rediriger vers le transporteur ═══
 *
 * Son adresse expire, encode le fournisseur, et serait partageable par
 * quiconque la reçoit. Ici le fichier transite par notre serveur, qui
 * vérifie la session à chaque appel — la même règle que pour les autres
 * documents (AGENTS.md §6.12).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ shipmentId: string }> },
): Promise<NextResponse> {
  const { shipmentId } = await context.params;

  // `callApi` apporte le jeton et le rafraîchissement silencieux : le
  // réécrire ici en dupliquerait la logique, et la copie oubliée
  // laisserait la personne devant un 401 sur une session valide.
  const resultat = await callApi({
    method: "GET",
    path: `/shipments/${shipmentId}/label`,
    binary: true,
  });

  if (resultat.status !== 200 || !(resultat.body instanceof ArrayBuffer)) {
    // Le corps d'erreur de l'API est transmis tel quel : l'interface doit
    // pouvoir dire « pas encore disponible » plutôt qu'un message inventé
    // ici, qui divergerait du serveur.
    return NextResponse.json(resultat.body ?? { error: { code: "unavailable" } }, {
      status: resultat.status,
    });
  }

  return new NextResponse(resultat.body, {
    headers: {
      "Content-Type": "application/pdf",
      // `inline` : sur mobile, une pièce jointe atterrit dans un dossier
      // et se retrouve mal, alors qu'un PDF affiché s'imprime d'un geste.
      "Content-Disposition": `inline; filename="etiquette-${shipmentId.slice(0, 8)}.pdf"`,
      // Une étiquette désigne un colis, donc une personne : jamais de
      // cache partagé.
      "Cache-Control": "private, no-store",
    },
  });
}
