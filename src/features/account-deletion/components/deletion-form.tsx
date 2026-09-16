"use client";

import { useId, useState } from "react";

import {
  confirmDeletion,
  DeletionApiError,
  DeletionUnavailable,
  requestDeletion,
  type DeletionOutcome,
  type DeletionRequested,
} from "../api/account-deletion-api";
import { canRequest, codeLooksValid, normalizeCode, type Step } from "../model/deletion";
import styles from "./deletion-form.module.css";

/**
 * ═══ Le seul îlot client de la page ═══
 *
 * Tout ce qui explique — conséquences, données, délais — est rendu par
 * le serveur dans `page.tsx`. Ici, uniquement l'état d'un formulaire en
 * deux temps : l'adresse, puis le code reçu.
 *
 * ═══ Ce que le formulaire ne dit jamais ═══
 *
 * Si l'adresse a un compte. Le serveur répond la même chose pour toute
 * adresse ; l'écran aussi. Ce qui diffère arrive dans la boîte, que
 * seul son titulaire lit.
 */
export function DeletionForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState<DeletionRequested | null>(null);
  const [outcome, setOutcome] = useState<DeletionOutcome | null>(null);

  const emailId = useId();
  const confirmId = useId();
  const codeId = useId();

  function message(cause: unknown): string {
    if (cause instanceof DeletionUnavailable || cause instanceof DeletionApiError) {
      return cause.message;
    }
    return "La demande n’a pas abouti. Vérifiez votre connexion et réessayez.";
  }

  async function envoyerAdresse(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!canRequest(email, confirmed) || sending) return;
    setSending(true);
    setError(null);
    try {
      setRequested(await requestDeletion(email));
      setStep("code");
      setTried(false);
    } catch (cause) {
      setError(message(cause));
    } finally {
      setSending(false);
    }
  }

  async function envoyerCode(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!requested || !codeLooksValid(code) || sending) return;
    setSending(true);
    setError(null);
    try {
      setOutcome(await confirmDeletion(requested.requestId, normalizeCode(code)));
      setStep("done");
    } catch (cause) {
      setError(message(cause));
    } finally {
      setSending(false);
    }
  }

  function recommencer() {
    setStep("email");
    setCode("");
    setRequested(null);
    setError(null);
    setTried(false);
  }

  if (step === "done" && outcome) {
    return (
      <section className={styles.done} aria-live="polite">
        {outcome.status === "erased" ? (
          <>
            <h2 className={styles.doneTitle}>Votre compte est supprimé</h2>
            <p className={styles.doneText}>
              C’est fait, et c’est définitif. Un dernier message vous le confirme à{" "}
              <strong>{requested?.sentTo}</strong>. Vous n’avez rien d’autre à faire.
            </p>
          </>
        ) : (
          <>
            <h2 className={styles.doneTitle}>Votre demande est enregistrée</h2>
            <p className={styles.doneText}>
              Votre adresse est confirmée, mais la suppression ne peut pas être exécutée
              tout de suite :
            </p>
            <ul className={styles.reasons}>
              {outcome.blockingReasons.map((raison) => (
                <li key={raison}>{raison}</li>
              ))}
            </ul>
            <p className={styles.doneText}>
              Un engagement en cours concerne aussi une autre personne ; nous ne l’abandonnons
              pas au milieu. Dès qu’il est clos, l’équipe termine la suppression et vous en
              informe à <strong>{requested?.sentTo}</strong> — au plus tard dans le mois. Un
              accusé de réception vient de vous être envoyé. Une question :{" "}
              <a className={styles.link} href="mailto:contact@zoumani.fr">
                contact@zoumani.fr
              </a>
              .
            </p>
          </>
        )}
      </section>
    );
  }

  if (step === "code" && requested) {
    const codeError = tried && !codeLooksValid(code) ? "Saisissez le code à six chiffres." : null;
    return (
      <form className={styles.form} onSubmit={envoyerCode} noValidate>
        <p className={styles.intro} aria-live="polite">
          Si un compte est rattaché à cette adresse, un code vient de partir vers{" "}
          <strong>{requested.sentTo}</strong>. Il est valable{" "}
          {Math.round(requested.expiresIn / 60)} minutes. Rien reçu ? Regardez vos indésirables ;
          si aucun compte n’existe, le courriel vous le dit aussi.
        </p>
        <div className={styles.field}>
          <label htmlFor={codeId} className={styles.label}>
            Code reçu par e-mail
          </label>
          <input
            id={codeId}
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoCorrect="off"
            spellCheck={false}
            maxLength={12}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-invalid={codeError ? true : undefined}
            aria-describedby={codeError ? `${codeId}-e` : undefined}
            className={`${styles.input} ${styles.codeInput} ${codeError ? styles.inputError : ""}`}
          />
          {codeError ? (
            <p id={`${codeId}-e`} role="alert" className={styles.error}>
              {codeError}
            </p>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className={styles.serverError}>
            {error}
          </p>
        ) : null}
        <div className={styles.actions}>
          <button type="button" className={styles.back} onClick={recommencer} disabled={sending}>
            Changer d’adresse
          </button>
          <button type="submit" className={styles.danger} disabled={sending}>
            {sending ? "Suppression…" : "Confirmer la suppression définitive"}
          </button>
        </div>
      </form>
    );
  }

  const emailError =
    tried && !canRequest(email, true) ? "Saisissez l’adresse e-mail de votre compte." : null;
  const confirmError =
    tried && !confirmed ? "Cette confirmation est nécessaire pour continuer." : null;

  return (
    <form className={styles.form} onSubmit={envoyerAdresse} noValidate>
      <div className={styles.field}>
        <label htmlFor={emailId} className={styles.label}>
          Adresse e-mail du compte
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? `${emailId}-e` : `${emailId}-h`}
          className={`${styles.input} ${emailError ? styles.inputError : ""}`}
        />
        {emailError ? (
          <p id={`${emailId}-e`} role="alert" className={styles.error}>
            {emailError}
          </p>
        ) : (
          <p id={`${emailId}-h`} className={styles.hint}>
            Compte ouvert avec Apple et « Masquer mon adresse » ? Saisissez l’adresse relais
            en <code>@privaterelay.appleid.com</code> — voir plus bas.
          </p>
        )}
      </div>

      <label className={styles.consent} htmlFor={confirmId}>
        <input
          id={confirmId}
          name="confirm"
          type="checkbox"
          className={styles.checkbox}
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          aria-invalid={confirmError ? true : undefined}
        />
        <span>
          Je comprends que la suppression est <strong>définitive</strong> : mon compte, mes
          informations, ma photo et mes pièces d’identité seront effacés et ne pourront pas
          être restaurés.
        </span>
      </label>
      {confirmError ? (
        <p role="alert" className={styles.error}>
          {confirmError}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className={styles.serverError}>
          {error}
        </p>
      ) : null}

      <button type="submit" className={styles.danger} disabled={sending}>
        {sending ? "Envoi du code…" : "Demander la suppression de mon compte"}
      </button>
      <p className={styles.hint}>
        Vous recevrez un code par e-mail pour confirmer que vous êtes bien le titulaire. Aucun
        mot de passe, aucune pièce d’identité, aucune information bancaire ne vous sera demandée.
      </p>
    </form>
  );
}
