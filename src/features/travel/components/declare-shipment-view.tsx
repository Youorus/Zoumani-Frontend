"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { prepareCheckout } from "@/features/payments/api/payment-client";
import { InsuranceStep } from "@/features/payments/components/insurance-step";

import {
  declareShipment,
  submitShipment,
  updateShipment,
  uploadParcelPhoto,
} from "../api/travel-client";
import type { Capacity } from "../types/travel.types";
import { estimateLineMinor, type CapacityMatch } from "../types/trip.types";
import {
  CategoryPhotosStep,
  MIN_PHOTOS,
  type CategoryPhotos,
} from "./category-photos-step";
import { HandoverStep } from "./handover-step";
import { TripSummaryBanner } from "./trip-summary-banner";

interface DeclareShipmentViewProps {
  capacity: Capacity;
  /** Libellés des catégories, résolus côté serveur. */
  labels: Record<string, string>;
  /** Le voyage choisi, rappelé à chaque étape. */
  match: CapacityMatch;
  /** Position de l'expéditeur, issue de son adresse vérifiée. */
  sender: { latitude: number; longitude: number; countryCode: string } | null;
  senderCountryCode: string | null;
  /** Distance jusqu'au voyageur, si les deux adresses sont situées. */
  distanceMeters: number | null;
}

