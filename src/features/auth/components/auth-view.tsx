"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { HomeLanguage } from "@/features/home/components/home-content";

import { authContent } from "../content/auth-content";
import { useAuthFlow } from "../hooks/use-auth-flow";
import {
  codeSchema,
  emailSchema,
  registrationSchema,
  type CodeInput,
  type EmailInput,
  type RegistrationInput,
} from "../schemas/auth.schema";
import { registrationFieldError, type ServerFieldError } from "../lib/server-field-error";
import { AuthSteps } from "./auth-steps";
import { ConsentCheckbox } from "./consent-checkbox";
import { PhoneField } from "./phone-field";
import styles from "./auth-view.module.css";

/**
 * Le parcours d'accès, en un composant.
 *
 * ═══ Une porte, pas deux ═══
 *
 * Il n'y a ni page « connexion » ni page « inscription » : la personne
 * saisit son adresse, et le serveur sait. Lui demander d'abord « avez-vous
 * un compte ? » la fait hésiter au premier écran — celui qu'on ne peut pas
 * se permettre de rater — et l'oblige à se souvenir d'une chose de plus.
 *
 * ═══ Un geste par écran ═══
 *
 * Chaque étape ne demande qu'une chose. C'est ce qui rend acceptable un
 * parcours en quatre temps : personne ne remplit un formulaire de dix
 * champs, tout le monde recopie un code à six chiffres.
 */
export function AuthView({
  language,
  redirectTo,
}: {
  language: HomeLanguage;
  /** Où reprendre après la connexion — la destination voulue au départ. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const content = authContent[language];
  const flow = useAuthFlow();

  const destination = destinationFor(redirectTo, flow.isRegistering);

  // Une erreur qui désigne un champ s'affiche **sous ce champ**, jamais
  // en bandeau : dupliquer le message aux deux endroits ferait chercher
  // deux problèmes là où il n'y en a qu'un.
  const fieldError = registrationFieldError(flow.error);

  /*
   * On n'attend pas un clic pour entrer.
   *
   * Toutes les plateformes sérieuses redirigent d'elles-mêmes : rester
   * sur un écran « c'est bon » avec un bouton fait douter — la personne
   * se demande si quelque chose a échoué. L'écran de succès reste
   * affiché le temps que la navigation se fasse, et sert de repli.
   *
   * `replace` et non `push` : la page de connexion n'a rien à faire dans
   * l'historique. Un retour arrière depuis l'espace y ramènerait
   * quelqu'un de déjà connecté, sur un formulaire sans objet.
   */
  useEffect(() => {
    if (flow.screen === "done") {
      router.replace(destination);
    }
  }, [flow.screen, router, destination]);

  return (
    <div className={styles.shell}>
      {flow.screen !== "done" ? (
        <AuthSteps
          screen={flow.screen}
          labels={content.steps}
          registering={flow.isRegistering}
        />
      ) : null}

      <section className={flow.screen === "done" ? styles.success : styles.panel}>
        {flow.error && !fieldError ? (
          <p className={styles.error} role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{messageFor(flow.error.reason, flow.error.message, content)}</span>
          </p>
        ) : null}

        {flow.screen === "email" ? (
          <EmailStep content={content} busy={flow.busy} onSubmit={flow.submitEmail} />
        ) : null}

        {flow.screen === "email-code" ? (
          <CodeStep
            title={content.emailCode.title}
            description={content.emailCode.description(flow.step?.sentTo ?? "")}
            label={content.emailCode.field}
            submitLabel={content.emailCode.submit}
            secondaryLabel={content.emailCode.changeEmail}
            busy={flow.busy}
            onSubmit={flow.submitEmailCode}
            onSecondary={flow.restart}
          />
        ) : null}

        {flow.screen === "registration" ? (
          <RegistrationStep
            content={content}
            language={language}
            busy={flow.busy}
            serverError={fieldError}
            onSubmit={flow.submitRegistration}
          />
        ) : null}

        {flow.screen === "phone-code" ? (
          <CodeStep
            title={content.phoneCode.title}
            description={content.phoneCode.description(flow.step?.sentTo ?? "")}
            label={content.phoneCode.field}
            submitLabel={content.phoneCode.submit}
            secondaryLabel={content.phoneCode.back}
            busy={flow.busy}
            onSubmit={flow.submitPhoneCode}
            onSecondary={flow.restart}
          />
        ) : null}

        {flow.screen === "done" ? (
          <>
            <CheckCircle2 size={44} className={styles.successIcon} aria-hidden="true" />
            <h1 className={styles.title}>
              {flow.isRegistering ? content.done.titleNew : content.done.titleReturning}
            </h1>
            <p className={styles.description}>{content.done.description}</p>
            {/* Le bouton reste, et il sert : si la redirection automatique
                échoue — navigation bloquée, retour arrière — la personne
                n'est pas coincée sur un écran sans issue. */}
            <button
              type="button"
              className={styles.submit}
              onClick={() => router.replace(destination)}
            >
              {content.done.action}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </>
        ) : null}
      </section>
    </div>
  );
}

function EmailStep({
  content,
  busy,
  onSubmit,
}: {
  content: (typeof authContent)["fr"];
  busy: boolean;
  onSubmit: (email: string) => Promise<void>;
}) {
  const form = useForm<EmailInput>({ resolver: zodResolver(emailSchema) });

  return (
    <form onSubmit={form.handleSubmit(({ email }) => onSubmit(email))} noValidate>
      <p className={styles.eyebrow}>{content.email.eyebrow}</p>
      <h1 className={styles.title}>{content.email.title}</h1>
      <p className={styles.description}>{content.email.description}</p>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>{content.email.field}</span>
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder={content.email.placeholder}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <span className={styles.fieldError}>{form.formState.errors.email.message}</span>
        ) : null}
      </label>

      <SubmitButton busy={busy} label={content.email.submit} />

      {/* L'explication est ici et nulle part ailleurs : c'est le seul
          écran où l'on ignore encore ce qui va se passer. La répéter aux
          étapes suivantes reviendrait à expliquer ce que la personne est
          déjà en train de faire. */}
      <p className={styles.explanation}>{content.steps.explanation}</p>
      <p className={styles.reassurance}>{content.email.reassurance}</p>
    </form>
  );
}

