"use client";

import type { PointEntry, Rewards, Tier } from "../types/trip.types";

interface RewardsViewProps {
  rewards: Rewards;
}

/**
 * Le programme de fidélité, vu par le voyageur.
 *
 * ═══ Ce que cet écran doit produire ═══
 *
 * Pas un relevé de compte : une **envie de repartir**. L'ordre suit donc
 * la question que se pose quelqu'un qui arrive — « où j'en suis, et
 * qu'est-ce que je gagne ensuite ? » — et non l'ordre des données.
 *
 * D'abord le solde et le palier atteint, parce que c'est acquis. Puis
 * **ce qu'il reste à parcourir**, chiffré : « 120 points » est un
 * objectif, « 24 % » n'en est pas un. Puis la récompense qui attend,
 * nommée — une nuit d'hôtel, pas « des avantages ». Le journal vient en
 * dernier : il rassure ceux qui vérifient, il ne motive personne.
 *
 * ═══ Le solde négatif ═══
 *
 * Il existe : rompre un engagement coûte plus qu'un transport ne
 * rapporte. L'écran le dit sans punir davantage — celui qui s'est
 * désisté doit avoir envie de se rattraper, pas de fermer l'onglet.
 */
export function RewardsView({ rewards }: RewardsViewProps) {
  const enDette = rewards.balance < 0;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <section className="overflow-hidden rounded-2xl border border-border">
        <div className="bg-primary/5 p-5 sm:p-6">
          <p className="text-sm text-muted-foreground">Votre palier</p>
          <div className="mt-1 flex items-baseline justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">{rewards.tier.name}</h1>
            <p className="shrink-0 text-right">
              <span className="text-2xl font-semibold tabular-nums">
                {rewards.balance}
              </span>
              <span className="ml-1 text-sm text-muted-foreground">points</span>
            </p>
          </div>

          {rewards.nextTier && rewards.pointsToNext !== null ? (
            <div className="mt-5">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-background"
                role="progressbar"
                aria-valuenow={Math.round(rewards.progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.round(rewards.progress * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm">
                {/* Le nombre avant le palier : c'est lui qui fait agir. */}
                <span className="font-medium">{rewards.pointsToNext} points</span>
                <span className="text-muted-foreground">
                  {" "}
                  pour devenir {rewards.nextTier.name}
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Vous êtes au sommet du programme. Merci pour ce que vous portez.
            </p>
          )}
        </div>

        {enDette && (
          <p className="border-t border-border px-5 py-3 text-sm text-muted-foreground sm:px-6">
            Votre solde est négatif à la suite d&apos;un engagement non tenu. Un prochain
            transport mené à terme vous remettra à flot.
          </p>
        )}
      </section>

      {rewards.nextTier && (
        <section className="rounded-2xl border border-border p-5 sm:p-6">
          <p className="text-sm text-muted-foreground">
            Ce qui vous attend en {rewards.nextTier.name}
          </p>
          <ul className="mt-3 space-y-2.5">
            {rewards.nextTier.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm">
                <span
                  aria-hidden
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="size-3 text-primary"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium">Comment gagner des points</h2>
        <div className="grid gap-2.5 sm:grid-cols-3">
          <GainCard points="+100" libelle="Colis remis à destination" />
          <GainCard points="+50" libelle="Voyage vérifié" />
          <GainCard points="+25" libelle="Offre publiée" />
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">
          Annuler un voyage vérifié sur lequel des expéditeurs comptent retire 250 points.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">Tous les paliers</h2>
        <ol className="space-y-2">
          {rewards.allTiers.map((tier) => (
            <TierRow
              key={tier.code}
              tier={tier}
              atteint={rewards.balance >= tier.threshold}
              courant={tier.code === rewards.tier.code}
            />
          ))}
        </ol>
      </section>

      {rewards.history.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium">Votre historique</h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {rewards.history.map((entry, index) => (
              <HistoryRow key={`${entry.occurredAt}-${index}`} entry={entry} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function GainCard({ points, libelle }: { points: string; libelle: string }) {
  return (
    <div className="rounded-xl border border-border p-3.5">
      <p className="text-lg font-semibold text-primary tabular-nums">{points}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{libelle}</p>
    </div>
  );
}

function TierRow({
  tier,
  atteint,
  courant,
}: {
  tier: Tier;
  atteint: boolean;
  courant: boolean;
}) {
  return (
    <li
      className={`rounded-xl border p-3.5 ${
        courant ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className={`font-medium ${atteint ? "" : "text-muted-foreground"}`}>
          {tier.name}
          {courant && (
            <span className="ml-2 text-xs font-normal text-primary">votre palier</span>
          )}
        </span>
        <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
          {tier.threshold} pts
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{tier.perks.join(" · ")}</p>
    </li>
  );
}

/** Traduit une raison technique en phrase. Le serveur rend le code. */
const RAISONS: Record<string, string> = {
  trip_verified: "Voyage vérifié",
  capacity_published: "Offre publiée",
  delivery_completed: "Colis remis",
  commitment_broken: "Engagement non tenu",
  manual_adjustment: "Ajustement",
};

function HistoryRow({ entry }: { entry: PointEntry }) {
  const gain = entry.amount > 0;
  return (
    <li className="flex items-center justify-between gap-4 px-3.5 py-3">
      <span className="min-w-0">
        <span className="block text-sm">{RAISONS[entry.reason] ?? entry.reason}</span>
        <span className="block text-xs text-muted-foreground">
          {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
            new Date(entry.occurredAt),
          )}
          {entry.note ? ` · ${entry.note}` : ""}
        </span>
      </span>
      <span
        className={`shrink-0 text-sm font-medium tabular-nums ${
          gain ? "text-primary" : "text-error"
        }`}
      >
        {gain ? "+" : ""}
        {entry.amount}
      </span>
    </li>
  );
}
