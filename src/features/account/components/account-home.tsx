"use client";

import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleDashed,
  Gift,
  Plane,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { useAccountCopy } from "@/features/account/components/account-copy-provider";
import { UserAvatar } from "@/features/account/components/user-avatar";
import type { AccountCopy } from "@/features/account/content/account-content";
import { accountLanguage } from "@/features/account/lib/account-language";
import { homeContent } from "@/features/home/components/home-content";
import { ShipmentSearch } from "@/features/home/components/shipment-search";
import { TripRoute } from "@/features/travel/components/trip-route";
import type { Rewards, Trip } from "@/features/travel/types/trip.types";
import type { VerificationStage } from "@/features/verification/types/verification.types";
import type { AuthenticatedUser } from "@/lib/auth/auth.types";

export function AccountHome({
  user,
  welcome,
  verificationStage,
  trips,
  rewards,
}: {
  user: AuthenticatedUser;
  welcome: boolean;
  verificationStage: VerificationStage;
  trips: Trip[];
  rewards: Rewards;
}) {
  const copy = useAccountCopy();
  const language = accountLanguage(user.preferredLanguage);
  const nextTrip = findNextTrip(trips);

  return (
    <div className="mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-[radial-gradient(circle_at_88%_12%,color-mix(in_srgb,var(--primary)_20%,transparent),transparent_32%),linear-gradient(135deg,var(--surface),var(--background))] p-5 sm:p-7">
        <div
          className="absolute -right-12 -bottom-20 size-56 rounded-full border-[34px] border-primary/8"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              imageUrl={user.profilePictureUrl}
              imageAlt={user.fullName}
              className="size-16 ring-4 ring-background sm:size-20"
              fallbackClassName="text-xl"
            />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                {copy.dashboard.eyebrow}
              </p>
              <h1 className="mt-1 font-display text-2xl leading-tight text-foreground sm:text-4xl">
                {welcome ? copy.welcome(user.firstName) : copy.greeting(user.firstName)}
              </h1>
              <Link
                href="/compte/profil"
                className="focus-ring mt-1.5 inline-flex rounded text-sm font-semibold text-muted-foreground hover:text-primary"
              >
                {copy.dashboard.profileCta}
              </Link>
            </div>
          </div>

          <Link
            href="/compte/points"
            className="focus-ring flex min-w-52 items-center gap-3 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 transition-transform hover:-translate-y-0.5"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-warning text-warning-foreground">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <span>
              <strong className="block text-xl leading-none text-foreground">
                {rewards.balance.toLocaleString(language)}
              </strong>
              <span className="text-xs font-semibold text-muted-foreground">
                {copy.dashboard.rewardsBalance}
              </span>
            </span>
          </Link>
        </div>
      </header>

      <section className="mt-7" aria-labelledby="account-status-title">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {copy.dashboard.statusTitle}
        </p>
        <h2 id="account-status-title" className="sr-only">
          {copy.dashboard.statusTitle}
        </h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <IdentityCard copy={copy} stage={verificationStage} />
          <TripCard copy={copy} trip={nextTrip} language={language} />
          <RewardCard copy={copy} rewards={rewards} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 font-display text-xl text-foreground sm:text-2xl">
          {copy.search.title}
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          {copy.search.description}
        </p>
        <ShipmentSearch
          className="px-0 sm:px-0 lg:px-0"
          copy={homeContent[language].search}
          language={language}
        />
      </section>

      <section className="panel-surface mt-6 flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Plane className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl text-foreground">
              {copy.actions.travel.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {copy.actions.travel.description}
            </p>
          </div>
        </div>
        <Link
          href="/trips/nouveau"
          className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
        >
          {copy.actions.travel.cta}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}

function IdentityCard({
  copy,
  stage,
}: {
  copy: AccountCopy;
  stage: VerificationStage;
}) {
  const content = copy.dashboard.identityStages[stage];
  const verified = stage === "verifie";
  const urgent = stage === "a_corriger" || stage === "refuse";
  const Icon = verified ? BadgeCheck : ShieldAlert;
  const href = verified ? "/compte/profil" : "/compte/identite";

  return (
    <article className="panel-surface flex min-h-64 flex-col justify-between p-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span
            className={`grid size-11 place-items-center rounded-xl ${
              verified
                ? "bg-success/12 text-success"
                : urgent
                  ? "bg-error/10 text-error"
                  : "bg-warning/12 text-warning"
            }`}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-muted-foreground">
            {copy.dashboard.identityTitle}
          </span>
        </div>
        <h3 className="mt-4 font-display text-xl leading-tight text-foreground">
          {content.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {content.description}
        </p>
      </div>
      <Link
        href={href}
        className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-primary"
      >
        {content.cta}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

function TripCard({
  copy,
  trip,
  language,
}: {
  copy: AccountCopy;
  trip: Trip | null;
  language: "fr" | "en";
}) {
  return (
    <article className="panel-surface flex min-h-64 flex-col justify-between p-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            {trip ? <CalendarDays className="size-5" /> : <CircleDashed className="size-5" />}
          </span>
          <span className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-muted-foreground">
            {copy.dashboard.tripTitle}
          </span>
        </div>
        {trip ? (
          <>
            <p className="mt-4 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {copy.dashboard.tripStatus[trip.status]}
            </p>
            <div className="mt-4">
              <TripRoute
                origin={{ code: trip.originAirportCode }}
                destination={{ code: trip.destinationAirportCode }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {formatDate(trip.departureAt, language)}
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-4 font-display text-xl text-foreground">
              {copy.dashboard.tripEmptyTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.dashboard.tripEmptyDescription}
            </p>
          </>
        )}
      </div>
      <Link
        href={trip ? "/compte/trajets" : "/trips/nouveau"}
        className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-primary"
      >
        {trip ? copy.dashboard.tripManageCta : copy.dashboard.tripCreateCta}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

function RewardCard({ copy, rewards }: { copy: AccountCopy; rewards: Rewards }) {
  const nextReward = rewards.rewardCatalog.find((reward) => !reward.unlocked);
  const featured = nextReward ?? rewards.rewardCatalog.at(-1);

  return (
    <article className="relative flex min-h-64 flex-col justify-between overflow-hidden rounded-[1.35rem] border border-warning/25 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--warning)_14%,var(--surface)),var(--surface)_72%)] p-5 shadow-soft">
      <Gift className="absolute -right-5 -bottom-7 size-32 rotate-[-10deg] text-warning/10" aria-hidden />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-warning text-warning-foreground">
            <Gift className="size-5" aria-hidden />
          </span>
          <span className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-muted-foreground">
            {copy.dashboard.rewardsTitle}
          </span>
        </div>
        <h3 className="mt-4 font-display text-xl leading-tight text-foreground">
          {featured?.title ?? copy.dashboard.rewardsTop}
        </h3>
        {featured ? (
          <>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {featured.description}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-warning/15">
              <span
                className="block h-full rounded-full bg-warning transition-[width] duration-700"
                style={{ width: `${Math.round(featured.progress * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              {nextReward
                ? copy.dashboard.rewardsRemaining(nextReward.pointsRemaining)
                : copy.dashboard.rewardsTop}
            </p>
          </>
        ) : null}
      </div>
      <Link
        href="/compte/points"
        className="focus-ring relative mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-primary"
      >
        {copy.dashboard.rewardsCta}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

function findNextTrip(trips: Trip[]): Trip | null {
  const active = trips
    .filter((trip) => trip.stage !== "clos")
    .toSorted((left, right) => left.departureAt.localeCompare(right.departureAt));
  return active.find((trip) => trip.status === "verified") ?? active[0] ?? null;
}

function formatDate(iso: string, language: "fr" | "en") {
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}
