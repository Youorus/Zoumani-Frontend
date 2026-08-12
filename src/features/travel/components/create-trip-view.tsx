"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { VerificationStage } from "@/features/verification/types/verification.types";

import {
  declareTrip,
  fetchCatalog,
  fetchLastPrices,
  offerCapacity,
  submitTrip,
} from "../api/travel-client";
import {
  fromMinorUnits,
  toMinorUnits,
  type Airport,
  type Catalog,
  type FlightLookup,
} from "../types/travel.types";
import { FlightStep } from "./flight-step";
import { StepCategories } from "./step-categories";
import { StepPricing } from "./step-pricing";
import { StepReview } from "./step-review";
import { StepWeight } from "./step-weight";
import { WizardShell } from "./wizard-shell";

interface CreateTripViewProps {
  stage: VerificationStage;
}

interface FlightChoice {
  origin: Airport;
  destination: Airport;
  airlineCode: string;
  flightNumber: string;
  departureDate: string;
  lookup: FlightLookup;
}

const TOTAL_STEPS = 5;
const DEVISE = "EUR";
const POIDS_MIN = 0.5;
const POIDS_MAX = 64;

/**
 * Le parcours de publication d'un voyage.
 *
 * ═══ Cinq écrans courts, pas deux longs ═══
 *
 * C'est le cœur du produit : l'endroit où un voyageur décide de rendre
 * ses bagages disponibles. Chaque écran pose **une** question et tient
 * sans défilement. Revenir en arrière ne perd jamais rien — l'état vit
 * ici, pas dans les composants d'étape, et c'est ce qui rend la
 * navigation libre.
 *
 * ═══ Le garde-fou est côté serveur ═══
 *
 * L'invitation à vérifier son identité évite de remplir un formulaire
 * pour se le voir refuser à l'envoi. Ce n'est pas une protection :
 * l'autorisation réelle est l'exigence d'un voyage vérifié, appliquée
 * par l'API.
 */