interface LigneSaisie {
  quantity: string;
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
export function DeclareShipmentView({
  capacity,
  labels,
  match,
  sender,
  senderCountryCode,
  distanceMeters,
}: DeclareShipmentViewProps) {
  const router = useRouter();
  const [lignes, setLignes] = useState<Record<string, LigneSaisie>>({});
  const [busy, setBusy] = useState(false);
  const [etape, setEtape] = useState<
    "saisie" | "photos" | "remise" | "protection"
  >("saisie");
  // Une catégorie à la fois : tout demander d'un coup produisait une
  // page où l'on ne savait plus quelle photo documentait quoi.
  const [photoIndex, setPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState<Record<string, CategoryPhotos>>({});
  const [remise, setRemise] = useState<{
    method: "in_person" | "carrier";
    pointCode: string | null;
    carrierCode: string | null;
    quoteToken: string | null;
    extraMinor: number;
  }>({
    method: capacity.acceptsInPerson ? "in_person" : "carrier",
    pointCode: null,
    carrierCode: null,
    quoteToken: null,
    extraMinor: 0,
  });
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [declaredValues, setDeclaredValues] = useState<Record<string, string>>({});
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [uploadedPhotoKeys, setUploadedPhotoKeys] = useState<Record<string, string>>(
    {},
  );
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
  const protectionComplete =
    !insuranceSelected ||
    choisies.every((offer) => {
      const value = Number.parseFloat(
        (declaredValues[offer.categoryCode] ?? "").replace(",", "."),
      );
      return Number.isFinite(value) && value > 0;
    });

  function basculer(code: string) {
    setLignes((courant) => {
      const suivant = { ...courant };
      if (code in suivant) {
        delete suivant[code];
      } else {
        suivant[code] = { quantity: "" };
      }
      return suivant;
    });
  }

  async function continuer() {
    setBusy(true);
    setFailure(null);
    try {
      const lines = choisies.map((offer) => {
          const valeur = Number.parseFloat(
            (lignes[offer.categoryCode]?.quantity ?? "").replace(",", "."),
          );
          return offer.perPiece
            ? { categoryCode: offer.categoryCode, pieces: Math.floor(valeur) }
            : { categoryCode: offer.categoryCode, quantityKg: valeur };
        });

      if (shipmentId) {
        await updateShipment(shipmentId, lines);
      } else {
        const expedition = await declareShipment(capacity.id, lines);
        setShipmentId(expedition.id);
      }
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
      // Séquentiel plutôt que parallèle : douze photos envoyées en même
      // temps saturent une connexion mobile, et l'on ne sait plus
      // laquelle a échoué.
      const cles: Record<string, string[]> = {};
      const dejaEnvoyees = { ...uploadedPhotoKeys };
      for (const offer of choisies) {
        cles[offer.categoryCode] = [];
        const files = photos[offer.categoryCode]?.files ?? [];
        for (const [index, prise] of files.entries()) {
          const signature = photoSignature(offer.categoryCode, prise, index);
          let key = dejaEnvoyees[signature];
          if (!key) {
            key = await uploadParcelPhoto(shipmentId, prise);
            dejaEnvoyees[signature] = key;
            // Conservé après chaque succès : si le réseau coupe sur la
            // photo suivante, la reprise ne renvoie pas celles déjà reçues.
            setUploadedPhotoKeys({ ...dejaEnvoyees });
          }
          cles[offer.categoryCode].push(key);
        }
      }

      await updateShipment(
        shipmentId,
        choisies.map((offer) => {
          const valeur = Number.parseFloat(
            (lignes[offer.categoryCode]?.quantity ?? "").replace(",", "."),
          );
          const base = {
            photoKeys: cles[offer.categoryCode] ?? [],
            note: photos[offer.categoryCode]?.note?.trim() || null,
            declaredValueMinor: insuranceSelected
              ? Math.round(
                  Number.parseFloat(
                    (declaredValues[offer.categoryCode] ?? "0").replace(",", "."),
                  ) * 100,
                )
              : null,
          };
          return offer.perPiece
            ? { ...base, categoryCode: offer.categoryCode, pieces: Math.floor(valeur) }
            : { ...base, categoryCode: offer.categoryCode, quantityKg: valeur };
        }),
        remise.method,
        remise.method === "carrier" &&
          remise.pointCode &&
          remise.carrierCode &&
          remise.quoteToken
          ? {
              pointCode: remise.pointCode,
              carrierCode: remise.carrierCode,
              quoteToken: remise.quoteToken,
            }
          : null,
      );

      await submitShipment(shipmentId);
      await prepareCheckout(shipmentId, insuranceSelected);
      router.push(`/envois/${shipmentId}/paiement`);
      router.refresh();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "La transmission a échoué.");
      setBusy(false);
    }
  }

  const stepNumber =
    etape === "saisie" ? 1 : etape === "photos" ? 2 : etape === "remise" ? 3 : 4;

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-9">
      <div className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <section className="relative overflow-hidden rounded-[2rem] bg-inverse-surface px-6 py-7 text-inverse-foreground sm:px-9 sm:py-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 30%, var(--primary) 0 2px, transparent 3px), linear-gradient(120deg, transparent 45%, var(--primary) 46% 47%, transparent 48%)",
            backgroundSize: "42px 42px, 110px 110px",
          }}
        />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Envoyer avec Zoumani
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Un colis bien préparé voyage l&apos;esprit léger.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-inverse-muted-foreground">
              Vous choisissez ce qui part, nous gardons la trace de son état, puis le
              voyageur effectue sa dernière vérification avant le départ.
            </p>
          </div>
          <ol className="flex gap-2" aria-label="Progression de l'envoi">
            {["Contenu", "Preuves", "Remise", "Protection"].map((label, index) => {
              const number = index + 1;
              return (
                <li
                  key={label}
                  aria-current={number === stepNumber ? "step" : undefined}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                    number === stepNumber
                      ? "bg-primary text-primary-foreground"
                      : number < stepNumber
                        ? "bg-white/15 text-white"
                        : "border border-white/15 text-inverse-muted-foreground"
                  }`}
                >
                  {number}. {label}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <div className="relative mt-5 grid items-start gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-4 lg:sticky lg:top-24">
          {/* Le voyage choisi reste visible pendant tout le parcours. */}
          <TripSummaryBanner match={match} />
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              La chaîne de confiance
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Identité et billet du voyageur contrôlés</li>
              <li>Trois vues du contenu conservées en privé</li>
              <li>Colis revérifié avec le voyageur avant départ</li>
            </ul>
          </div>
        </aside>

        <main className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_24px_70px_-48px_rgb(43_29_23_/_0.55)] sm:p-7">
          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Étape {stepNumber} sur 4
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {etape === "saisie"
                ? "Que voulez-vous envoyer ?"
                : etape === "photos"
                  ? "Montrez-nous le contenu"
                  : etape === "remise"
                    ? "Comment rejoint-il le voyageur ?"
                    : "Souhaitez-vous protéger sa valeur ?"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {etape === "saisie"
                ? `Ce voyageur dispose encore de ${capacity.availableWeightKg} kg.`
                : etape === "photos"
                  ? "Trois angles montrent le volume, l'état et le conditionnement : une vraie protection pour vous deux."
                  : etape === "remise"
                    ? "Vous choisissez le dépôt ; la distance détermine si une rencontre reste raisonnable."
                    : "Une décision claire, prise avant de voir le récapitulatif de paiement."}
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
      ) : etape === "photos" ? (
        <>
          <CategoryPhotosStep
            categoryLabel={
              labels[choisies[photoIndex].categoryCode] ??
              choisies[photoIndex].categoryCode
            }
            index={photoIndex}
            total={choisies.length}
            value={photos[choisies[photoIndex].categoryCode] ?? { files: [], note: "" }}
            onChange={(valeur) =>
              setPhotos((courant) => ({
                ...courant,
                [choisies[photoIndex].categoryCode]: valeur,
              }))
            }
          />

          <button
            type="button"
            onClick={() =>
              photoIndex < choisies.length - 1
                ? setPhotoIndex(photoIndex + 1)
                : setEtape("remise")
            }
            disabled={
              (photos[choisies[photoIndex].categoryCode]?.files.length ?? 0) < MIN_PHOTOS
            }
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-40"
          >
            {photoIndex < choisies.length - 1 ? "Contenu suivant" : "Continuer"}
          </button>
          <button
            type="button"
            onClick={() =>
              photoIndex > 0 ? setPhotoIndex(photoIndex - 1) : setEtape("saisie")
            }
            className="w-full text-sm text-muted-foreground underline"
          >
            {photoIndex > 0 ? "Contenu précédent" : "Revenir aux quantités"}
          </button>
        </>
      ) : etape === "remise" ? (
        <>
          <HandoverStep
            sender={sender}
            senderCountryCode={senderCountryCode}
            weightGrams={Math.max(100, Math.round(poidsDeclare * 1000))}
            distanceMeters={distanceMeters}
            parcelTotalMinor={totalMinor}
            currency={capacity.currency}
            acceptsInPerson={capacity.acceptsInPerson}
            onChange={setRemise}
          />

          {remise.method === "carrier" && remise.pointCode === null && (
            <p className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-muted-foreground">
              Choisissez le point où vous déposerez le colis avant de continuer.
            </p>
          )}

          <button
            type="button"
            onClick={() => setEtape("protection")}
            disabled={
              busy ||
              (remise.method === "carrier" &&
                (remise.pointCode === null ||
                  remise.carrierCode === null ||
                  remise.quoteToken === null))
            }
            className="focus-ring w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
          >
            Continuer vers la protection
          </button>
          <button
            type="button"
            onClick={() => {
              setPhotoIndex(Math.max(0, choisies.length - 1));
              setEtape("photos");
            }}
            disabled={busy}
            className="w-full text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Revenir aux photos
          </button>
        </>
      ) : (
        <>
          <InsuranceStep
            lines={choisies.map((offer) => ({
              categoryCode: offer.categoryCode,
              label: labels[offer.categoryCode] ?? offer.categoryCode,
            }))}
            currency={capacity.currency}
            selected={insuranceSelected}
            values={declaredValues}
            onSelectedChange={setInsuranceSelected}
            onValuesChange={setDeclaredValues}
          />
          <button
            type="button"
            onClick={transmettre}
            disabled={!protectionComplete || busy}
            className="focus-ring w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
          >
            {busy ? "Préparation du récapitulatif…" : "Voir mon récapitulatif"}
          </button>
          <button
            type="button"
            onClick={() => setEtape("remise")}
            disabled={busy}
            className="w-full text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Revenir au mode de remise
          </button>
        </>
          )}

          {failure && (
            <p
              className="mt-4 rounded-xl border border-error/40 bg-error/10 p-3 text-sm"
              role="alert"
            >
              {failure}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

function photoSignature(categoryCode: string, file: File, index: number): string {
  return [categoryCode, index, file.name, file.size, file.lastModified].join(":");
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
