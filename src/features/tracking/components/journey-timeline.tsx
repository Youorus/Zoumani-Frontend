"use client";

import { AlertTriangle, Check } from "lucide-react";

import {
  STEP_LABELS,
  isIncident,
  stateOf,
  trackFor,
  type JourneyEvent,
  type JourneyStep,
} from "../types/tracking.types";

/**
 * La frise d'un colis.
 *
 * ═══ Ce qu'elle montre, et ce qu'elle tait ═══
 *
 * Les étapes du parcours, avec celle atteinte. Pas les trente-cinq
 * statuts du transporteur : « Being sorted » puis « At sorting centre »
 * n'apprennent rien à qui attend son colis, et transforment un écran de
 * réassurance en journal technique.
 *
 * Les dates viennent de l'historique quand l'étape a eu lieu. Une étape à
 * venir n'en porte aucune — annoncer une date prévisionnelle qu'on ne
 * tient pas fait plus de mal que de ne rien dire.
 *
 * ═══ L'incident remplace, il ne s'insère pas ═══
 *
 * Un colis refusé ou perdu ne « continue » pas la frise. On montre alors
 * ce qui a été franchi, et l'incident au bout : le contraire laisserait
 * croire que la livraison suit son cours.
 */
export function JourneyTimeline({
  step,
  history,
}: {
  step: JourneyStep;
  history: JourneyEvent[];
}) {
  const track = trackFor(step);
  const dates = new Map(history.map((event) => [event.step, event.occurredAt]));
  const incident = isIncident(step);
  // En cas d'incident, la frise s'arrête à la dernière étape réellement
  // franchie : afficher les suivantes en « à venir » suggérerait qu'elles
  // arriveront.
  const franchies = track.filter((etape) => dates.has(etape));
  const affichees = incident ? franchies : track;

  return (
    <ol className="relative space-y-0">
      {affichees.map((etape, index) => {
        const etat = incident ? "done" : stateOf(etape, step);
        const dernier = index === affichees.length - 1 && !incident;
        return (
          <Etape
            key={etape}
            label={STEP_LABELS[etape]}
            date={dates.get(etape)}
            state={etat}
            last={dernier}
          />
        );
      })}
      {incident ? (
        <Etape
          label={STEP_LABELS.incident}
          date={dates.get("incident")}
          state="incident"
          last
        />
      ) : null}
    </ol>
  );
}

function Etape({
  label,
  date,
  state,
  last,
}: {
  label: string;
  date?: string;
  state: "done" | "current" | "todo" | "incident";
  last: boolean;
}) {
  const incident = state === "incident";
  const actif = state === "current";
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {/* Le trait relie les pastilles. Absent sur la dernière, sinon il
          pend dans le vide. */}
      {!last ? (
        <span
          aria-hidden
          className={`absolute left-[11px] top-6 h-full w-px ${
            state === "done" ? "bg-primary/40" : "bg-border"
          }`}
        />
      ) : null}

      <span
        aria-hidden
        className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
          incident
            ? "border-error bg-error text-white"
            : state === "done"
              ? "border-primary bg-primary text-white"
              : actif
                ? "border-primary bg-background"
                : "border-border bg-background"
        }`}
      >
        {incident ? (
          <AlertTriangle size={13} strokeWidth={2.5} />
        ) : state === "done" ? (
          <Check size={13} strokeWidth={3} />
        ) : actif ? (
          <span className="size-2 rounded-full bg-primary" />
        ) : null}
      </span>

      <div className="min-w-0 pt-0.5">
        <p
          className={`text-sm ${
            actif || incident
              ? "font-semibold text-foreground"
              : state === "done"
                ? "text-foreground"
                : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
        {date ? (
          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
        ) : null}
      </div>
    </li>
  );
}

/**
 * La date d'une étape, telle qu'on la lit.
 *
 * Jour et heure : pour un colis, « le 15 août à 14:32 » répond à la
 * question qu'on se pose — depuis combien de temps ? — là où une date
 * seule laisse dans le flou.
 */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
