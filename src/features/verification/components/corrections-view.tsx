"use client";

import {
  AlertCircle,
  ArrowRight,
  Check,
  FileCheck2,
  LoaderCircle,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CountrySelect } from "@/features/auth/components/country-select";
import type { HomeLanguage } from "@/features/home/components/home-content";
import { AuthError } from "@/lib/auth/auth-client";

import {
  fetchDocuments,
  replaceDocument,
  respondToRequest,
  resubmitVerification,
  saveDraft,
  uploadDocument,
  type IdentityDraft,
} from "../api/verification-client";
import type { VerificationCopy } from "../content/verification-content";
import type {
  IdentityDocumentType,
  Verification,
  VerificationDocument,
  VerificationRequest,
} from "../types/verification.types";
import { FileField } from "./file-field";
import styles from "./verification-view.module.css";

const DOCUMENT_TYPES: IdentityDocumentType[] = [
  "passport",
  "national_id_card",
  "residence_permit",
];

function hasBackSide(type: IdentityDocumentType) {
  return type !== "passport";
}

function validationError(message: string) {
  return new AuthError(message, "identity_verification_incomplete", 422);
}

export function CorrectionsView({
  copy,
  requests,
  verification,
  language,
}: {
  copy: VerificationCopy;
  requests: VerificationRequest[];
  verification: Verification;
  language: HomeLanguage;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [frontFiles, setFrontFiles] = useState<Record<string, File | null>>({});
  const [backFiles, setBackFiles] = useState<Record<string, File | null>>({});
  const [documentTypes, setDocumentTypes] = useState<Record<string, IdentityDocumentType>>(
    {},
  );
  const [issuingCountries, setIssuingCountries] = useState<Record<string, string>>({});
  const [expiresOn, setExpiresOn] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [draft, setDraft] = useState<IdentityDraft>({
    legalFirstName: verification.legalFirstName,
    legalLastName: verification.legalLastName,
    dateOfBirth: verification.dateOfBirth,
    nationality: verification.nationality,
    countryOfResidence: verification.countryOfResidence,
    residentialAddress: verification.residentialAddress,
  });

  const pending = requests.filter((request) => !request.answered);

  useEffect(() => {
    let cancelled = false;
    void fetchDocuments()
      .then((items) => {
        if (!cancelled) setDocuments(items);
      })
      .catch(() => {
        if (!cancelled) setError(copy.errors.generic);
      });
    return () => {
      cancelled = true;
    };
  }, [copy.errors.generic]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      for (const request of pending) {
        const answer = answers[request.id]?.trim() ?? "";

        if (request.kind === "provide_information" && !answer) {
          throw validationError(copy.errors.missingAnswer);
        }

        if (request.kind === "correct_information") {
          await saveDraft(draft);
        }

        if (request.kind === "add_document") {
          const type = documentTypes[request.id] ?? "passport";
          const front = frontFiles[request.id];
          const back = backFiles[request.id];
          const issuer = issuingCountries[request.id] ?? "";
          const expiry = expiresOn[request.id] ?? "";
          if (!front) throw validationError(copy.errors.missingDocument);
          if (hasBackSide(type) && !back) throw validationError(copy.errors.missingBack);
          if (!issuer) throw validationError(copy.errors.missingIssuer);
          if (!expiry) throw validationError(copy.errors.missingExpiry);
          await uploadDocument({
            documentType: type,
            front,
            back,
            issuingCountry: issuer,
            expiresOn: expiry,
          });
        }

        if (request.kind === "replace_document" || request.kind === "retake_selfie") {
          const target = documents.find((document) => document.id === request.documentId);
          const front = frontFiles[request.id];
          if (!target || !front) throw validationError(copy.errors.missingDocument);

          if (target.documentType === "selfie") {
            await replaceDocument(target.id, { documentType: "selfie", front });
          } else {
            const issuer =
              issuingCountries[request.id] ?? target.issuingCountry ?? verification.nationality;
            const expiry = expiresOn[request.id] ?? target.expiresOn ?? "";
            const back = backFiles[request.id];
            if (hasBackSide(target.documentType) && !back) {
              throw validationError(copy.errors.missingBack);
            }
            if (!issuer) throw validationError(copy.errors.missingIssuer);
            if (!expiry) throw validationError(copy.errors.missingExpiry);
            await replaceDocument(target.id, {
              documentType: target.documentType,
              front,
              back,
              issuingCountry: issuer,
              expiresOn: expiry,
            });
          }
        }

        await respondToRequest(request.id, answer);
      }

      await resubmitVerification();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : copy.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={send} noValidate className="w-full">
      <header className="mb-5">
        <p className="text-xs font-black tracking-[0.12em] text-primary uppercase">
          {pending.length} {pending.length > 1 ? copy.corrections.items : copy.corrections.item}
        </p>
        <h2 className="mt-1 font-display text-2xl text-foreground sm:text-3xl">
          {copy.corrections.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.corrections.body}
        </p>
      </header>

      <div className="space-y-4">
        {pending.map((request, index) => {
          const target = documents.find((document) => document.id === request.documentId);
          const selectedType = documentTypes[request.id] ?? "passport";
          const type = target?.documentType === "selfie" ? null : target?.documentType;
          const needsDocument = [
            "replace_document",
            "retake_selfie",
            "add_document",
          ].includes(request.kind);

          return (
            <section key={request.id} className={styles.requestCard}>
              <div className="mb-4 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold text-primary">
                    {index + 1} / {pending.length}
                  </p>
                  <h3 className="text-base font-bold">
                    {copy.corrections.kinds[request.kind]}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {request.message}
                  </p>
                </div>
              </div>

              {request.kind === "correct_information" ? (
                <IdentityCorrection
                  copy={copy}
                  draft={draft}
                  language={language}
                  onChange={setDraft}
                />
              ) : null}

              {request.kind === "add_document" ? (
                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <Field label={copy.document.type}>
                    <Select
                      value={selectedType}
                      onValueChange={(value) =>
                        setDocumentTypes({
                          ...documentTypes,
                          [request.id]: value as IdentityDocumentType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <span>{copy.document.types[selectedType]}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {copy.document.types[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              ) : null}

              {needsDocument ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FileField
                      label={copy.corrections.newFile}
                      chooseLabel={copy.document.choose}
                      accept="image/*,application/pdf"
                      onChange={(file) =>
                        setFrontFiles({ ...frontFiles, [request.id]: file })
                      }
                    />
                    {(request.kind === "add_document" && hasBackSide(selectedType)) ||
                    (type && hasBackSide(type)) ? (
                      <FileField
                        label={copy.document.back}
                        chooseLabel={copy.document.choose}
                        onChange={(file) =>
                          setBackFiles({ ...backFiles, [request.id]: file })
                        }
                      />
                    ) : null}
                  </div>

                  {request.kind === "add_document" || type ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label={copy.document.issuingCountry}>
                        <CountrySelect
                          language={language}
                          value={
                            issuingCountries[request.id] ??
                            target?.issuingCountry ??
                            verification.nationality
                          }
                          onChange={(code) =>
                            setIssuingCountries({
                              ...issuingCountries,
                              [request.id]: code,
                            })
                          }
                          ariaLabel={copy.document.issuingCountry}
                          placeholder={copy.identity.countrySearch}
                          emptyText={copy.identity.countryEmpty}
                        />
                      </Field>
                      <Field label={copy.document.expiry}>
                        <DateField
                          ariaLabel={copy.document.expiry}
                          locale={language}
                          value={expiresOn[request.id] ?? target?.expiresOn ?? ""}
                          onChange={(value) =>
                            setExpiresOn({ ...expiresOn, [request.id]: value })
                          }
                          minYear={new Date().getFullYear()}
                          maxYear={new Date().getFullYear() + 20}
                        />
                      </Field>
                    </div>
                  ) : null}
                </>
              ) : null}

              {request.kind !== "correct_information" ? (
                <Field
                  label={copy.corrections.answer}
                  hint={
                    request.kind === "provide_information"
                      ? copy.corrections.answerRequired
                      : copy.corrections.answerOptional
                  }
                >
                  <Textarea
                    rows={2}
                    value={answers[request.id] ?? ""}
                    placeholder={copy.corrections.answerPlaceholder}
                    onChange={(event) =>
                      setAnswers({ ...answers, [request.id]: event.target.value })
                    }
                  />
                </Field>
              ) : null}
            </section>
          );
        })}
      </div>

      {error ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-error" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-black text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
      >
        {busy ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <Check className="size-5" aria-hidden="true" />
        )}
        {busy ? copy.submitting : copy.corrections.submit}
        {!busy ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
      </button>

      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <FileCheck2 className="size-4 text-primary" aria-hidden="true" />
        {copy.corrections.kept}
      </p>
    </form>
  );
}

function IdentityCorrection({
  copy,
  draft,
  language,
  onChange,
}: {
  copy: VerificationCopy;
  draft: IdentityDraft;
  language: HomeLanguage;
  onChange: (draft: IdentityDraft) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={copy.identity.firstName}>
        <Input
          value={draft.legalFirstName}
          onChange={(event) => onChange({ ...draft, legalFirstName: event.target.value })}
        />
      </Field>
      <Field label={copy.identity.lastName}>
        <Input
          value={draft.legalLastName}
          onChange={(event) => onChange({ ...draft, legalLastName: event.target.value })}
        />
      </Field>
      <Field label={copy.identity.birthDate}>
        <DateField
          ariaLabel={copy.identity.birthDate}
          locale={language}
          value={draft.dateOfBirth}
          onChange={(value) => onChange({ ...draft, dateOfBirth: value })}
          maxYear={new Date().getFullYear()}
        />
      </Field>
      <Field label={copy.identity.nationality}>
        <CountrySelect
          language={language}
          value={draft.nationality}
          onChange={(value) => onChange({ ...draft, nationality: value })}
          ariaLabel={copy.identity.nationality}
          placeholder={copy.identity.countrySearch}
          emptyText={copy.identity.countryEmpty}
        />
      </Field>
      <Field label={copy.identity.country}>
        <CountrySelect
          language={language}
          value={draft.countryOfResidence}
          onChange={(value) => onChange({ ...draft, countryOfResidence: value })}
          ariaLabel={copy.identity.country}
          placeholder={copy.identity.countrySearch}
          emptyText={copy.identity.countryEmpty}
        />
      </Field>
      <Field label={copy.identity.address}>
        <Input
          value={draft.residentialAddress}
          onChange={(event) =>
            onChange({ ...draft, residentialAddress: event.target.value })
          }
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {hint ? <span className="mb-1.5 block text-xs text-muted-foreground">{hint}</span> : null}
      {children}
    </label>
  );
}
