"use client";

import { useEffect, useState } from "react";

import { fetchHandoverOptions } from "../api/travel-client";
import {
  formatDistance,
  type HandoverOptions,
  type ServicePoint,
} from "../types/trip.types";
import { ServicePointsMap } from "./service-points-map";

interface HandoverStepProps {
  /** Position de l'expéditeur, issue de son adresse vérifiée. */
  sender: { latitude: number; longitude: number; countryCode: string } | null;
  weightGrams: number;
  /** Distance jusqu'au voyageur. `null` si l'une des adresses est inconnue. */
  distanceMeters: number | null;
  /** Ce que le colis coûte au voyageur, en unités mineures. */
  parcelTotalMinor: number;
  onChange: (choice: {
    method: "in_person" | "carrier";
    pointCode: string | null;
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
 * ═══ Le conseil ne verrouille rien ═══
 *
 * Le serveur recommande selon la distance, l'interface met en avant —
 * mais les deux modes restent accessibles. Quelqu'un peut vouloir
 * rencontrer un voyageur à cent kilomètres, et quelqu'un d'autre
 * préférer un relais à deux rues.
 *
 * ═══ « Nous n'avons pas pu chercher » n'est pas « il n'y a rien » ═══
 *
 * Un fournisseur en panne ne doit jamais faire croire à un expéditeur
 * qu'aucun relais n'existe près de chez lui. Le message le dit, et la
 * remise en main propre reste ouverte.
 */
export function HandoverStep({
  sender,
  weightGrams,
  distanceMeters,
  parcelTotalMinor,
  onChange,
}: HandoverStepProps) {
  const [options, setOptions] = useState<HandoverOptions | null>(null);
  const [method, setMethod] = useState<"in_person" | "carrier">("in_person");
  const [point, setPoint] = useState<ServicePoint | null>(null);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!sender) {
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
        }
      })
      .then(() =>
        fetchHandoverOptions({
          latitude: sender.latitude,
          longitude: sender.longitude,
          countryCode: sender.countryCode,
          weightGrams,
          distanceMeters,
        }),
      )
      .then((valeur) => {
        if (!vivant) {
          return;
        }
        setOptions(valeur);
        // Le conseil décide de ce qui est **présélectionné**, pas de ce
        // qui est possible.
        if (valeur.advice === "carrier_recommended" && valeur.servicePoints.length > 0) {
          setMethod("carrier");
        }
      })
      .catch(() => undefined)
      .finally(() => vivant && setChargement(false));
    return () => {
      vivant = false;
      controller.annule = true;
    };
  }, [sender, weightGrams, distanceMeters]);

  const quote =
    options?.quotes.find((q) => q.carrier === point?.carrier) ?? options?.quotes[0];
  const extraMinor = method === "carrier" && quote ? quote.priceMinor : 0;

  useEffect(() => {
    onChange({ method, pointCode: point?.code ?? null, extraMinor });
  }, [method, point, extraMinor, onChange]);

  if (!sender) {
    return (
      <Encadre>
        Nous ne connaissons pas encore votre adresse. La remise se fera en main propre,
        convenue avec le voyageur.
      </Encadre>
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
          recommande={options?.advice === "in_person_only"}
          onClick={() => setMethod("in_person")}
        />
        <ModeCard
          titre="Dépôt en point relais"
          detail={
            options?.pointsOutcome === "unavailable"
              ? "Momentanément indisponible."
              : "Nous nous chargeons de l'acheminer au voyageur."
          }
          prix={quote ? `dès ${quote.priceMajor} €` : "—"}
          actif={method === "carrier"}
          recommande={options?.advice === "carrier_recommended"}
          disabled={!options || options.servicePoints.length === 0}
          onClick={() => setMethod("carrier")}
        />
      </div>

      {chargement && (
        <p className="text-sm text-muted-foreground">Recherche des points de dépôt…</p>
      )}

      {options?.pointsOutcome === "unavailable" && (
        <Encadre>
          Nous n&apos;avons pas pu interroger nos transporteurs à l&apos;instant. Ce
          n&apos;est pas qu&apos;il n&apos;y a aucun point près de chez vous — réessayez
          plus tard, ou convenez d&apos;une remise en main propre.
        </Encadre>
      )}

      {method === "carrier" && options && options.servicePoints.length > 0 && (
        <div className="space-y-3">
          <ServicePointsMap
            points={options.servicePoints}
            center={{ latitude: sender.latitude, longitude: sender.longitude }}
            selected={point?.code ?? null}
            onSelect={(code) =>
              setPoint(options.servicePoints.find((p) => p.code === code) ?? null)
            }
          />

          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {options.servicePoints.map((candidat) => {
              const choisi = candidat.code === point?.code;
              return (
                <li key={candidat.code}>
                  <button
                    type="button"
                    onClick={() => setPoint(candidat)}
                    aria-pressed={choisi}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      choisi
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-sm font-medium">
                        {candidat.name}
                      </span>
                      {candidat.distanceMeters !== null && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDistance(candidat.distanceMeters)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {candidat.street}, {candidat.postalCode} {candidat.city} ·{" "}
                      {candidat.carrierName}
                    </p>
                    {candidat.openingTimes.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {candidat.openingTimes[0]}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-border p-4">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Montant pour le voyageur</dt>
            <dd className="tabular-nums">{(parcelTotalMinor / 100).toFixed(2)} €</dd>
          </div>
          {extraMinor > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Acheminement {quote?.label}</dt>
              <dd className="tabular-nums">{(extraMinor / 100).toFixed(2)} €</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-border pt-1.5 font-medium">
            <dt>Total</dt>
            <dd className="tabular-nums">{(total / 100).toFixed(2)} €</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">
          Hors frais de service et assurance éventuelle.
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
  disabled,
  onClick,
}: {
  titre: string;
  detail: string;
  prix: string;
  actif: boolean;
  recommande?: boolean;
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
          conseillé
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
