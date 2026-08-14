"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BedDouble,
  CarFront,
  Check,
  Coins,
  Gift,
  Hotel,
  LockKeyhole,
  MapPinned,
  PackageCheck,
  Plane,
  PlaneTakeoff,
  Trophy,
} from "lucide-react";

import type {
  PointEntry,
  RewardCatalogItem,
  Rewards,
  Tier,
} from "../types/trip.types";

interface RewardsViewProps {
  rewards: Rewards;
}

/** Le programme de fidélité comme une envie de repartir, jamais comme une banque. */
export function RewardsView({ rewards }: RewardsViewProps) {
  const inDebt = rewards.balance < 0;
  const nextReward =
    rewards.rewardCatalog.find((reward) => !reward.unlocked) ??
    rewards.rewardCatalog.at(-1) ??
    null;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <RewardsHero rewards={rewards} nextReward={nextReward} />

      {inDebt && (
        <section className="rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm">
          <strong>Votre histoire peut repartir.</strong>{" "}
          <span className="text-muted-foreground">
            Un engagement non tenu a placé le solde sous zéro. Les prochains transports
            menés à terme vous remettront progressivement à flot.
          </span>
        </section>
      )}

      <RewardCatalog rewards={rewards.rewardCatalog} />

      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <StatusCard rewards={rewards} />
        <EarningRules rewards={rewards} />
      </div>

      <TierJourney rewards={rewards} />
      <History history={rewards.history} />
    </main>
  );
}

export function RewardsUnavailable() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <section className="rounded-[1.75rem] border border-warning/25 bg-warning/8 px-6 py-10 text-center sm:px-10">
        <Coins className="mx-auto size-8 text-warning" aria-hidden />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-warning">
          Programme Zoumani
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Votre progression revient dans un instant.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Votre espace et vos voyages restent accessibles. Nous ne montrons aucun faux
          solde pendant que le programme de récompenses est momentanément indisponible.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="focus-ring mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          Actualiser ma progression
        </button>
      </section>
    </main>
  );
}