export function CreateTripView({ stage }: CreateTripViewProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [flight, setFlight] = useState<FlightChoice | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [weight, setWeight] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [remembered, setRemembered] = useState<string[]>([]);
  const [attestation, setAttestation] = useState({ accepted: false, version: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (stage !== "verifie") {
      return;
    }
    let vivant = true;

    void Promise.all([fetchCatalog(), fetchLastPrices().catch(() => [])]).then(
      ([catalogue, derniers]) => {
        if (!vivant) {
          return;
        }
        setCatalog(catalogue);

        // On ne reporte que les catégories encore au catalogue : une
        // catégorie retirée depuis le dernier voyage ne doit pas
        // réapparaître par la porte de la mémoire.
        const connues = new Set(catalogue.categories.map((c) => c.code));
        const repris: Record<string, string> = {};
        for (const offre of derniers) {
          if (connues.has(offre.categoryCode)) {
            repris[offre.categoryCode] = fromMinorUnits(offre.priceMinor);
          }
        }
        setPrices(repris);
        setRemembered(Object.keys(repris));
        setSelected(Object.keys(repris));
      },
    );

    return () => {
      vivant = false;
    };
  }, [stage]);

  if (stage !== "verifie") {
    return <InvitationAVerifier stage={stage} />;
  }

  const choisies = (catalog?.categories ?? []).filter((c) => selected.includes(c.code));

  function toggle(code: string) {
    setSelected((courant) =>
      courant.includes(code) ? courant.filter((c) => c !== code) : [...courant, code],
    );
  }

  function poidsValide(): boolean {
    const kg = Number.parseFloat(weight.replace(",", "."));
    return Number.isFinite(kg) && kg >= POIDS_MIN && kg <= POIDS_MAX;
  }

  function tarifsValides(): Record<string, string> {
    const trouves: Record<string, string> = {};
    for (const category of choisies) {
      const minor = toMinorUnits(prices[category.code] ?? "");
      if (minor === null || minor < 1) {
        trouves[category.code] = "Indiquez un tarif.";
      }
    }
    return trouves;
  }

  async function publier() {
    if (!flight || !catalog) {
      return;
    }
    if (!attestation.accepted || !attestation.version) {
      setErrors({ attestation: "Confirmez votre engagement pour continuer." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      // L'heure vient de la compagnie quand elle est connue. À défaut —
      // vérification indisponible — on retient midi UTC : une heure
      // plausible que l'examen humain corrigera, plutôt qu'un minuit qui
      // ferait basculer la date d'un fuseau à l'autre.
      const depart =
        flight.lookup.schedule?.departureAt ?? `${flight.departureDate}T12:00:00Z`;
      const arrivee =
        flight.lookup.schedule?.arrivalAt ?? `${flight.departureDate}T18:00:00Z`;

      const trip = await declareTrip([
        {
          segmentOrder: 1,
          airlineCode: flight.airlineCode,
          flightNumber: flight.flightNumber,
          originAirportCode: flight.origin.iata,
          destinationAirportCode: flight.destination.iata,
          departureAt: depart,
          arrivalAt: arrivee,
        },
      ]);

      await offerCapacity(trip.id, {
        totalWeightKg: Number.parseFloat(weight.replace(",", ".")),
        currency: DEVISE,
        offers: choisies.map((category) => ({
          categoryCode: category.code,
          priceMinor: toMinorUnits(prices[category.code] ?? "") ?? 0,
        })),
        notes: null,
      });

      // La transmission exige une preuve de billet, que ce parcours ne
      // demande pas encore. Cet échec précis n'est donc pas une erreur :
      // le voyage et l'offre sont enregistrés, il ne manque que le
      // justificatif, et l'on emmène la personne là où elle le dépose.
      try {
        await submitTrip(trip.id, attestation.version);
      } catch (error) {
        if (!estPreuveManquante(error)) {
          throw error;
        }
      }
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      setErrors({
        global:
          error instanceof Error
            ? error.message
            : "L'enregistrement n'a pas abouti. Réessayez.",
      });
      setIsSubmitting(false);
    }
  }

  const retour = step > 1 ? () => setStep(step - 1) : undefined;

  if (step === 1 || !flight) {
    return (
      <FlightStep
        onConfirmed={(choix) => {
          setFlight(choix);
          setStep(2);
        }}
      />
    );
  }

  if (step === 2) {
    return (
      <WizardShell
        step={2}
        total={TOTAL_STEPS}
        title="Combien de place libérez-vous ?"
        hint="Le poids que vous acceptez de transporter pour d'autres."
        onBack={retour}
        cta={{
          label: "Continuer",
          disabled: !poidsValide(),
          onClick: () => setStep(3),
        }}
      >
        <StepWeight value={weight} onChange={setWeight} error={errors.weight} />
      </WizardShell>
    );
  }

  if (step === 3) {
    return (
      <WizardShell
        step={3}
        total={TOTAL_STEPS}
        title="Que transportez-vous ?"
        hint="Choisissez ce que vous acceptez. Vous fixerez les tarifs juste après."
        onBack={retour}
        cta={{
          label:
            selected.length === 0
              ? "Choisissez au moins une catégorie"
              : `Continuer avec ${selected.length} catégorie${selected.length > 1 ? "s" : ""}`,
          disabled: selected.length === 0,
          onClick: () => setStep(4),
        }}
      >
        {catalog ? (
          <StepCategories
            categories={catalog.categories}
            prohibited={catalog.prohibited}
            selected={selected}
            onToggle={toggle}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        )}
      </WizardShell>
    );
  }

  if (step === 4) {
    return (
      <WizardShell
        step={4}
        total={TOTAL_STEPS}
        title="Vos tarifs"
        hint="Ce que vous demandez pour chaque catégorie."
        onBack={retour}
        cta={{
          label: "Continuer",
          onClick: () => {
            const trouves = tarifsValides();
            setErrors(trouves);
            if (Object.keys(trouves).length === 0) {
              setStep(5);
            }
          },
        }}
      >
        <StepPricing
          categories={choisies}
          prices={prices}
          remembered={remembered}
          errors={errors}
          onChange={(code, valeur) =>
            setPrices((courant) => ({ ...courant, [code]: valeur }))
          }
        />
      </WizardShell>
    );
  }

  return (
    <WizardShell
      step={5}
      total={TOTAL_STEPS}
      title="Vérifiez et publiez"
      hint="Voici ce que verront les expéditeurs."
      onBack={retour}
      cta={{
        label: "Publier mon voyage",
        disabled: !attestation.accepted,
        busy: isSubmitting,
        onClick: publier,
      }}
      footnote={
        errors.global ? (
          <p className="text-sm text-destructive">{errors.global}</p>
        ) : undefined
      }
    >
      <StepReview
        origin={flight.origin}
        destination={flight.destination}
        airlineCode={flight.airlineCode}
        flightNumber={flight.flightNumber}
        lookup={flight.lookup}
        weightKg={weight}
        categories={choisies}
        prices={prices}
        attestation={attestation}
        onAttestationChange={(accepted, version) => setAttestation({ accepted, version })}
        error={errors.attestation}
      />
    </WizardShell>
  );
}

/**
 * L'API dit-elle qu'il manque seulement le billet ?
 *
 * On teste la **raison** stable et non le message : celui-ci est rédigé
 * pour un humain et changera, quand la raison fait partie du contrat.
 */
function estPreuveManquante(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    (error as { reason?: string }).reason === "trip_proof_required"
  );
}

/**
 * Ce qu'on montre à qui n'a pas encore d'identité vérifiée.
 *
 * Le message dépend de l'étape : quelqu'un dont le dossier est en cours
 * d'examen n'a rien à faire, et lui proposer de « commencer » serait le
 * renvoyer vers un formulaire qu'il a déjà rempli.
 */
function InvitationAVerifier({ stage }: { stage: VerificationStage }) {
  const messages: Record<VerificationStage, { titre: string; texte: string }> = {
    absent: {
      titre: "Vérifiez votre identité pour proposer un voyage",
      texte:
        "Les expéditeurs confient leurs colis à des personnes dont l'identité est établie. C'est ce qui rend Zoumani sûr, dans les deux sens.",
    },
    en_cours: {
      titre: "Votre dossier est en cours d'examen",
      texte:
        "Vous pourrez proposer un voyage dès qu'il sera validé. Rien à faire de votre côté.",
    },
    a_corriger: {
      titre: "Votre dossier attend une correction",
      texte: "Un détail doit être repris avant que vous puissiez proposer un voyage.",
    },
    refuse: {
      titre: "Votre dossier n'a pas été validé",
      texte: "Reprenez votre vérification d'identité pour proposer un voyage.",
    },
    verifie: { titre: "", texte: "" },
  };
  const message = messages[stage];
  const agir = stage === "en_cours";

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-6 text-center">
      <h1 className="text-xl font-semibold">{message.titre}</h1>
      <p className="text-sm text-muted-foreground">{message.texte}</p>
      {!agir && (
        <Link
          href="/compte/identite"
          className="inline-block rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground"
        >
          {stage === "absent" ? "Vérifier mon identité" : "Reprendre ma vérification"}
        </Link>
      )}
    </div>
  );
}