function CodeStep({
  title,
  description,
  label,
  submitLabel,
  secondaryLabel,
  busy,
  onSubmit,
  onSecondary,
}: {
  title: string;
  description: string;
  label: string;
  submitLabel: string;
  secondaryLabel: string;
  busy: boolean;
  onSubmit: (code: string) => Promise<void>;
  onSecondary: () => void;
}) {
  const form = useForm<CodeInput>({ resolver: zodResolver(codeSchema) });

  return (
    <form onSubmit={form.handleSubmit(({ code }) => onSubmit(code))} noValidate>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>{label}</span>
        <Input
          // `one-time-code` fait proposer le code par le système dès sa
          // réception : sur mobile, c'est la différence entre une frappe et
          // un aller-retour vers l'application de messagerie.
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          className={styles.codeInput}
          {...form.register("code")}
        />
        {form.formState.errors.code ? (
          <span className={styles.fieldError}>{form.formState.errors.code.message}</span>
        ) : null}
      </label>

      <SubmitButton busy={busy} label={submitLabel} />

      <div className={styles.secondaryActions}>
        <button type="button" className={styles.linkButton} onClick={onSecondary}>
          {secondaryLabel}
        </button>
      </div>
    </form>
  );
}

function RegistrationStep({
  content,
  language,
  busy,
  serverError,
  onSubmit,
}: {
  content: (typeof authContent)["fr"];
  language: HomeLanguage;
  busy: boolean;
  /** Refus du serveur portant sur un champ précis de ce formulaire. */
  serverError: ServerFieldError | null;
  onSubmit: (input: RegistrationInput) => Promise<void>;
}) {
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    // Volontairement vide : le pays est deviné à partir de la langue du
    // navigateur une fois le référentiel chargé. Un défaut posé ici
    // écraserait cette devinette, ou lui survivrait à tort.
    defaultValues: { phoneCountryCode: "" },
  });
  // `useWatch` plutôt que `form.watch` : le second rend une fonction,
  // que le compilateur React ne peut pas mémoriser — il renonce alors à
  // optimiser tout le composant, et le prévient par un avertissement.
  const countryCode = useWatch({ control: form.control, name: "phoneCountryCode" });

  /*
   * Le refus du serveur rejoint les erreurs du formulaire.
   *
   * `setError` et non un affichage à part : le message se place là où
   * l'utilisateur regarde déjà, et disparaît à la correction suivante
   * comme n'importe quelle autre erreur de saisie. Deux mécanismes
   * d'affichage donneraient deux comportements — l'un qui s'efface,
   * l'autre qui reste.
   */
  const { setError } = form;
  useEffect(() => {
    if (serverError) {
      setError(serverError.field, { type: "server", message: serverError.message });
    }
  }, [serverError, setError]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <p className={styles.eyebrow}>{content.registration.eyebrow}</p>
      <h1 className={styles.title}>{content.registration.title}</h1>
      <p className={styles.description}>{content.registration.description}</p>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{content.registration.firstName}</span>
          <Input autoComplete="given-name" autoFocus {...form.register("firstName")} />
          {form.formState.errors.firstName ? (
            <span className={styles.fieldError}>
              {form.formState.errors.firstName.message}
            </span>
          ) : null}
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{content.registration.lastName}</span>
          <Input autoComplete="family-name" {...form.register("lastName")} />
          {form.formState.errors.lastName ? (
            <span className={styles.fieldError}>
              {form.formState.errors.lastName.message}
            </span>
          ) : null}
        </label>
      </div>

      <PhoneField
        language={language}
        label={content.registration.phone}
        help={content.registration.phoneHelp}
        searchLabel={content.registration.country}
        searchPlaceholder={content.registration.countrySearch}
        emptyText={content.registration.countryEmpty}
        countryCode={countryCode}
        onCountryChange={(code) =>
          form.setValue("phoneCountryCode", code, { shouldValidate: true })
        }
        register={form.register("phoneNationalNumber")}
        error={
          form.formState.errors.phoneCountryCode?.message ??
          form.formState.errors.phoneNationalNumber?.message
        }
      />

      <ConsentCheckbox
        control={form.control}
        name="acceptsTerms"
        label={content.registration.terms}
      />
      <ConsentCheckbox
        control={form.control}
        name="acceptsPrivacyPolicy"
        label={content.registration.privacy}
      />
      {(form.formState.errors.acceptsTerms ??
      form.formState.errors.acceptsPrivacyPolicy) ? (
        <span className={styles.fieldError}>
          {form.formState.errors.acceptsTerms?.message ??
            form.formState.errors.acceptsPrivacyPolicy?.message}
        </span>
      ) : null}

      <SubmitButton busy={busy} label={content.registration.submit} />
    </form>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button type="submit" className={styles.submit} disabled={busy}>
      {busy ? (
        <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
      ) : null}
      {label}
    </button>
  );
}

