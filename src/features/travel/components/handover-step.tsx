"use client";

import { useEffect, useState } from "react";

import { fetchHandoverOptions } from "../api/travel-client";
import {
  formatDistance,
  type HandoverOptions,
  type ServicePoint,
} from "../types/trip.types";
import { ServicePointSelector } from "./service-point-selector";

interface HandoverStepProps {
  /** Position de l'expéditeur, issue de son adresse vérifiée. */
  sender: { latitude: number; longitude: number; countryCode: string } | null;
  /** Pays de résidence, disponible même si l'adresse n'a pas été géocodée. */
  senderCountryCode: string | null;
  weightGrams: number;
  /** Distance jusqu'au voyageur. `null` si l'une des adresses est inconnue. */
  distanceMeters: number | null;
  /** Ce que le colis coûte au voyageur, en unités mineures. */
  parcelTotalMinor: number;
  /** Ce voyageur accepte-t-il aussi une remise en main propre ? */
  acceptsInPerson: boolean;
  onChange: (choice: {
    method: "in_person" | "carrier";
    pointCode: string | null;
    carrierCode: string | null;
    quoteToken: string | null;
    extraMinor: number;
  }) => void;
}

/**
 * Comment le colis parvient au voyageur.
 *
 * ═══ Le total complet, tout de suite ═══
 *
 * Le prix du transport s'ajoute au montant du voyageur **à l'écran**, à
 * mesure qu'on choisit. Découvrir la somme au moment de payer est la
 * meilleure façon de perdre quelqu'un qui avait décidé d'envoyer.
 *
 * ═══ La distance protège un accord réaliste ═══
 *
 * Le serveur impose le transporteur au-delà du seuil métier. Ce n'est
 * pas qu'une apparence : `shipment` recalcule la même règle avant de
 * transmettre la demande.
 *
 * ═══ « Nous n'avons pas pu chercher » n'est pas « il n'y a rien » ═══
 *
 * Un fournisseur en panne ne doit jamais faire croire à un expéditeur
 * qu'aucun relais n'existe près de chez lui. Le message le dit, et la
 * remise en main propre reste ouverte.
 */
