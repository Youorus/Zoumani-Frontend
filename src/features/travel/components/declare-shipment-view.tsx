"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  declareShipment,
  submitShipment,
  updateShipment,
  uploadParcelPhoto,
} from "../api/travel-client";
import type { Capacity } from "../types/travel.types";
import { estimateLineMinor } from "../types/trip.types";

interface DeclareShipmentViewProps {
  capacity: Capacity;
  /** Libellés des catégories, résolus côté serveur. */
  labels: Record<string, string>;
}

interface LigneSaisie {
  quantity: string;
  photo: File | null;
  photoKey: string | null;
}

/**
 * Ce que l'expéditeur confie, et ce que cela lui coûte.
 *
 * ═══ Le prix bouge pendant qu'on tape ═══
 *
 * Le total se recalcule à chaque frappe, sans aller-retour. Un prix qui
 * n'apparaît qu'après validation fait hésiter, et l'hésitation fait
 * abandonner. Le serveur reste la référence — c'est son total qui sera
 * facturé — mais l'attendre pour afficher un chiffre serait le rendre
 * inutile.
 *
 * ═══ Les bornes sont dites avant d'être atteintes ═══
 *
 * Le poids restant est affiché en permanence, et le champ refuse d'aller
 * au-delà. Découvrir « il ne reste que 3 kg » après avoir tout saisi et
 * photographié serait une perte de temps que rien ne justifie.
 *
 * ═══ La photo est demandée là où elle se comprend ═══
 *
 * À côté de la catégorie qu'elle documente, et non dans une étape
 * séparée. Ce qu'on photographie, c'est ce qu'on vient de déclarer.
 */