/**
 * Message à afficher pour une erreur du serveur.
 *
 * Le texte vient du serveur par défaut : le recomposer ici le ferait
 * diverger au premier ajustement de ton. On ne surcharge que les cas où
 * l'interface a une **action** à proposer que le serveur ignore.
 */
function messageFor(
  reason: string | undefined,
  serverMessage: string,
  content: (typeof authContent)["fr"],
): string {
  if (reason === "auth_login_challenge_expired") {
    return content.errors.expired;
  }
  if (reason === "user_account_suspended" || reason === "user_account_blocked") {
    return `${serverMessage} ${content.errors.support}`;
  }
  return serverMessage || content.errors.generic;
}

/** Où atterrir par défaut : l'espace personnel, jamais l'accueil public. */
const HOME_AFTER_LOGIN = "/compte";

/**
 * Où envoyer la personne, une fois la session ouverte.
 *
 * La destination voulue au départ l'emporte : quelqu'un qui cliquait sur
 * un voyage doit retrouver ce voyage, pas un tableau de bord. À défaut,
 * son espace — et non l'accueil public, qui donnerait l'impression de
 * n'être allé nulle part.
 */
function destinationFor(redirectTo: string | undefined, isNew: boolean): Route {
  const target = safeDestination(redirectTo);
  if (target !== "/") {
    return target;
  }
  // L'espace ignore que le compte vient d'être créé — le serveur ne le
  // dit pas, et n'a pas à le dire. C'est le client qui sait s'il est
  // passé par l'écran d'inscription ; il le transmet.
  return (isNew ? `${HOME_AFTER_LOGIN}?bienvenue=1` : HOME_AFTER_LOGIN) as Route;
}

/**
 * Filtre la destination de retour.
 *
 * Une destination venue de l'URL est contrôlée par qui a fabriqué le lien.
 * N'accepter qu'un chemin relatif empêche de transformer la page de
 * connexion en tremplin vers un site tiers — une redirection ouverte est
 * un classique de l'hameçonnage.
 */
function safeDestination(destination: string | undefined): Route {
  if (!destination || !destination.startsWith("/") || destination.startsWith("//")) {
    return "/" as Route;
  }
  // Le typage des routes de Next raisonne sur les chemins connus à la
  // compilation ; une destination venue de l'URL n'en fait pas partie.
  // L'assertion est sûre : la fonction vient de vérifier que c'est un
  // chemin relatif du site.
  return destination as Route;
}
