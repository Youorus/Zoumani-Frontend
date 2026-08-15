"use client";

import { AlertTriangle, ArrowLeft, Clock, Download, PackageCheck } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { labelUrl, readJourney } from "../api/tracking-client";
import {
  isCancellable,
  isClosed,
  isIncident,
  needsLabel,
  type Journey,
} from "../types/tracking.types";
import { CancelShipment } from "./cancel-shipment";
import { JourneyTimeline } from "./journey-timeline";

/** Rythme de rafraîchissement pendant qu'un colis circule. */
const REFRESH_MS = 30_000;

/**
 * Le suivi d'un colis, pour celui qui le consulte.
 *
 * ═══ Un seul écran pour les deux personnes ═══
 *
 * L'expéditeur et le voyageur suivent le **même** colis, et cet écran ne
 * se dédouble pas. Ce qui change vient du serveur : le texte de l'action,
 * calculé pour celui qui regarde. À l'arrivée au relais, l'un lit
 * « retirez-le sous 24 heures » et l'autre « votre colis attend le
 * voyageur ».
 *
 * Le recomposer ici obligerait l'interface à savoir qui elle sert, et un
 * client qui se trompe dit à l'expéditeur d'aller chercher le colis qu'il
 * vient d'envoyer.
 *
 * ═══ Pourquoi il se rafraîchit tout seul ═══
 *
 * Un colis avance sans qu'on touche à l'écran. Laisser une page figée
 * oblige à recharger pour savoir — et la plupart des gens ne rechargent
 * pas, ils reviennent plus tard en croyant que rien n'a bougé.
 */
export function JourneyDetailView({ initial }: { initial: Journey }) {
  const [journey, setJourney] = useState(initial);
  const [rembourse, setRembourse] = useState<string | null>(null);

  useEffect(() => {
    // Un parcours clos ne bouge plus — livré, annulé ou en incident :
    // continuer à interroger l'API serait du trafic pour rien.
    if (isClosed(journey.step)) {
      return;
    }
    const timer = setInterval(() => {
      void readJourney(journey.id)
        .then(setJourney)
        // Un échec de rafraîchissement n'efface rien : on garde ce qui
        // est affiché plutôt que de montrer une erreur pour un réseau qui
        // a hoqueté.
        .catch(() => undefined);
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [journey.id, journey.step]);

  const incident = isIncident(journey.step);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <Link
        href={"/compte/envois" as Route}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden />
        Mes colis
      </Link>

      <section
        className={`rounded-2xl border p-5 ${
          incident ? "border-error/40 bg-error/5" : "border-border bg-card"
        }`}
      >
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {incident ? (
            <AlertTriangle size={14} className="text-error" aria-hidden />
          ) : (
            <PackageCheck size={14} className="text-primary" aria-hidden />
          )}
          Colis {journey.shipmentId.slice(0, 8)}
        </p>
        {/* L'action d'abord, en gros : c'est la seule chose que la
            personne est venue chercher. */}
        <p className="mt-2 text-lg font-semibold leading-snug">{journey.action}</p>

        {journey.deadlineAt ? <Deadline iso={journey.deadlineAt} /> : null}

        {needsLabel(journey) ? <LabelBlock shipmentId={journey.shipmentId} /> : null}

        {rembourse !== null ? (
          <p
            className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success-foreground"
            role="status"
          >
            {rembourse === "0.00"
              ? "Envoi annulé. Votre remboursement est en cours de traitement ; nous vous confirmons cela par e-mail."
              : `Envoi annulé. ${rembourse} € vous sont remboursés sous quelques jours.`}
          </p>
        ) : null}

        {isCancellable(journey) ? (
          <div className="mt-4 border-t border-border pt-4">
            <CancelShipment
              journeyId={journey.id}
              onCancelled={(resultat) => {
                setRembourse(resultat.refundedMajor);
                // On recharge depuis le serveur plutôt que de deviner
                // l'état : lui seul sait ce qui a réellement abouti.
                void readJourney(journey.id)
                  .then(setJourney)
                  .catch(() => undefined);
              }}
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Suivi</h2>
        <JourneyTimeline step={journey.step} history={journey.history} />
      </section>
    </div>
  );
}

/**
 * Le compte à rebours de retrait.
 *
 * Affiché en heures restantes plutôt qu'en date : « il vous reste 9
 * heures » se comprend d'un coup d'œil, là où « avant le 16 août à 10:12 »
 * demande de faire le calcul soi-même.
 */
function Deadline({ iso }: { iso: string }) {
  // Calculé dans un effet, jamais au rendu : lire l'horloge pendant le
  // rendu rend le composant impur — deux rendus successifs produiraient
  // deux résultats, et le serveur n'a pas la même heure que le
  // navigateur. Le décompte se met à jour tout seul, ce qui est aussi
  // plus juste : « il reste 2 h » ne doit pas rester affiché trois heures.
  const [restant, setRestant] = useState<number | null>(null);

  useEffect(() => {
    const echeance = new Date(iso).getTime();
    const calculer = () => setRestant(Math.max(0, echeance - Date.now()));
    calculer();
    const timer = setInterval(calculer, 60_000);
    return () => clearInterval(timer);
  }, [iso]);

  // Premier rendu, avant l'effet : rien plutôt qu'un décompte faux.
  if (restant === null) {
    return null;
  }

  const heures = Math.ceil(restant / 3_600_000);
  const urgent = heures <= 6;

  return (
    <p
      className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium ${
        urgent ? "bg-error/10 text-error" : "bg-warning/10 text-warning-foreground"
      }`}
      role={urgent ? "alert" : undefined}
    >
      <Clock size={15} aria-hidden />
      {restant === 0
        ? "Le délai de retrait est dépassé"
        : `Il reste ${heures} h pour le retirer`}
    </p>
  );
}

/**
 * L'étiquette, et ce qu'il faut faire avec.
 *
 * Les consignes sont ici **et** dans l'e-mail : celui qui arrive par
 * l'application ne doit pas avoir à retrouver un message pour savoir
 * comment emballer.
 */
function LabelBlock({ shipmentId }: { shipmentId: string }) {
  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      <a
        href={labelUrl(shipmentId)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <Download size={16} aria-hidden />
        Télécharger l&apos;étiquette
      </a>
      <p className="text-xs text-muted-foreground">
        Vous pouvez la retélécharger autant de fois que nécessaire.
      </p>

      <ol className="space-y-1.5 text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">Emballez</strong> solidement : le colis
          voyage en soute puis dans un bagage.
        </li>
        <li>
          <strong className="text-foreground">Collez l&apos;étiquette</strong> bien à
          plat, sans replier le code-barres.
        </li>
        <li>
          <strong className="text-foreground">Déposez</strong> au point relais que vous
          avez choisi.
        </li>
      </ol>

      {/* L'avertissement dit ce qu'il en coûte plutôt que de menacer : une
          menace se lit comme une formalité, une conséquence concrète se
          retient. */}
      <p className="rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
        Vérifiez que le contenu est exactement celui que vous avez déclaré. Un colis dont
        le contenu diffère engage votre responsabilité : le voyageur peut le refuser, la
        douane peut le retenir, et l&apos;assurance ne couvre que ce qui a été déclaré.
      </p>
    </div>
  );
}
