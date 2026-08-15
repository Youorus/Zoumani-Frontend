"use client";

import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  EyeOff,
  LoaderCircle,
  Lock,
  ScanFace,
  ShieldAlert,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { HomeLanguage } from "@/features/home/components/home-content";

import { verificationContent } from "../content/verification-content";
import {
  useVerificationForm,
  type DocumentType,
  type VerificationFiles,
} from "../hooks/use-verification-form";
import type { Verification, VerificationRequest } from "../types/verification.types";
import { CountrySelect } from "@/features/auth/components/country-select";

import { CorrectionsView } from "./corrections-view";
import { FileField } from "./file-field";
import styles from "./verification-view.module.css";

/**
 * Le parcours de vérification, en un écran qui change avec l'état.
 *
 * ═══ Quatre écrans, pas un formulaire avec des conditions ═══
 *
 * Selon l'état, la personne vient faire quatre choses différentes :
 * remplir, patienter, constater, corriger. Un seul formulaire qui se
 * grise ou se masque par endroits les mélangerait — et le cas « refusé »,
 * qui est le plus délicat, hériterait du ton du cas « première fois ».
 *
 * ═══ Pourquoi la note de confidentialité est en haut ═══
 *
 * On demande une pièce d'identité. La question « qui va voir ça ? » se
 * pose avant la première frappe, pas après. La reléguer en bas de page en
 * mentions légales revient à ne pas y répondre.
 */
export function VerificationView({
  verification,
  requests,
  language,
}: {
  verification: Verification | null;
  /** Ce qu'un opérateur attend de la personne, s'il attend quelque chose. */
  requests: VerificationRequest[];
  language: HomeLanguage;
}) {
  const copy = verificationContent[language];
  const stage = verification?.stage ?? "absent";
  let content: React.ReactNode;

  // Avant tout le reste : c'est le seul état où le dossier est bloqué
  // **des deux côtés**, et où quelques minutes de la personne le
  // débloquent. Le montrer après l'attente ou le refus le noierait.
  if (
    stage === "a_corriger" &&
    verification &&
    requests.some((request) => !request.answered)
  ) {
    content = (
      <CorrectionsView
        copy={copy}
        requests={requests}
        verification={verification}
        language={language}
      />
    );
  } else if (stage === "verifie") {
    content = (
      <Etat
        icon={<BadgeCheck className="size-6" aria-hidden="true" />}
        tone="text-success bg-success/10"
        title={copy.verified.title}
        body={copy.verified.body}
        action={{ href: "/compte" as Route, label: copy.verified.action }}
      />
    );
  } else if (stage === "en_cours") {
    content = (
      <Etat
        icon={<Clock className="size-6" aria-hidden="true" />}
        tone="text-warning bg-warning/10"
        title={copy.pending.title}
        body={copy.pending.body}
      >
        {verification ? <Recapitulatif copy={copy} verification={verification} /> : null}
      </Etat>
    );
  } else {
    content = (
      <Formulaire
        copy={copy}
        verification={verification}
        refuse={stage === "refuse"}
        language={language}
      />
    );
  }

  return (
    <div className={styles.scene}>
      <aside className={styles.story}>
        <div className={styles.storyContent}>
          <p className={styles.eyebrow}>{copy.experience.eyebrow}</p>
          <h1 className={styles.storyTitle}>{copy.experience.title}</h1>
          <p className={styles.storyText}>{copy.experience.body}</p>
        </div>
        <ul className={styles.trustList}>
          <li>
            <EyeOff size={17} aria-hidden="true" />
            {copy.experience.promises[0]}
          </li>
          <li>
            <ScanFace size={17} aria-hidden="true" />
            {copy.experience.promises[1]}
          </li>
          <li>
            <CheckCircle2 size={17} aria-hidden="true" />
            {copy.experience.promises[2]}
          </li>
        </ul>
      </aside>
      <div className={styles.workspace}>{content}</div>
    </div>
  );
}

