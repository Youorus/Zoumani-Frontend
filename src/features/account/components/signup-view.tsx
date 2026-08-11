"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  MapPinned,
  PackageCheck,
  Plane,
} from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { HomeLanguage } from "@/features/home/components/home-content";
import { formatSearchCity } from "@/features/shipment-search/data/search-cities";
import type { TripSearchFilters } from "@/features/shipment-search/schemas/trip-search.schema";

import { signupContent } from "../content/signup-content";
import { useCreateAccount } from "../hooks/use-create-account";
import {
  createAccountSchema,
  type CreateAccountInput,
} from "../schemas/create-account.schema";
import type { AccountRole } from "../types/account-role";
import styles from "./signup-view.module.css";

const roleIcons = {
  sender: PackageCheck,
  traveler: Plane,
} as const;

export function SignupView({
  initialRole,
  language,
  searchContext,
}: {
  initialRole: AccountRole;
  language: HomeLanguage;
  searchContext?: TripSearchFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isRolePending, startRoleTransition] = useTransition();
  const account = useCreateAccount();
  const copy = signupContent[language];
  const roleCopy = copy.roles[role];
  const RoleIcon = roleIcons[role];
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      role: initialRole,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      terms: false,
    },
  });

  function selectRole(nextRole: AccountRole) {
    if (nextRole === role) return;

    account.reset();
    setValue("role", nextRole);
    startRoleTransition(() => {
      setRole(nextRole);
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("role", nextRole);
      router.replace(`${pathname}?${nextParams.toString()}` as Route, { scroll: false });
    });
  }

  return (
    <div className={styles.shell} data-signup-role={role}>
      <div className={styles.roleSwitch} aria-label={copy.rolePrompt}>
        {(["sender", "traveler"] as const).map((item) => {
          const Icon = roleIcons[item];
          return (
            <button
              key={item}
              className="focus-ring"
              type="button"
              data-active={role === item}
              aria-pressed={role === item}
              disabled={isRolePending}
              onClick={() => selectRole(item)}
            >
              <Icon size={15} aria-hidden="true" /> {copy.roles[item].tab}
            </button>
          );
        })}
      </div>

      <div className={styles.layout}>
        <section className={styles.story} data-role={role}>
          <div className={styles.storyContent}>
            <p className={styles.eyebrow}>{roleCopy.eyebrow}</p>
            <h1>{roleCopy.title}</h1>
            <p className={styles.description}>{roleCopy.description}</p>
            <p className={styles.storyQuote}>“{roleCopy.story}”</p>
          </div>
          <ul className={styles.benefits}>
            {roleCopy.benefits.map((benefit) => (
              <li key={benefit}>
                <CheckCircle2 size={15} aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.formPanel}>
          {account.isSuccess ? (
            <div className={styles.success} aria-live="polite">
              <span className={styles.successIcon} aria-hidden="true">
                <Check size={27} />
              </span>
              <h2>{roleCopy.successTitle}</h2>
              <p>{roleCopy.successDescription}</p>
            </div>
          ) : (
            <>
              <RoleIcon size={25} color="var(--primary)" aria-hidden="true" />
              <h2>{copy.roles[role].tab}</h2>
              <p className={styles.formIntro}>{roleCopy.description}</p>

              {searchContext ? (
                <div className={styles.routeContext}>
                  <MapPinned size={20} aria-hidden="true" />
                  <span>
                    <small>{copy.routeLabel}</small>
                    <strong>
                      {formatSearchCity(searchContext.from)} → {formatSearchCity(searchContext.to)} · {searchContext.weight} kg
                    </strong>
                  </span>
                </div>
              ) : null}

              <form className={styles.form} onSubmit={handleSubmit((values) => account.mutate(values))} noValidate>
                <div className={styles.field}>
                  <label htmlFor="signup-first-name">{copy.fields.firstName}</label>
                  <Input
                    id="signup-first-name"
                    autoComplete="given-name"
                    aria-invalid={Boolean(errors.firstName)}
                    {...register("firstName")}
                  />
                  {errors.firstName ? <p className={styles.error}>{errors.firstName.message}</p> : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="signup-last-name">{copy.fields.lastName}</label>
                  <Input
                    id="signup-last-name"
                    autoComplete="family-name"
                    aria-invalid={Boolean(errors.lastName)}
                    {...register("lastName")}
                  />
                  {errors.lastName ? <p className={styles.error}>{errors.lastName.message}</p> : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="signup-email">{copy.fields.email}</label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    aria-invalid={Boolean(errors.email)}
                    {...register("email")}
                  />
                  {errors.email ? <p className={styles.error}>{errors.email.message}</p> : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="signup-phone">{copy.fields.phone}</label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+33 6 00 00 00 00"
                    aria-invalid={Boolean(errors.phone)}
                    {...register("phone")}
                  />
                  {errors.phone ? <p className={styles.error}>{errors.phone.message}</p> : null}
                </div>
                <div className={`${styles.field} ${styles.fullField}`}>
                  <label htmlFor="signup-password">{copy.fields.password}</label>
                  <div className={styles.passwordWrap}>
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                      {...register("password")}
                    />
                    <button
                      className={`${styles.passwordToggle} focus-ring`}
                      type="button"
                      aria-label={showPassword ? copy.fields.hidePassword : copy.fields.showPassword}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <p className={errors.password ? styles.error : styles.hint}>
                    {errors.password?.message ?? copy.fields.passwordHint}
                  </p>
                </div>
                <div className={styles.terms}>
                  <Controller
                    control={control}
                    name="terms"
                    render={({ field }) => (
                      <Checkbox
                        id="signup-terms"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        aria-invalid={Boolean(errors.terms)}
                      />
                    )}
                  />
                  <div>
                    <label htmlFor="signup-terms">{copy.fields.terms}</label>
                    {errors.terms ? <p className={styles.error}>{errors.terms.message}</p> : null}
                  </div>
                </div>
                <button className={`${styles.submit} focus-ring`} type="submit" disabled={account.isPending}>
                  {account.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <LockKeyhole size={16} />}
                  {account.isPending ? copy.submitting : roleCopy.submit}
                  {!account.isPending ? <ArrowRight size={15} aria-hidden="true" /> : null}
                </button>
              </form>
              <p className={styles.secureNote}>
                <LockKeyhole size={12} aria-hidden="true" /> {copy.secureNote}
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
