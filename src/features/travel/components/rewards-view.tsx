"use client";

import {
  ArrowRight,
  Award,
  Check,
  Gift,
  Hotel,
  PackageCheck,
  PlaneTakeoff,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import type { PointEntry, Rewards, Tier } from "../types/trip.types";

interface RewardsViewProps {
  rewards: Rewards;
}

/** Le programme de fidélité comme une envie de repartir, jamais comme une banque. */
export function RewardsView({ rewards }: RewardsViewProps) {
  const inDebt = rewards.balance < 0;
  const progress = Math.round(rewards.progress * 100);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="relative overflow-hidden rounded-[2rem] bg-inverse-surface text-inverse-foreground">
        <div className="pointer-events-none absolute -right-12 -top-24 size-80 rounded-full border-[4rem] border-primary/15" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Cercle Zoumani · {rewards.tier.name}
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
              Chaque voyage accompli vous emmène un peu plus loin.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-inverse-muted-foreground sm:text-base">
              Vous rendez service à une famille, vous êtes rémunéré pour vos kilos et
              votre régularité ouvre des nuits, des trajets et des attentions réservées
              aux voyageurs qui tiennent parole.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-inverse-muted-foreground">
                  Votre élan
                </p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-semibold tabular-nums text-primary sm:text-6xl">
                    {rewards.balance.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-sm font-bold">points</span>
                </p>
              </div>
              <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                <Award className="size-6" aria-hidden />
              </span>
            </div>

            {rewards.nextTier && rewards.pointsToNext !== null ? (
              <div className="mt-6">
                <div className="flex justify-between gap-4 text-xs">
                  <span>{rewards.tier.name}</span>
                  <span className="font-bold text-primary">{rewards.nextTier.name}</span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progression vers ${rewards.nextTier.name}`}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-inverse-muted-foreground">
                  Encore <strong className="text-inverse-foreground">{rewards.pointsToNext} points</strong>{" "}
                  avant d&apos;ouvrir le palier {rewards.nextTier.name}.
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-inverse-muted-foreground">
                Vous êtes au sommet du cercle. Merci pour chaque histoire menée à bon port.
              </p>
            )}
          </div>
        </div>
      </header>

      {inDebt && (
        <section className="rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm">
          <strong>Votre histoire peut repartir.</strong>{" "}
          <span className="text-muted-foreground">
            Un engagement non tenu a placé le solde sous zéro. Un prochain transport mené
            à terme vous remettra progressivement à flot.
          </span>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <NextReward rewards={rewards} />

        <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Vos gestes comptent
          </p>
          <h2 className="mt-2 text-2xl font-semibold">La confiance se construit en route</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <GainCard
              icon={PlaneTakeoff}
              points={rewards.earningRules.trip_verified}
              title="Voyage vérifié"
              copy="Votre billet confirme une route réelle."
            />
            <GainCard
              icon={Sparkles}
              points={rewards.earningRules.capacity_published}
              title="Place publiée"
              copy="Vos kilos deviennent visibles des familles."
            />
            <GainCard
              icon={PackageCheck}
              points={rewards.earningRules.delivery_completed}
              title="Colis arrivé"
              copy="Une promesse est tenue jusqu'au destinataire."
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Un voyage vérifié annulé alors que des expéditeurs peuvent compter dessus retire{" "}
            <strong>{Math.abs(rewards.earningRules.commitment_broken ?? 0)} points</strong>.
            Un brouillon abandonné n&apos;est jamais pénalisé.
          </p>
        </section>
      </div>

      <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Le chemin complet
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Du premier trajet à la Légende</h2>
          </div>
          <Link href="/trips/nouveau" className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-primary">
            Proposer un voyage <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ol className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rewards.allTiers.map((tier, index) => (
            <TierCard
              key={tier.code}
              tier={tier}
              index={index + 1}
              reached={rewards.balance >= tier.threshold}
              current={tier.code === rewards.tier.code}
            />
          ))}
        </ol>
      </section>

      <History history={rewards.history} />
    </main>
  );
}

function NextReward({ rewards }: { rewards: Rewards }) {
  const tier = rewards.nextTier ?? rewards.tier;
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-primary p-6 text-primary-foreground sm:p-8">
      <div className="pointer-events-none absolute -bottom-14 -right-10 size-44 rounded-full border-[2.5rem] border-primary-foreground/10" />
      <Gift className="size-8" aria-hidden />
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] opacity-75">
        {rewards.nextTier ? `À ouvrir en ${tier.name}` : "Vos privilèges actuels"}
      </p>
      <h2 className="mt-2 text-3xl font-semibold">Ce qui vous attend</h2>
      <ul className="relative mt-5 space-y-3">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-3 text-sm leading-relaxed">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
              <Check className="size-3" aria-hidden />
            </span>
            {perk}
          </li>
        ))}
      </ul>
      <div className="relative mt-7 flex items-center gap-3 border-t border-primary-foreground/15 pt-5 text-xs opacity-80">
        <Hotel className="size-4" aria-hidden />
        Des récompenses concrètes, activées avec nos partenaires.
      </div>
    </section>
  );
}

function GainCard({
  icon: Icon,
  points = 0,
  title,
  copy,
}: {
  icon: typeof PlaneTakeoff;
  points?: number;
  title: string;
  copy: string;
}) {
  return (
    <article className="rounded-2xl bg-muted/45 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-inverse-surface text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <strong className="text-lg text-primary tabular-nums">+{points}</strong>
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy}</p>
    </article>
  );
}

function TierCard({
  tier,
  index,
  reached,
  current,
}: {
  tier: Tier;
  index: number;
  reached: boolean;
  current: boolean;
}) {
  return (
    <li
      className={`relative rounded-2xl border p-4 ${
        current ? "border-primary bg-primary/5" : "border-border bg-background"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`grid size-9 place-items-center rounded-full text-sm font-bold ${
            reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {reached ? <Check className="size-4" aria-hidden /> : index}
        </span>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {tier.threshold.toLocaleString("fr-FR")} pts
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{tier.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {tier.perks[0]}
      </p>
      {current && <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-bold text-primary">Votre palier</span>}
    </li>
  );
}

const REASONS: Record<string, string> = {
  trip_verified: "Voyage vérifié",
  capacity_published: "Place proposée",
  delivery_completed: "Colis remis",
  commitment_broken: "Engagement non tenu",
  manual_adjustment: "Ajustement",
};

function History({ history }: { history: PointEntry[] }) {
  if (history.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center">
        <Trophy className="mx-auto size-7 text-primary" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">Votre première trace s&apos;écrira ici</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Vérifiez un voyage, proposez vos kilos et voyez chaque engagement récompensé.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Votre histoire</p>
      <h2 className="mt-2 text-2xl font-semibold">Les gestes déjà accomplis</h2>
      <ul className="mt-5 divide-y divide-border">
        {history.map((entry, index) => (
          <li key={`${entry.occurredAt}-${index}`} className="flex items-center justify-between gap-4 py-3.5">
            <span className="min-w-0">
              <span className="block text-sm font-medium">{REASONS[entry.reason] ?? entry.reason}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(entry.occurredAt))}
                {entry.note ? ` · ${entry.note}` : ""}
              </span>
            </span>
            <span className={`shrink-0 font-bold tabular-nums ${entry.amount >= 0 ? "text-primary" : "text-error"}`}>
              {entry.amount > 0 ? "+" : ""}{entry.amount}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
