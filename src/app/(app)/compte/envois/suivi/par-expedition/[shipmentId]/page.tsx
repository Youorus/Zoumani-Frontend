import { notFound, redirect } from "next/navigation";

import type { RawJourney } from "@/features/tracking/types/tracking.types";
import { callApi } from "@/lib/api/upstream.server";

export const dynamic = "force-dynamic";

/**
 * Le pont entre un paiement et le suivi qu'il vient d'ouvrir.
 *
 * ═══ Pourquoi cette page existe ═══
 *
 * Après le paiement, on connaît l'expédition — pas le parcours, créé
 * côté serveur au même moment. Cette page fait la correspondance une
 * fois, puis redirige : la personne ne la voit jamais.
 *
 * ═══ Pourquoi ici et pas dans l'API ═══
 *
 * Une route « trouve-moi le parcours de cette expédition » serait un
 * second chemin vers la même ressource, à maintenir et à protéger. La
 * liste existe déjà et est filtrée sur l'appelant : elle suffit.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = await params;
  const reponse = await callApi({ method: "GET", path: "/journeys" });

  if (reponse.status !== 200) {
    // Le paiement a bien eu lieu : on renvoie vers la liste plutôt que
    // d'afficher une erreur sur un écran de confirmation.
    redirect("/compte/envois/suivi");
  }

  const journey = (reponse.body as RawJourney[]).find(
    (candidat) => candidat.shipment_id === shipmentId,
  );
  if (!journey) {
    // Le parcours peut n'être pas encore écrit si la notification du
    // prestataire arrive à la seconde près : la liste le montrera.
    redirect("/compte/envois/suivi");
  }

  redirect(`/compte/envois/suivi/${journey.id}`);
  notFound();
}