export function HandoverStep({
  sender,
  senderCountryCode,
  weightGrams,
  distanceMeters,
  parcelTotalMinor,
  acceptsInPerson,
  onChange,
}: HandoverStepProps) {
  const [options, setOptions] = useState<HandoverOptions | null>(null);
  const [position, setPosition] = useState(sender);
  const [method, setMethod] = useState<"in_person" | "carrier">(
    acceptsInPerson ? "in_person" : "carrier",
  );
  const [point, setPoint] = useState<ServicePoint | null>(null);
  const [chargement, setChargement] = useState(false);
  const [localisation, setLocalisation] = useState(false);
  const [lookupFailure, setLookupFailure] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [radiusMeters, setRadiusMeters] = useState(5_000);

  useEffect(() => {
    if (!position) {
      return;
    }
    let vivant = true;
    // `setChargement` part dans la promesse et non dans le corps de
    // l'effet : un `setState` synchrone y déclenche un rendu en cascade.
    const controller = { annule: false };
    void Promise.resolve()
      .then(() => {
        if (!controller.annule) {
          setChargement(true);
          setLookupFailure(null);
        }
      })
      .then(() =>
        fetchHandoverOptions({
          latitude: position.latitude,
          longitude: position.longitude,
          countryCode: position.countryCode,
          weightGrams,
          distanceMeters,
          acceptsInPerson,
          radiusMeters,
        }),
      )
      .then((valeur) => {
        if (!vivant) {
          return;
        }
        setOptions(valeur);
        setPoint((current) =>
          current
            ? (valeur.servicePoints.find(
                (candidate) =>
                  candidate.code === current.code && candidate.carrier === current.carrier,
              ) ?? null)
            : null,
        );
        if (valeur.advice === "carrier_required") {
          setMethod("carrier");
        }
      })
      .catch((error) => {
        if (vivant) {
          setOptions(null);
          setLookupFailure(
            error instanceof Error
              ? error.message
              : "La recherche des points de dépôt n'a pas abouti.",
          );
        }
      })
      .finally(() => vivant && setChargement(false));
    return () => {
      vivant = false;
      controller.annule = true;
    };
  }, [position, weightGrams, distanceMeters, acceptsInPerson, radiusMeters, refreshKey]);

  const quote =
    options?.quotes.find((q) => q.carrier === point?.carrier) ?? options?.quotes[0];
  const extraMinor = method === "carrier" && quote ? quote.priceMinor : 0;

  useEffect(() => {
    onChange({
      method,
      pointCode: method === "carrier" ? (point?.code ?? null) : null,
      carrierCode: method === "carrier" ? (point?.carrier ?? null) : null,
      quoteToken: method === "carrier" ? (quote?.quoteToken ?? null) : null,
      extraMinor,
    });
  }, [method, point, quote, extraMinor, onChange]);

  function useCurrentPosition() {
    if (!senderCountryCode || !navigator.geolocation) {
      setLookupFailure(
        "La localisation n'est pas disponible sur cet appareil. Vérifiez votre adresse dans votre profil.",
      );
      return;
    }
    setLocalisation(true);
    setLookupFailure(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          latitude: coords.latitude,
          longitude: coords.longitude,
          countryCode: senderCountryCode,
        });
        setLocalisation(false);
      },
      () => {
        setLookupFailure(
          "Nous n'avons pas pu utiliser votre position. Autorisez-la, ou vérifiez l'adresse de votre profil.",
        );
        setLocalisation(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  if (!position) {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/25 bg-primary/5 p-4">
        <div>
          <p className="font-medium text-foreground">Trouvons les relais autour de vous</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Votre adresse vérifiée n&apos;a pas pu être placée sur la carte. Votre
            position sert uniquement à cette recherche de proximité.
          </p>
        </div>
        <button
          type="button"
          onClick={useCurrentPosition}
          disabled={localisation || !senderCountryCode}
          className="focus-ring rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {localisation ? "Localisation en cours…" : "Afficher les relais près de moi"}
        </button>
        {acceptsInPerson && (
          <p className="text-xs text-muted-foreground">
            La remise en main propre reste disponible si vous préférez convenir d&apos;un lieu.
          </p>
        )}
        {lookupFailure && (
          <p className="text-sm text-error" role="alert">
            {lookupFailure}
          </p>
        )}
      </div>
    );
  }

  const total = parcelTotalMinor + extraMinor;

  return (
    <div className="space-y-4">
      {distanceMeters !== null && (
        <p className="text-sm text-muted-foreground">
          Le voyageur est à{" "}
          <span className="font-medium text-foreground">
            {formatDistance(distanceMeters)}
          </span>{" "}
          de chez vous.
        </p>
      )}

      <div className="grid gap-2.5 sm:grid-cols-2">
        <ModeCard
          titre="Remise en main propre"
          detail="Vous convenez d'un lieu ensemble. Sans frais."
          prix="Gratuit"
          actif={method === "in_person"}
          disabled={!acceptsInPerson || options?.advice === "carrier_required"}
          onClick={() => setMethod("in_person")}
        />
        <ModeCard
          titre="Dépôt en point relais"
          detail={
            options?.pointsOutcome === "unavailable"
                ? "Momentanément indisponible."
                : "Vous déposez près de chez vous, le colis est livré au voyageur."
          }
          prix={quote ? `dès ${quote.priceMajor} €` : "—"}
          actif={method === "carrier"}
          recommande={options?.advice === "carrier_required"}
          recommendationLabel="obligatoire"
          disabled={!options || options.servicePoints.length === 0}
          onClick={() => setMethod("carrier")}
        />
      </div>

      {chargement && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3" role="status">
          <p className="text-sm font-medium text-foreground">Recherche autour de vous…</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/15">
            <span className="block h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      )}

      {lookupFailure && !chargement && (
        <div className="rounded-xl border border-error/25 bg-error/5 p-3" role="alert">
          <p className="text-sm text-muted-foreground">{lookupFailure}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="focus-ring mt-2 rounded-lg text-sm font-bold text-primary"
          >
            Relancer la recherche
          </button>
        </div>
      )}

      {options?.pointsOutcome === "unavailable" && (
        <Encadre>
          Nous n&apos;avons pas pu interroger nos transporteurs à l&apos;instant. Ce
          n&apos;est pas qu&apos;il n&apos;y a aucun point près de chez vous — réessayez
          plus tard. Si la distance le permet, la remise en main propre reste disponible.
        </Encadre>
      )}

      {options &&
        (options.pointsOutcome === "none_nearby" ||
          (options.pointsOutcome === "found" && options.servicePoints.length === 0)) && (
        <div className="rounded-xl border border-border bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            Aucun relais compatible n&apos;a été trouvé dans un rayon de {radiusMeters / 1_000} km.
          </p>
          {radiusMeters < 50_000 && (
            <button
              type="button"
              onClick={() => setRadiusMeters(radiusMeters < 15_000 ? 15_000 : 50_000)}
              className="focus-ring mt-2 rounded-lg text-sm font-bold text-primary"
            >
              Élargir la recherche à {radiusMeters < 15_000 ? 15 : 50} km
            </button>
          )}
        </div>
      )}

      {method === "carrier" && options && options.servicePoints.length > 0 && (
        <ServicePointSelector
          points={options.servicePoints}
          center={position}
          selected={point}
          onSelect={setPoint}
        />
      )}

      <div className="rounded-xl border border-border p-4">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Montant pour le voyageur</dt>
            <dd className="tabular-nums">{(parcelTotalMinor / 100).toFixed(2)} €</dd>
          </div>
          {method === "carrier" && quote && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Livraison {quote.label}</dt>
              <dd className="tabular-nums">
                {(quote.shippingMinor / 100).toFixed(2)} €
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-border pt-1.5 font-medium">
            <dt>Total</dt>
            <dd className="tabular-nums">{(total / 100).toFixed(2)} €</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">
          {quote?.isEstimate
            ? "Tarif transport estimé. Le montant contractuel sera confirmé avant tout débit."
            : "Tarif transport Sendcloud confirmé. Protection facultative à l'étape suivante."}
        </p>
      </div>
    </div>
  );
}

function ModeCard({
  titre,
  detail,
  prix,
  actif,
  recommande,
  recommendationLabel = "conseillé",
  disabled,
  onClick,
}: {
  titre: string;
  detail: string;
  prix: string;
  actif: boolean;
  recommande?: boolean;
  recommendationLabel?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={actif}
      className={`relative rounded-xl border p-3.5 text-left transition-colors disabled:opacity-40 ${
        actif ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"
      }`}
    >
      {recommande && (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary">
          {recommendationLabel}
        </span>
      )}
      <span className="block pr-16 text-sm font-medium">{titre}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
      <span className="mt-1.5 block text-sm font-medium">{prix}</span>
    </button>
  );
}

function Encadre({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