function RewardsHero({
  rewards,
  nextReward,
}: {
  rewards: Rewards;
  nextReward: RewardCatalogItem | null;
}) {
  const progress = nextReward ? Math.round(nextReward.progress * 100) : 100;

  return (
    <header className="relative overflow-hidden rounded-[2rem] bg-inverse-surface text-inverse-foreground">
      <div className="pointer-events-none absolute -right-12 -top-24 size-80 rounded-full border-[4rem] border-primary/15" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Cercle Zoumani · {rewards.tier.name}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
            Vos voyages utiles ouvrent de vrais horizons.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-inverse-muted-foreground sm:text-base">
            Vous êtes rémunéré pour vos kilos. En plus, chaque engagement réellement tenu
            rapproche d&apos;une nuit, d&apos;une voiture et, au sommet, d&apos;un billet offert.
          </p>
          <a
            href="#recompenses"
            className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
          >
            Explorer mes récompenses
            <ArrowRight className="size-4" aria-hidden />
          </a>
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

          {nextReward && !nextReward.unlocked ? (
            <div className="mt-6">
              <div className="flex justify-between gap-4 text-xs">
                <span>Prochaine récompense</span>
                <span className="font-bold text-primary">{nextReward.title}</span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progression vers ${nextReward.title}`}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-inverse-muted-foreground">
                Encore{" "}
                <strong className="text-inverse-foreground">
                  {nextReward.pointsRemaining.toLocaleString("fr-FR")} points
                </strong>{" "}
                pour {nextReward.title.toLocaleLowerCase("fr-FR")}.
              </p>
            </div>
          ) : rewards.rewardCatalog.length > 0 ? (
            <p className="mt-5 text-sm text-inverse-muted-foreground">
              Toutes les récompenses sont ouvertes. Vous avez atteint le sommet Zoumani.
            </p>
          ) : (
            <p className="mt-5 text-sm text-inverse-muted-foreground">
              Vos points sont bien enregistrés. Le détail des avantages apparaîtra dès
              que la mise à jour du programme sera disponible.
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

function RewardCatalog({ rewards }: { rewards: RewardCatalogItem[] }) {
  if (rewards.length === 0) {
    return (
      <section
        id="recompenses"
        className="scroll-mt-24 rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center"
      >
        <Gift className="mx-auto size-7 text-primary" aria-hidden />
        <h2 className="mt-4 text-2xl font-semibold">Vos avantages se préparent</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Le backend conserve votre solde actuel. Le catalogue détaillé sera affiché dès
          que sa nouvelle version sera en ligne, sans inventer de récompense localement.
        </p>
      </section>
    );
  }

  return (
    <section
      id="recompenses"
      className="scroll-mt-24 rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Les récompenses du voyage
          </p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Une raison concrète de continuer
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Chaque seuil, chaque plafond et chaque condition viennent du programme Zoumani.
            Rien n&apos;est inventé dans cet écran.
          </p>
        </div>
        <Link
          href="/trips/nouveau"
          className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-primary"
        >
          Proposer un voyage <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ol className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rewards.map((reward, index) => (
          <RewardCard
            key={reward.code}
            reward={reward}
            featured={index === rewards.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}

const REWARD_ICONS = {
  transfer: MapPinned,
  hotel: Hotel,
  car: CarFront,
  stay: BedDouble,
  flight: Plane,
} as const;

function RewardCard({
  reward,
  featured,
}: {
  reward: RewardCatalogItem;
  featured: boolean;
}) {
  const Icon = REWARD_ICONS[reward.icon as keyof typeof REWARD_ICONS] ?? Gift;
  const percent = Math.round(reward.progress * 100);

  return (
    <li
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        featured
          ? "border-primary bg-inverse-surface text-inverse-foreground md:col-span-2 xl:col-span-4"
          : reward.unlocked
            ? "border-success/30 bg-success/5"
            : "border-border bg-background"
      }`}
    >
      {featured && (
        <span
          className="pointer-events-none absolute -right-12 -top-16 size-52 rounded-full border-[2.5rem] border-primary/15"
          aria-hidden
        />
      )}
      <div className={featured ? "relative grid gap-6 sm:grid-cols-[auto_1fr_auto] sm:items-center" : ""}>
        <span
          className={`grid size-11 place-items-center rounded-xl ${
            featured
              ? "bg-primary text-primary-foreground"
              : "bg-inverse-surface text-primary"
          }`}
        >
          <Icon className="size-5" aria-hidden />
        </span>

        <div className={featured ? "" : "mt-5"}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold">{reward.title}</h3>
            {reward.unlocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[0.68rem] font-bold text-success">
                <Check className="size-3" aria-hidden /> Débloquée
              </span>
            )}
          </div>
          <p
            className={`mt-2 text-sm leading-relaxed ${
              featured ? "text-inverse-muted-foreground" : "text-muted-foreground"
            }`}
          >
            {reward.description}
          </p>
          <p className="mt-3 text-xs font-medium text-primary">{reward.valueLabel}</p>
        </div>

        <div className={featured ? "min-w-56" : "mt-5"}>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className={featured ? "text-inverse-muted-foreground" : "text-muted-foreground"}>
              {reward.unlocked ? "Seuil atteint" : `${reward.pointsRemaining.toLocaleString("fr-FR")} pts restants`}
            </span>
            <strong>{reward.pointsRequired.toLocaleString("fr-FR")} pts</strong>
          </div>
          <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${featured ? "bg-white/10" : "bg-muted"}`}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <p
            className={`mt-3 flex items-start gap-1.5 text-[0.68rem] leading-relaxed ${
              featured ? "text-inverse-muted-foreground" : "text-muted-foreground"
            }`}
          >
            {reward.unlocked ? (
              <Check className="mt-0.5 size-3 shrink-0 text-success" aria-hidden />
            ) : (
              <LockKeyhole className="mt-0.5 size-3 shrink-0" aria-hidden />
            )}
            {reward.terms}
          </p>
        </div>
      </div>
    </li>
  );
}

function StatusCard({ rewards }: { rewards: Rewards }) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-primary p-6 text-primary-foreground sm:p-8">
      <Trophy className="size-8" aria-hidden />
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] opacity-75">
        Votre statut
      </p>
      <h2 className="mt-2 text-3xl font-semibold">{rewards.tier.name}</h2>
      <ul className="relative mt-5 space-y-3">
        {rewards.tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-3 text-sm leading-relaxed">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
              <Check className="size-3" aria-hidden />
            </span>
            {perk}
          </li>
        ))}
      </ul>
    </section>
  );
}

function EarningRules({ rewards }: { rewards: Rewards }) {
  return (
    <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        Ce qui fait vraiment avancer
      </p>
      <h2 className="mt-2 text-2xl font-semibold">La livraison compte plus que l&apos;annonce</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <GainCard
          icon={PlaneTakeoff}
          points={rewards.earningRules.trip_verified}
          title="Voyage vérifié"
          copy="Votre billet confirme une route réelle."
        />
        <GainCard
          icon={Coins}
          points={rewards.earningRules.capacity_published}
          title="Place publiée"
          copy="Vos kilos deviennent visibles des familles."
        />
        <GainCard
          icon={PackageCheck}
          points={rewards.earningRules.delivery_completed}
          title="Colis arrivé"
          copy="C'est l'engagement qui rapporte le plus."
        />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Un voyage vérifié annulé alors que des expéditeurs peuvent compter dessus retire{" "}
        <strong>{Math.abs(rewards.earningRules.commitment_broken ?? 0)} points</strong>.
        Un brouillon abandonné n&apos;est jamais pénalisé.
      </p>
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

function TierJourney({ rewards }: { rewards: Rewards }) {
  return (
    <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        Votre réputation de voyageur
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Du premier trajet à la Légende</h2>
      <ol className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
      {current && (
        <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-bold text-primary">
          Votre palier
        </span>
      )}
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
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        Votre histoire
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Les gestes déjà accomplis</h2>
      <ul className="mt-5 divide-y divide-border">
        {history.map((entry, index) => (
          <li
            key={`${entry.occurredAt}-${index}`}
            className="flex items-center justify-between gap-4 py-3.5"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium">
                {REASONS[entry.reason] ?? entry.reason}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
                  new Date(entry.occurredAt),
                )}
                {entry.note ? ` · ${entry.note}` : ""}
              </span>
            </span>
            <span
              className={`shrink-0 font-bold tabular-nums ${
                entry.amount >= 0 ? "text-primary" : "text-error"
              }`}
            >
              {entry.amount > 0 ? "+" : ""}
              {entry.amount}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