export function DeclareShipmentView({ capacity, labels }: DeclareShipmentViewProps) {
  const router = useRouter();
  const [lignes, setLignes] = useState<Record<string, LigneSaisie>>({});
  const [busy, setBusy] = useState(false);
  const [etape, setEtape] = useState<"saisie" | "photos">("saisie");
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const choisies = capacity.offers.filter((offer) => lignes[offer.categoryCode]);

  const poidsDeclare = choisies.reduce((total, offer) => {
    if (offer.perPiece) {
      return total;
    }
    const kg = Number.parseFloat(
      (lignes[offer.categoryCode]?.quantity ?? "").replace(",", "."),
    );
    return total + (Number.isFinite(kg) ? kg : 0);
  }, 0);

  const totalMinor = choisies.reduce((total, offer) => {
    const saisie = lignes[offer.categoryCode];
    const valeur = Number.parseFloat((saisie?.quantity ?? "").replace(",", "."));
    if (!Number.isFinite(valeur) || valeur <= 0) {
      return total;
    }
    const quantite = offer.perPiece ? Math.floor(valeur) : Math.round(valeur * 1000);
    return total + estimateLineMinor(offer.priceMinor, quantite, offer.perPiece);
  }, 0);

  const restant = capacity.availableWeightKg - poidsDeclare;
  const trop = restant < 0;
  const complet =
    choisies.length > 0 &&
    !trop &&
    choisies.every((offer) => {
      const valeur = Number.parseFloat(
        (lignes[offer.categoryCode]?.quantity ?? "").replace(",", "."),
      );
      return Number.isFinite(valeur) && valeur > 0;
    });

  function basculer(code: string) {
    setLignes((courant) => {
      const suivant = { ...courant };
      if (code in suivant) {
        delete suivant[code];
      } else {
        suivant[code] = { quantity: "", photo: null, photoKey: null };
      }
      return suivant;
    });
  }

  async function continuer() {
    setBusy(true);
    setFailure(null);
    try {
      const expedition = await declareShipment(
        capacity.id,
        choisies.map((offer) => {
          const valeur = Number.parseFloat(
            (lignes[offer.categoryCode]?.quantity ?? "").replace(",", "."),
          );
          return offer.perPiece
            ? { categoryCode: offer.categoryCode, pieces: Math.floor(valeur) }
            : { categoryCode: offer.categoryCode, quantityKg: valeur };
        }),
      );
      setShipmentId(expedition.id);
      setEtape("photos");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "La déclaration a échoué.");
    } finally {
      setBusy(false);
    }
  }

  async function transmettre() {
    if (!shipmentId) {
      return;
    }
    setBusy(true);
    setFailure(null);
    try {
      // Les photos partent d'abord, puis la demande est mise à jour avec
      // leurs clés : le serveur exige une photo par contenu, et il ne
      // peut la rattacher qu'une fois l'objet déposé.
      const cles: Record<string, string> = {};
      for (const offer of choisies) {
        const saisie = lignes[offer.categoryCode];
        if (saisie?.photo) {
          cles[offer.categoryCode] = await uploadParcelPhoto(shipmentId, saisie.photo);
        } else if (saisie?.photoKey) {
          cles[offer.categoryCode] = saisie.photoKey;
        }
      }

      await updateShipment(
        shipmentId,
        choisies.map((offer) => {
          const valeur = Number.parseFloat(
            (lignes[offer.categoryCode]?.quantity ?? "").replace(",", "."),
          );
          const base = { photoKey: cles[offer.categoryCode] ?? null };
          return offer.perPiece
            ? { ...base, categoryCode: offer.categoryCode, pieces: Math.floor(valeur) }
            : { ...base, categoryCode: offer.categoryCode, quantityKg: valeur };
        }),
      );

      await submitShipment(shipmentId);
      router.push("/compte/envois");
      router.refresh();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "La transmission a échoué.");
      setBusy(false);
    }
  }

  const photosCompletes = choisies.every(
    (offer) => lignes[offer.categoryCode]?.photo || lignes[offer.categoryCode]?.photoKey,
  );

  return (
    <div className="mx-auto w-full max-w-lg space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {etape === "saisie" ? "Que voulez-vous envoyer ?" : "Photographiez le contenu"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {etape === "saisie"
            ? `Ce voyageur dispose de ${capacity.availableWeightKg} kg.`
            : "Une photo par type de contenu. Elle protège les deux parties en cas de litige."}
        </p>
      </header>

      {etape === "saisie" ? (
        <>
          <ul className="space-y-2.5">
            {capacity.offers.map((offer) => {
              const choisie = offer.categoryCode in lignes;
              const saisie = lignes[offer.categoryCode];
              const valeur = Number.parseFloat(
                (saisie?.quantity ?? "").replace(",", "."),
              );
              const ligneMinor = Number.isFinite(valeur)
                ? estimateLineMinor(
                    offer.priceMinor,
                    offer.perPiece ? Math.floor(valeur) : Math.round(valeur * 1000),
                    offer.perPiece,
                  )
                : 0;

              return (
                <li
                  key={offer.categoryCode}
                  className={`rounded-xl border p-3.5 transition-colors ${
                    choisie ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={choisie}
                      onChange={() => basculer(offer.categoryCode)}
                      className="mt-1 size-4"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {labels[offer.categoryCode] ?? offer.categoryCode}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {offer.priceMajor} € {offer.perPiece ? "par pièce" : "par kilo"}
                      </span>
                    </span>
                  </label>

                  {choisie && (
                    <div className="mt-3 flex items-center gap-2 pl-7">
                      <input
                        inputMode="decimal"
                        value={saisie?.quantity ?? ""}
                        placeholder={offer.perPiece ? "2" : "8"}
                        aria-label={`Quantité pour ${labels[offer.categoryCode] ?? offer.categoryCode}`}
                        onChange={(event) =>
                          setLignes((courant) => ({
                            ...courant,
                            [offer.categoryCode]: {
                              ...courant[offer.categoryCode],
                              quantity: event.target.value,
                            },
                          }))
                        }
                        className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <span className="text-sm text-muted-foreground">
                        {offer.perPiece ? "pièce(s)" : "kg"}
                      </span>
                      {ligneMinor > 0 && (
                        <span className="ml-auto text-sm font-medium tabular-nums">
                          {(ligneMinor / 100).toFixed(2)} €
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <Recapitulatif
            totalMinor={totalMinor}
            restant={restant}
            trop={trop}
            currency={capacity.currency}
          />

          <button
            type="button"
            onClick={continuer}
            disabled={!complet || busy}
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-40"
          >
            {busy ? "…" : "Continuer"}
          </button>
        </>
      ) : (
        <>
          <ul className="space-y-2.5">
            {choisies.map((offer) => (
              <li
                key={offer.categoryCode}
                className="rounded-xl border border-border p-3.5"
              >
                <p className="text-sm font-medium">
                  {labels[offer.categoryCode] ?? offer.categoryCode}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  aria-label={`Photo pour ${labels[offer.categoryCode] ?? offer.categoryCode}`}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setLignes((courant) => ({
                      ...courant,
                      [offer.categoryCode]: {
                        ...courant[offer.categoryCode],
                        photo: file,
                      },
                    }));
                  }}
                  className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm"
                />
                {lignes[offer.categoryCode]?.photo && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {lignes[offer.categoryCode]?.photo?.name}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <Recapitulatif
            totalMinor={totalMinor}
            restant={restant}
            trop={false}
            currency={capacity.currency}
          />

          <button
            type="button"
            onClick={transmettre}
            disabled={!photosCompletes || busy}
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-40"
          >
            {busy ? "Envoi en cours…" : "Transmettre ma demande"}
          </button>
          <button
            type="button"
            onClick={() => setEtape("saisie")}
            className="w-full text-sm text-muted-foreground underline"
          >
            Revenir aux quantités
          </button>
        </>
      )}

      {failure && (
        <p
          className="rounded-xl border border-error/40 bg-error/10 p-3 text-sm"
          role="alert"
        >
          {failure}
        </p>
      )}
    </div>
  );
}

function Recapitulatif({
  totalMinor,
  restant,
  trop,
  currency,
}: {
  totalMinor: number;
  restant: number;
  trop: boolean;
  currency: string;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-muted-foreground">Montant pour le voyageur</span>
        <span className="text-xl font-semibold tabular-nums">
          {(totalMinor / 100).toFixed(2)} {currency === "EUR" ? "€" : currency}
        </span>
      </div>
      {/* Dit explicitement, parce que la facture finale sera plus élevée
          et qu'une surprise au paiement fait abandonner. */}
      <p className="mt-1 text-xs text-muted-foreground">
        Hors frais de service, assurance et transport éventuels.
      </p>
      <p className={`mt-2 text-sm ${trop ? "text-error" : "text-muted-foreground"}`}>
        {trop
          ? `Vous dépassez de ${Math.abs(restant).toFixed(1)} kg la place disponible.`
          : `Il restera ${restant.toFixed(1)} kg au voyageur.`}
      </p>
    </div>
  );
}
