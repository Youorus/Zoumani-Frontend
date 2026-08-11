"use client";

import {
  AlertCircle,
  BadgeCheck,
  Clock,
  LoaderCircle,
  Lock,
  ShieldAlert,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { CorrectionsView } from "./corrections-view";
import { FileField } from "./file-field";

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

  // Avant tout le reste : c'est le seul état où le dossier est bloqué
  // **des deux côtés**, et où quelques minutes de la personne le
  // débloquent. Le montrer après l'attente ou le refus le noierait.
  if (stage === "a_corriger" && requests.some((request) => !request.answered)) {
    return <CorrectionsView copy={copy} requests={requests} />;
  }

  if (stage === "verifie") {
    return (
      <Etat
        icon={<BadgeCheck className="size-6" aria-hidden="true" />}
        tone="text-success bg-success/10"
        title={copy.verified.title}
        body={copy.verified.body}
        action={{ href: "/compte" as Route, label: copy.verified.action }}
      />
    );
  }

  if (stage === "en_cours") {
    return (
      <Etat
        icon={<Clock className="size-6" aria-hidden="true" />}
        tone="text-warning bg-warning/10"
        title={copy.pending.title}
        body={copy.pending.body}
      >
        {verification ? <Recapitulatif copy={copy} verification={verification} /> : null}
      </Etat>
    );
  }

  return (
    <Formulaire copy={copy} verification={verification} refuse={stage === "refuse"} />
  );
}

function Formulaire({
  copy,
  verification,
  refuse,
}: {
  copy: (typeof verificationContent)["fr"];
  verification: Verification | null;
  refuse: boolean;
}) {
  const router = useRouter();
  const { busy, error, send } = useVerificationForm();

  // Prérempli avec ce qui a déjà été déclaré : après un refus, ressaisir
  // six champs pour n'en corriger qu'un décourage plus que le refus
  // lui-même.
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
    // Prérempli avec la nationalité : dans l'immense majorité des cas,
    // c'est le pays qui a délivré la pièce. Reste modifiable pour un
    // titre de séjour, où les deux diffèrent par définition.
    issuingCountry: verification?.nationality ?? "",
    expiresOn: "",
    selfie: null,
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const besoinDuVerso = files.documentType !== "passport";

  async function envoyer(event: React.FormEvent) {
    event.preventDefault();
    setLocalError(null);

    // Contrôlés ici parce que le navigateur ne sait pas exprimer « le
    // verso n'est requis que pour certaines pièces ».
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
      // `refresh` et non `push` : la page se recharge côté serveur avec
      // le nouvel état, et le badge de l'en-tête suit dans le même
      // mouvement. Sans cela, l'avatar afficherait encore l'ancien état.
      router.refresh();
    }
  }

  return (
    <form onSubmit={envoyer} noValidate className="mx-auto w-full max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">
          {refuse ? copy.rejected.title : copy.title}
        </h1>
        <p className="mt-2 leading-6 text-muted-foreground">
          {refuse ? copy.rejected.body : copy.intro}
        </p>
      </header>

      {refuse && verification?.rejectionReason ? (
        <p
          className="mb-6 flex items-start gap-3 rounded-xl bg-error/10 p-4 text-sm leading-6"
          role="alert"
        >
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-error" aria-hidden="true" />
          <span>
            <strong className="block">{copy.rejected.reasonLabel}</strong>
            {verification.rejectionReason}
          </span>
        </p>
      ) : null}

      <section className="panel-surface mb-6 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Lock className="size-4 text-primary" aria-hidden="true" />
          {copy.privacy.title}
        </h2>
        <ul className="space-y-1.5 text-sm leading-6 text-muted-foreground">
          {copy.privacy.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="panel-surface mb-6 p-5">
        <h2 className="mb-1 font-display text-xl">{copy.identity.title}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{copy.identity.hint}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label={copy.identity.firstName}>
            <Input
              autoComplete="given-name"
              value={draft.legalFirstName}
              onChange={(e) => setDraft({ ...draft, legalFirstName: e.target.value })}
              required
            />
          </Champ>
          <Champ label={copy.identity.lastName}>
            <Input
              autoComplete="family-name"
              value={draft.legalLastName}
              onChange={(e) => setDraft({ ...draft, legalLastName: e.target.value })}
              required
            />
          </Champ>
          <Champ label={copy.identity.birthDate}>
            <Input
              type="date"
              autoComplete="bday"
              value={draft.dateOfBirth}
              onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value })}
              required
            />
          </Champ>
          <Champ label={copy.identity.nationality}>
            <Input
              maxLength={2}
              placeholder="CM"
              value={draft.nationality}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  nationality: e.target.value.toUpperCase(),
                })
              }
              required
            />
          </Champ>
          <Champ label={copy.identity.country}>
            <Input
              maxLength={2}
              placeholder="FR"
              autoComplete="country"
              value={draft.countryOfResidence}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  countryOfResidence: e.target.value.toUpperCase(),
                })
              }
              required
            />
          </Champ>
        </div>

        <div className="mt-4">
          <Champ label={copy.identity.address} hint={copy.identity.addressHint}>
            <Textarea
              rows={2}
              autoComplete="street-address"
              placeholder={copy.identity.addressPlaceholder}
              value={draft.residentialAddress}
              onChange={(e) => setDraft({ ...draft, residentialAddress: e.target.value })}
              required
            />
          </Champ>
        </div>
      </section>

      <section className="panel-surface mb-6 p-5">
        <h2 className="mb-1 font-display text-xl">{copy.document.title}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{copy.document.hint}</p>

        <Champ label={copy.document.type}>
          <Select
            value={files.documentType}
            onValueChange={(value) =>
              setFiles({
                ...files,
                documentType: value as DocumentType,
                back: null,
              })
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

        <div className="mt-4">
          <FileField
            label={copy.document.front}
            chooseLabel={copy.document.choose}
            onChange={(file) => setFiles({ ...files, front: file })}
          />
          {besoinDuVerso ? (
            <FileField
              label={copy.document.back}
              hint={copy.document.backHint}
              chooseLabel={copy.document.choose}
              onChange={(file) => setFiles({ ...files, back: file })}
            />
          ) : null}
          <Champ label={copy.document.issuingCountry}>
            <Input
              maxLength={2}
              placeholder="CM"
              value={files.issuingCountry}
              onChange={(e) =>
                setFiles({
                  ...files,
                  issuingCountry: e.target.value.toUpperCase(),
                })
              }
              required
            />
          </Champ>
          <Champ label={copy.document.expiry}>
            <Input
              type="date"
              value={files.expiresOn}
              onChange={(e) => setFiles({ ...files, expiresOn: e.target.value })}
            />
          </Champ>
          <div className="mt-4">
            <FileField
              label={copy.document.selfie}
              hint={copy.document.selfieHint}
              chooseLabel={copy.document.choose}
              accept="image/*"
              onChange={(file) => setFiles({ ...files, selfie: file })}
            />
          </div>
        </div>
      </section>

      {(localError ?? error) ? (
        <p className="mb-4 flex items-center gap-2 text-sm text-error" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {localError ?? error?.message ?? copy.errors.generic}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
      >
        {busy ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : null}
        {busy ? copy.submitting : refuse ? copy.rejected.action : copy.submit}
      </button>
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
    <div className="mx-auto w-full max-w-2xl">
      <div className="panel-surface p-6 sm:p-8">
        <span className={`grid size-12 place-items-center rounded-xl ${tone}`}>
          {icon}
        </span>
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
    <section className="panel-surface mt-4 p-5">
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