function Formulaire({
  copy,
  verification,
  refuse,
  language,
}: {
  copy: (typeof verificationContent)["fr"];
  verification: Verification | null;
  refuse: boolean;
  language: HomeLanguage;
}) {
  const router = useRouter();
  const { busy, error, send } = useVerificationForm();

  /*
   * Deux temps, un écran chacun.
   *
   * Tout demander d'un coup produisait une page de deux mètres : six
   * champs, trois fichiers, une note de confidentialité. Sur un
   * téléphone, on ne voit jamais le bouton d'envoi, on ne sait pas
   * combien il reste, et l'on referme.
   *
   * Le découpage suit la logique de la personne, pas celle du serveur :
   * « qui je suis », puis « ce que je montre ». Deux questions qu'on se
   * pose l'une après l'autre, et chacune tient sans défilement.
   */
  const [temps, setTemps] = useState<1 | 2>(1);

  const [draft, setDraft] = useState({
    legalFirstName: verification?.legalFirstName ?? "",
    legalLastName: verification?.legalLastName ?? "",
    dateOfBirth: verification?.dateOfBirth ?? "",
    nationality: verification?.nationality ?? "",
    countryOfResidence: verification?.countryOfResidence ?? "",
    residentialAddress: verification?.residentialAddress ?? "",
  });
  const [files, setFiles] = useState<VerificationFiles>({
    documentType: "passport",
    front: null,
    back: null,
    issuingCountry: verification?.nationality ?? "",
    expiresOn: "",
    selfie: null,
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const besoinDuVerso = files.documentType !== "passport";
  const identiteComplete =
    draft.legalFirstName.trim() !== "" &&
    draft.legalLastName.trim() !== "" &&
    draft.dateOfBirth !== "" &&
    draft.nationality.length === 2 &&
    draft.countryOfResidence.length === 2 &&
    draft.residentialAddress.trim() !== "";

  async function envoyer(event: React.FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (!files.front) {
      setLocalError(copy.errors.missingDocument);
      return;
    }
    if (besoinDuVerso && !files.back) {
      setLocalError(copy.errors.missingBack);
      return;
    }
    if (files.issuingCountry.length !== 2) {
      setLocalError(copy.errors.missingIssuer);
      return;
    }
    if (!files.selfie) {
      setLocalError(copy.errors.missingSelfie);
      return;
    }

    if (await send(draft, files)) {
      router.refresh();
    }
  }

  return (
    <form onSubmit={envoyer} noValidate className="w-full">
      <header className="mb-3 sm:mb-4">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          {temps} {copy.steps.of} 2 ·{" "}
          {temps === 1 ? copy.steps.identity : copy.steps.document}
        </p>
        <h1 className="mt-0.5 font-display text-lg text-foreground sm:text-2xl">
          {refuse ? copy.rejected.title : copy.title}
        </h1>
        {refuse && verification?.rejectionReason ? (
          <p
            className="mt-3 flex items-start gap-2 rounded-xl bg-error/10 p-3 text-sm leading-5"
            role="alert"
          >
            <ShieldAlert
              className="mt-0.5 size-4 shrink-0 text-error"
              aria-hidden="true"
            />
            <span>
              <strong>{copy.rejected.reasonLabel} : </strong>
              {verification.rejectionReason}
            </span>
          </p>
        ) : (
          // L'indication disparaît sous 400 px : sur un écran de 667 px
          // de haut, deux lignes de conseil coûtent le bouton d'envoi.
          <p className="mt-1 hidden text-sm text-muted-foreground min-[400px]:block">
            {temps === 1 ? copy.identity.hint : copy.document.hint}
          </p>
        )}
      </header>

      <div className={styles.stepRail} aria-hidden="true">
        <span className={styles.step} data-active="true" />
        <span className={styles.step} data-active={temps === 2} />
      </div>

      {temps === 1 ? (
        <section className={`${styles.formPanel} space-y-2.5`}>
          <div className="grid grid-cols-2 gap-3">
            <Champ label={copy.identity.firstName}>
              <Input
                autoComplete="given-name"
                value={draft.legalFirstName}
                onChange={(e) => setDraft({ ...draft, legalFirstName: e.target.value })}
              />
            </Champ>
            <Champ label={copy.identity.lastName}>
              <Input
                autoComplete="family-name"
                value={draft.legalLastName}
                onChange={(e) => setDraft({ ...draft, legalLastName: e.target.value })}
              />
            </Champ>
          </div>

          <Champ label={copy.identity.birthDate}>
            <DateField
              ariaLabel={copy.identity.birthDate}
              locale={language}
              value={draft.dateOfBirth}
              onChange={(iso) => setDraft({ ...draft, dateOfBirth: iso })}
              maxYear={new Date().getFullYear()}
            />
          </Champ>

          <div className="grid grid-cols-2 gap-3">
            <Champ label={copy.identity.nationality}>
              <CountrySelect
                language={language}
                value={draft.nationality}
                onChange={(code) => setDraft({ ...draft, nationality: code })}
                ariaLabel={copy.identity.nationality}
                placeholder={copy.identity.countrySearch}
                emptyText={copy.identity.countryEmpty}
              />
            </Champ>
            <Champ label={copy.identity.country}>
              <CountrySelect
                language={language}
                value={draft.countryOfResidence}
                onChange={(code) => setDraft({ ...draft, countryOfResidence: code })}
                ariaLabel={copy.identity.country}
                placeholder={copy.identity.countrySearch}
                emptyText={copy.identity.countryEmpty}
              />
            </Champ>
          </div>

          <Champ label={copy.identity.address} hint={copy.identity.addressHint}>
            <Textarea
              rows={2}
              autoComplete="street-address"
              placeholder={copy.identity.addressPlaceholder}
              value={draft.residentialAddress}
              onChange={(e) => setDraft({ ...draft, residentialAddress: e.target.value })}
            />
          </Champ>

          <button
            type="button"
            disabled={!identiteComplete}
            onClick={() => setTemps(2)}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft disabled:opacity-50"
          >
            {copy.steps.next}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </section>
      ) : (
        <section className={`${styles.formPanel} space-y-2.5`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Champ label={copy.document.type}>
              <Select
                value={files.documentType}
                onValueChange={(value) =>
                  setFiles({ ...files, documentType: value as DocumentType, back: null })
                }
              >
                <SelectTrigger aria-label={copy.document.type}>
                  <span>{copy.document.types[files.documentType]}</span>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(copy.document.types) as DocumentType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {copy.document.types[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Champ>
            <Champ label={copy.document.issuingCountry}>
              <CountrySelect
                language={language}
                value={files.issuingCountry}
                onChange={(code) => setFiles({ ...files, issuingCountry: code })}
                ariaLabel={copy.document.issuingCountry}
                placeholder={copy.identity.countrySearch}
                emptyText={copy.identity.countryEmpty}
              />
            </Champ>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FileField
              label={copy.document.front}
              chooseLabel={copy.document.choose}
              onChange={(file) => setFiles({ ...files, front: file })}
            />
            {besoinDuVerso ? (
              <FileField
                label={copy.document.back}
                chooseLabel={copy.document.choose}
                onChange={(file) => setFiles({ ...files, back: file })}
              />
            ) : (
              <Champ label={copy.document.expiry}>
                <DateField
                  ariaLabel={copy.document.expiry}
                  locale={language}
                  value={files.expiresOn}
                  onChange={(iso) => setFiles({ ...files, expiresOn: iso })}
                  minYear={new Date().getFullYear()}
                  maxYear={new Date().getFullYear() + 20}
                />
              </Champ>
            )}
          </div>

          {besoinDuVerso ? (
            <Champ label={copy.document.expiry}>
              <DateField
                ariaLabel={copy.document.expiry}
                locale={language}
                value={files.expiresOn}
                onChange={(iso) => setFiles({ ...files, expiresOn: iso })}
                minYear={new Date().getFullYear()}
                maxYear={new Date().getFullYear() + 20}
              />
            </Champ>
          ) : null}

          <FileField
            label={copy.document.selfie}
            hint={copy.document.selfieHint}
            chooseLabel={copy.document.choose}
            accept="image/*"
            onChange={(file) => setFiles({ ...files, selfie: file })}
          />

          <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            {copy.privacy.points[0]}
          </p>

          {(localError ?? error) ? (
            <p className="flex items-center gap-2 text-sm text-error" role="alert">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {localError ?? error?.message ?? copy.errors.generic}
            </p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTemps(1)}
              className="focus-ring rounded-xl border border-border px-5 py-3 text-sm font-semibold"
            >
              {copy.steps.back}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              ) : null}
              {busy ? copy.submitting : refuse ? copy.rejected.action : copy.submit}
            </button>
          </div>
        </section>
      )}
    </form>
  );
}

function Champ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {hint ? <span className="mb-1.5 block text-xs opacity-70">{hint}</span> : null}
      {children}
    </label>
  );
}

/** Un état sans formulaire : on constate, et on repart. */
function Etat({
  icon,
  tone,
  title,
  body,
  action,
  children,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  body: string;
  action?: { href: Route; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <div className={styles.stateCard}>
        <span className={`${styles.stateIcon} ${tone}`}>{icon}</span>
        <h1 className="mt-4 font-display text-2xl text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-xl leading-6 text-muted-foreground">{body}</p>
        {action ? (
          <Link
            href={action.href}
            className="focus-ring mt-5 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/**
 * Ce qui a été transmis, pendant l'attente.
 *
 * Sans ce rappel, on se demande si l'envoi a bien pris — et l'on
 * recommence, ou l'on écrit au support. Le montrer coûte trois lignes et
 * supprime les deux.
 */
function Recapitulatif({
  copy,
  verification,
}: {
  copy: (typeof verificationContent)["fr"];
  verification: Verification;
}) {
  const lignes = [
    [copy.identity.firstName, verification.legalFirstName],
    [copy.identity.lastName, verification.legalLastName],
    [copy.identity.birthDate, verification.dateOfBirth],
    [copy.identity.nationality, verification.nationality],
    [copy.identity.country, verification.countryOfResidence],
    [copy.identity.address, verification.residentialAddress],
  ].filter(([, valeur]) => valeur);

  return (
    <section className={`${styles.requestCard} mt-4`}>
      <h2 className="mb-3 text-sm font-bold">{copy.pending.recap}</h2>
      <dl className="space-y-2 text-sm">
        {lignes.map(([label, valeur]) => (
          <div key={label} className="flex gap-3">
            <dt className="w-40 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="m-0 min-w-0 font-medium break-words">{valeur}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
