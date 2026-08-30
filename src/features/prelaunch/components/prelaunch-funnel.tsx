"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { captureAttribution, readAttribution } from "@/lib/marketing/attribution";
import { EVENTS, track } from "@/lib/marketing/events";
import {
  PrelaunchUnavailable,
  registerLead,
  type Intention,
  type RegisteredLead,
} from "../api/prelaunch-api";
import {
  STEPS,
  canSubmit,
  clearDraft,
  contactIsUsable,
  readDraft,
  routeIsComplete,
  toLeadDraft,
  writeDraft,
  type FunnelState,
  type Step,
} from "../model/funnel";
import styles from "./prelaunch-funnel.module.css";

const TIMINGS = [
  { value: "asap", label: "Dès que possible" },
  { value: "weeks", label: "Dans les prochaines semaines" },
  { value: "months", label: "Dans quelques mois" },
  { value: "on_date", label: "À une date précise" },
] as const;

const PARCEL_KINDS = [
  { value: "documents", label: "Documents" },
  { value: "clothing", label: "Vêtements" },
  { value: "electronics", label: "Électronique" },
  { value: "gift", label: "Cadeau, effets personnels" },
  { value: "other", label: "Autre" },
] as const;

const PARCEL_WEIGHTS = [
  { value: "lt2", label: "Moins de 2 kg" },
  { value: "2_5", label: "2 à 5 kg" },
  { value: "5_10", label: "5 à 10 kg" },
  { value: "gt10", label: "Plus de 10 kg" },
  { value: "unknown", label: "Je ne sais pas encore" },
] as const;

const LUGGAGE_WEIGHTS = [
  { value: "1_3", label: "1 à 3 kg" },
  { value: "4_5", label: "4 à 5 kg" },
  { value: "6_10", label: "6 à 10 kg" },
  { value: "gt10", label: "Plus de 10 kg" },
  { value: "unknown", label: "Je ne sais pas encore" },
] as const;

const COPY: Record<Intention, Record<"route" | "timing" | "details" | "cta", string>> = {
  sender: {
    route: "Où votre colis doit-il aller ?",
    timing: "Quand souhaitez-vous l’envoyer ?",
    details: "Que contient votre colis ?",
    cta: "Me prévenir quand un voyageur part",
  },
  traveler: {
    route: "Quel trajet allez-vous faire ?",
    timing: "Quand partez-vous ?",
    details: "Combien de kilos pouvez-vous partager ?",
    cta: "Ajouter mon voyage à la liste",
  },
};

