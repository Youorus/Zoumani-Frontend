"use client";

import { LoaderCircle, XCircle } from "lucide-react";
import { useState } from "react";

import { cancelJourney, type Cancellation } from "../api/tracking-client";

/**
 * L'annulation d'un envoi payé.
 *
 * ═══ Deux temps, et c'est délibéré ═══
 *
 * Un premier clic ouvre la confirmation, un second annule. Un bouton
 * unique annulerait un envoi payé sur un geste involontaire — et
 * l'opération n'est pas réversible : le colis est décommandé chez le
 * transporteur, la place est rendue, et il faudra tout ressaisir.
 *
 * ═══ Ce que la confirmation dit ═══
 *
 * Ce qui est retenu, et pourquoi. Annoncer « vous serez remboursé » sans
 * préciser le montant fait découvrir la retenue sur le relevé bancaire —
 * et une retenue découverte est une retenue contestée.
 *
 * Le montant exact vient du serveur **après** l'annulation : l'annoncer
 * avant supposerait de le recalculer ici, et deux calculs finissent par
 * diverger d'un centime.
 */
export function CancelShipment({
  journeyId,
  onCancelled,
}: {
  journeyId: string;
  onCancelled: (resultat: Cancellation) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function annuler() {
    setEnCours(true);
    setErreur(null);
    try {
      onCancelled(await cancelJourney(journeyId));
    } catch (caught) {
      // Le message vient du serveur : lui seul sait pourquoi il refuse —
      // colis déjà pris en charge, remboursement impossible. Le
      // recomposer ici le ferait diverger au premier ajustement.
      setErreur(
        caught instanceof Error
          ? caught.message
          : "L'annulation n'a pas abouti. Réessayez dans un instant.",
      );
      setEnCours(false);
    }
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-error"
      >
        Annuler cet envoi
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-error/30 bg-error/5 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-error">
        <XCircle size={16} aria-hidden />
        Annuler cet envoi ?
      </p>

      <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
        <li>
          Le colis est décommandé chez le transporteur — l&apos;étiquette ne servira plus.
        </li>
        <li>La place est rendue au voyageur, qui pourra la reproposer.</li>
        <li>
          Vous êtes remboursé de la rémunération du voyageur et du transport.{" "}
          <strong className="text-foreground">
            Les frais de service Zoumani restent acquis
          </strong>{" "}
          : la place a été bloquée et l&apos;étiquette produite.
        </li>
        <li>Cette action ne se défait pas : il faudra tout ressaisir.</li>
      </ul>

      {erreur ? (
        <p className="text-xs text-error" role="alert">
          {erreur}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void annuler()}
          disabled={enCours}
          className="inline-flex items-center gap-2 rounded-xl bg-error px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {enCours ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden />
          ) : null}
          {enCours ? "Annulation…" : "Confirmer l'annulation"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          disabled={enCours}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium"
        >
          Garder mon envoi
        </button>
      </div>
    </div>
  );
}
