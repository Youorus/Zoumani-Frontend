"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BellRing, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAvailabilityAlert } from "@/features/shipment-search/hooks/use-availability-alert";
import {
  availabilityAlertSchema,
  type AvailabilityAlertInput,
} from "@/features/shipment-search/schemas/availability-alert.schema";

interface AvailabilityAlertCardProps {
  origin: string;
  destination: string;
  categories: string[];
}

/** Une demande rapide, persistée, sans imposer la création d'un compte. */
export function AvailabilityAlertCard({
  origin,
  destination,
  categories,
}: AvailabilityAlertCardProps) {
  const alert = useAvailabilityAlert();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<AvailabilityAlertInput>({
    resolver: zodResolver(availabilityAlertSchema),
    defaultValues: { email: "", phone: "", consent: false },
  });

  if (alert.isSuccess) {
    return (
      <section
        className="flex min-h-full flex-col justify-center rounded-[1.75rem] border border-success/25 bg-success/10 p-6 sm:p-8"
        aria-live="polite"
      >
        <span className="grid size-12 place-items-center rounded-full bg-success text-white">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-success">
          Recherche gardée
        </p>
        <h2 className="mt-2 text-2xl font-semibold">On garde les yeux sur cette route.</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Dès qu&apos;une place vérifiée correspond à {origin} → {destination}, nous
          vous prévenons par e-mail et SMS. Cette alerte s&apos;arrêtera après le
          premier signal utile.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_24px_70px_-52px_rgb(43_29_23_/_0.75)] sm:p-8">
      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <BellRing className="size-5" aria-hidden />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
        Info rapide · sans compte
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Prévenez-moi dès qu&apos;une place apparaît</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Nous retenons uniquement ce trajet et vos coordonnées. Pas de faux résultat,
        pas de message inutile.
      </p>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={handleSubmit((values) =>
          alert.mutate({
            ...values,
            origin,
            destination,
            categories,
            language: "fr",
          }),
        )}
        noValidate
      >
        <Field label="Adresse e-mail" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>
        <Field label="Téléphone avec indicatif" error={errors.phone?.message}>
          <Input
            type="tel"
            autoComplete="tel"
            placeholder="+33 6 12 34 56 78"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <div className="sm:col-span-2">
          <div className="flex items-start gap-3 rounded-xl bg-muted/45 p-3">
            <Controller
              control={control}
              name="consent"
              render={({ field }) => (
                <Checkbox
                  id="availability-consent"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-invalid={Boolean(errors.consent)}
                />
              )}
            />
            <label htmlFor="availability-consent" className="text-xs leading-relaxed">
              J&apos;accepte que Zoumani utilise ces coordonnées uniquement pour
              m&apos;informer de ce trajet.
            </label>
          </div>
          {errors.consent && <p className="mt-1.5 text-xs text-error">{errors.consent.message}</p>}
        </div>

        {alert.isError && (
          <p className="sm:col-span-2 text-sm text-error" role="alert">
            {alert.error instanceof Error ? alert.error.message : "L’alerte n’a pas pu être créée."}
          </p>
        )}

        <button
          type="submit"
          disabled={alert.isPending}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50 sm:col-span-2"
        >
          {alert.isPending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <BellRing className="size-4" aria-hidden />
          )}
          {alert.isPending ? "Nous gardons votre trajet…" : "Garder ce trajet pour moi"}
        </button>
      </form>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <LockKeyhole className="size-3" aria-hidden /> Une notification utile, puis
        l&apos;alerte se ferme automatiquement.
      </p>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1.5 block text-xs font-normal text-error">{error}</span>}
    </label>
  );
}