export function PrelaunchFunnel({ initialIntent }: { initialIntent: Intention | null }) {
  /**
   * Le brouillon est lu **à l'initialisation**, pas dans un effet.
   *
   * Un `setState` en effet déclenche un rendu en cascade — le linter le
   * refuse, à raison. Et l'hydratation ne s'en trouve pas décalée : ce
   * composant vit derrière une frontière de suspense imposée par
   * `useSearchParams`, donc le HTML statique contient la réserve, jamais
   * ce tunnel.
   *
   * L'URL prime sur le brouillon : une campagne qui vise les voyageurs
   * doit les amener côté voyageur, même s'ils avaient commencé ailleurs.
   */
  const [state, setState] = useState<FunnelState>(() => {
    const draft = readDraft();
    return { ...draft, intention: initialIntent ?? draft.intention };
  });
  const [step, setStep] = useState<Step>("route");
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<RegisteredLead | null>(null);
  /** Les erreurs n'apparaissent qu'après une tentative : souligner en
   *  rouge un champ qu'on n'a pas encore rempli met en faute avant
   *  d'avoir agi. */
  const [tried, setTried] = useState(false);

  // Ne touche aucun état React : la campagne est retenue dans le
  // stockage de session, et la mesure part vers l'extérieur. C'est
  // exactement ce à quoi un effet sert.
  useEffect(() => {
    captureAttribution();
    track(EVENTS.prelaunchViewed, { intent_role: initialIntent ?? "none" });
  }, [initialIntent]);

  const update = useCallback((patch: Partial<FunnelState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      writeDraft(next);
      return next;
    });
  }, []);

  const context = useMemo(
    () => ({
      intent_role: state.intention ?? "none",
      origin: state.originCity.trim(),
      destination: state.destinationCity.trim(),
    }),
    [state.intention, state.originCity, state.destinationCity],
  );

  if (done) return <Success lead={done} />;

  if (!state.intention) {
    return (
      <IntentChoice
        onPick={(role) => {
          update({ intention: role });
          track(EVENTS.prelaunchIntentSelected, { intent_role: role });
        }}
      />
    );
  }

  const copy = COPY[state.intention];
  const rank = STEPS.indexOf(step);

  function forward() {
    setTried(true);
    if (step === "route") {
      if (!routeIsComplete(state)) return;
      track(EVENTS.prelaunchRouteCompleted, context);
      setTried(false);
      setStep("timing");
    } else if (step === "timing") {
      track(EVENTS.prelaunchTimingCompleted, { ...context, timing: state.timing });
      setTried(false);
      setStep("details");
    } else if (step === "details") {
      track(EVENTS.prelaunchDetailsCompleted, context);
      setTried(false);
      setStep("contact");
    }
  }

  function backward() {
    setTried(false);
    setServerError(null);
    if (rank > 0) setStep(STEPS[rank - 1]);
  }

  async function submit() {
    setTried(true);
    if (!canSubmit(state) || sending) return;
    setSending(true);
    setServerError(null);
    track(EVENTS.prelaunchLeadSubmitted, context);
    try {
      const lead = await registerLead(toLeadDraft(state), readAttribution());
      track(EVENTS.prelaunchLeadSuccess, { ...context, already_known: lead.alreadyKnown });
      clearDraft();
      setDone(lead);
    } catch (cause) {
      const message =
        cause instanceof PrelaunchUnavailable || cause instanceof Error
          ? cause.message
          : "L’inscription n’a pas abouti. Réessayez dans un instant.";
      track(EVENTS.prelaunchLeadError, { ...context, message });
      setServerError(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div
        className={styles.progress}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={rank + 1}
        aria-label={`Étape ${rank + 1} sur ${STEPS.length}`}
      >
        {STEPS.map((s, i) => (
          <span key={s} className={`${styles.tick} ${i <= rank ? styles.tickDone : ""}`} />
        ))}
      </div>

      <h2 className={styles.title}>
        {step === "route"
          ? copy.route
          : step === "timing"
            ? copy.timing
            : step === "details"
              ? copy.details
              : "Où vous prévenir ?"}
      </h2>

      <div className={styles.fields}>
        {step === "route" && (
          <>
            <Field
              label="Ville de départ"
              value={state.originCity}
              onChange={(v) => update({ originCity: v })}
              placeholder="Paris"
              autoComplete="address-level2"
              error={tried && state.originCity.trim().length < 2 ? "Indiquez une ville." : null}
            />
            <Field
              label="Destination"
              value={state.destinationCity}
              onChange={(v) => update({ destinationCity: v })}
              placeholder="Douala"
              autoComplete="address-level2"
              error={
                tried && state.destinationCity.trim().length < 2 ? "Indiquez une ville." : null
              }
            />
          </>
        )}

        {step === "timing" && (
          <>
            <Chips
              legend="Période"
              options={TIMINGS}
              value={state.timing}
              onChange={(v) => update({ timing: (v || "asap") as FunnelState["timing"] })}
            />
            {state.timing === "on_date" && (
              <Field
                label="Date"
                type="date"
                value={state.travelOn}
                onChange={(v) => update({ travelOn: v })}
                hint="Vous pourrez la changer plus tard."
              />
            )}
          </>
        )}

        {step === "details" && state.intention === "sender" && (
          <>
            <Chips
              legend="Contenu"
              options={PARCEL_KINDS}
              value={state.parcelKind}
              onChange={(v) => update({ parcelKind: v })}
            />
            <Chips
              legend="Poids approximatif"
              options={PARCEL_WEIGHTS}
              value={state.weightBracket}
              onChange={(v) => update({ weightBracket: v })}
            />
            <p className={styles.hint}>Facultatif — passez si vous ne savez pas encore.</p>
          </>
        )}

        {step === "details" && state.intention === "traveler" && (
          <>
            <Chips
              legend="Kilos disponibles"
              options={LUGGAGE_WEIGHTS}
              value={state.weightBracket}
              onChange={(v) => update({ weightBracket: v })}
            />
            <p className={styles.hint}>
              Facultatif, et modifiable plus tard — personne ne connaît son bagage à l’avance.
            </p>
          </>
        )}

        {step === "contact" && (
          <>
            <Field
              label="Prénom"
              value={state.firstName}
              onChange={(v) => update({ firstName: v })}
              autoComplete="given-name"
              placeholder="Marc"
              error={tried && !state.firstName.trim() ? "Indiquez votre prénom." : null}
            />
            <Field
              label="E-mail"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={state.email}
              onChange={(v) => update({ email: v })}
              placeholder="vous@exemple.com"
            />
            <Field
              label="Ou téléphone / WhatsApp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={state.phone}
              onChange={(v) => update({ phone: v })}
              placeholder="+33 6 12 34 56 78"
              hint="L’un des deux suffit."
              error={
                tried && !contactIsUsable(state)
                  ? "Laissez un e-mail ou un numéro pour être prévenu."
                  : null
              }
            />

            <label className={styles.consent}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={state.consent}
                onChange={(e) => update({ consent: e.target.checked })}
              />
              <span>
                J’accepte de recevoir les informations liées au lancement de Zoumani.{" "}
                <Link href="/confidentialite" className={styles.link}>
                  Politique de confidentialité
                </Link>
                .
              </span>
            </label>
            {tried && !state.consent && (
              <p role="alert" className={styles.error}>
                Cochez la case pour être prévenu du lancement.
              </p>
            )}

            {serverError && (
              <p role="alert" className={styles.serverError}>
                {serverError}
              </p>
            )}
          </>
        )}
      </div>

      <div className={styles.actions}>
        {rank > 0 && (
          <button type="button" className={styles.back} onClick={backward}>
            Retour
          </button>
        )}
        <button
          type="button"
          className={styles.next}
          disabled={sending}
          onClick={step === "contact" ? () => void submit() : forward}
        >
          {step === "contact" ? (sending ? "Enregistrement…" : copy.cta) : "Continuer"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  hint?: string;
  type?: string;
  inputMode?: "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
      />
      {error ? (
        <p id={`${id}-e`} role="alert" className={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-h`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** De vrais boutons dans un `radiogroup` : un `div` cliquable ne
 *  s'atteindrait pas au clavier, et rien n'annoncerait ce qui est retenu. */
function Chips({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className={styles.chips}>
      <legend className={styles.legend}>{legend}</legend>
      {options.map((option) => {
        const on = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(on ? "" : option.value)}
            className={`${styles.chip} ${on ? styles.chipOn : ""}`}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}

function IntentChoice({ onPick }: { onPick: (role: Intention) => void }) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Que voulez-vous faire ?</h2>
      <button type="button" className={styles.choice} onClick={() => onPick("sender")}>
        <span className={styles.choiceTitle}>J’ai un colis à envoyer</span>
        <span className={styles.choiceHint}>
          Trouvez quelqu’un qui fait déjà le trajet.
        </span>
      </button>
      <button type="button" className={styles.choice} onClick={() => onPick("traveler")}>
        <span className={styles.choiceTitle}>Je pars bientôt en voyage</span>
        <span className={styles.choiceHint}>
          Rentabilisez les kilos libres de votre valise.
        </span>
      </button>
    </div>
  );
}

/**
 * La confirmation répète **ce qui a été enregistré**.
 *
 * Un « merci » interchangeable ne prouve rien. Le trajet redit permet de
 * vérifier d'un coup d'œil qu'on ne s'est pas trompé de champ, et donne
 * le sentiment d'avoir été entendu.
 */
function Success({ lead }: { lead: RegisteredLead }) {
  const traveler = lead.intention === "traveler";
  return (
    <div className={`${styles.wrap} ${styles.done}`}>
      <span aria-hidden className={styles.badge}>
        {traveler ? "✈️" : "🎉"}
      </span>
      <h2 className={styles.title}>
        {lead.alreadyKnown
          ? "Vous êtes déjà sur la liste"
          : traveler
            ? "Votre voyage est enregistré"
            : "Votre demande est enregistrée"}
      </h2>
      <p className={styles.hint}>
        {traveler
          ? "Nous vous préviendrons dès que Zoumani ouvrira les propositions de voyage sur ce trajet."
          : "Nous vous préviendrons dès que des voyageurs feront ce trajet."}
      </p>
      <p className={styles.corridor}>
        <span>{lead.originCity}</span>
        <span aria-hidden className={styles.arrow}>
          →
        </span>
        <span>{lead.destinationCity}</span>
      </p>
      <Link href="/" className={styles.back} style={{ display: "inline-grid", placeItems: "center" }}>
        Revenir à l’accueil
      </Link>
    </div>
  );
}
