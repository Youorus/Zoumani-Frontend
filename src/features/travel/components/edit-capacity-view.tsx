"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  fetchCatalog,
  offerCapacity,
  updateCapacity,
  withdrawCapacity,
} from "../api/travel-client";
import {
  fromMinorUnits,
  toMinorUnits,
  type Capacity,
  type Catalog,
} from "../types/travel.types";
import { StepCategories } from "./step-categories";
import { StepPricing } from "./step-pricing";
import { StepWeight } from "./step-weight";

interface EditCapacityViewProps {
  tripId: string;
  /** L'offre existante, ou `null` si le voyage n'en porte pas encore. */
  capacity: Capacity | null;
}

const DEVISE = "EUR";
const POIDS_MIN = 0.5;
const POIDS_MAX = 64;

/**
 * La correction d'une offre : poids, catégories, tarifs.
 *
 * ═══ Un écran, pas un assistant ═══
 *
 * Même raison que pour l'itinéraire : corriger, c'est retrouver ce qu'on
 * a écrit et changer une chose. Les trois blocs sont donc empilés et
 * pré-remplis, sans étapes à retraverser.
 *
 * ═══ Une offre publiée se retire d'abord ═══
 *
 * Elle est visible : on peut réserver dessus à l'instant où l'on
 * modifierait le prix. L'écran propose donc de la retirer du marché — un
 * geste explicite, avec sa conséquence dite — plutôt que de refuser sans
 * expliquer. Ce qui est déjà engagé, lui, fige l'offre pour de bon.
 */
export function EditCapacityView({ tripId, capacity }: EditCapacityViewProps) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [weight, setWeight] = useState(capacity ? String(capacity.totalWeightKg) : "");
  const [selected, setSelected] = useState<string[]>(
    capacity ? capacity.offers.map((offer) => offer.categoryCode) : [],
  );
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(
      (capacity?.offers ?? []).map((offer) => [
        offer.categoryCode,
        fromMinorUnits(offer.priceMinor),
      ]),
    ),
  );
  const [acceptsInPerson, setAcceptsInPerson] = useState(
    capacity?.acceptsInPerson ?? false,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let vivant = true;
    void fetchCatalog().then((valeur) => {
      if (vivant) {
        setCatalog(valeur);
      }
    });
    return () => {
      vivant = false;
    };
  }, []);

  const engagee =
    capacity !== null && capacity.availableWeightKg < capacity.totalWeightKg;
  const publiee = capacity?.status === "published";

  if (engagee) {
    return (
      <Message titre="Cette offre est engagée">
        Des expéditeurs ont réservé de la place sur la foi de vos tarifs. Les modifier
        maintenant reviendrait à changer un accord déjà conclu.
      </Message>
    );
  }

  const choisies = (catalog?.categories ?? []).filter((c) => selected.includes(c.code));

  async function enregistrer() {
    const trouves: Record<string, string> = {};
    const poids = Number.parseFloat(weight.replace(",", "."));

    if (!Number.isFinite(poids) || poids < POIDS_MIN || poids > POIDS_MAX) {
      trouves.weight = "Indiquez un poids entre 0,5 et 64 kg.";
    }
    if (selected.length === 0) {
      trouves.categories = "Choisissez au moins une catégorie.";
    }

    const offers: { categoryCode: string; priceMinor: number }[] = [];
    for (const category of choisies) {
      const minor = toMinorUnits(prices[category.code] ?? "");
      if (minor === null || minor < 1) {
        trouves[category.code] = "Indiquez un tarif.";
      } else {
        offers.push({ categoryCode: category.code, priceMinor: minor });
      }
    }

    setErrors(trouves);
    if (Object.keys(trouves).length > 0) {
      return;
    }

    setBusy(true);
    try {
      const draft = {
        totalWeightKg: poids,
        currency: DEVISE,
        offers,
        acceptsInPerson,
        notes: null,
      };
      if (capacity) {
        await updateCapacity(capacity.id, draft);
      } else {
        await offerCapacity(tripId, draft);
      }
      router.push(`/trips/${tripId}`);
      router.refresh();
    } catch (error) {
      setErrors({
        global:
          error instanceof Error ? error.message : "L'enregistrement n'a pas abouti.",
      });
      setBusy(false);
    }
  }

  async function retirer() {
    if (!capacity) {
      return;
    }
    setBusy(true);
    try {
      await withdrawCapacity(capacity.id);
      router.refresh();
    } catch (error) {
      setErrors({
        global: error instanceof Error ? error.message : "Le retrait n'a pas abouti.",
      });
    } finally {
      setBusy(false);
    }
  }

  if (publiee) {
    return (
      <Message titre="Votre offre est en ligne">
        <p>
          Un expéditeur peut réserver à l&apos;instant où vous changeriez un prix.
          Retirez-la du marché pour la modifier — vos réservations existantes ne sont pas
          annulées.
        </p>
        <button
          type="button"
          onClick={retirer}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-40"
        >
          {busy ? "…" : "Retirer du marché et modifier"}
        </button>
        {errors.global && (
          <p className="mt-2 text-sm text-error" role="alert">
            {errors.global}
          </p>
        )}
      </Message>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {capacity ? "Modifier mon offre" : "Proposer de la place"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {capacity
            ? "Vos changements ne seront visibles qu'après publication."
            : "Ce que vous acceptez de transporter, et à quel tarif."}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-medium">Place disponible</h2>
        <StepWeight value={weight} onChange={setWeight} error={errors.weight} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">Ce que vous transportez</h2>
        {catalog ? (
          <StepCategories
            categories={catalog.categories}
            prohibited={catalog.prohibited}
            selected={selected}
            onToggle={(code) =>
              setSelected((courant) =>
                courant.includes(code)
                  ? courant.filter((autre) => autre !== code)
                  : [...courant, code],
              )
            }
            error={errors.categories}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        )}
      </section>

      {choisies.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium">Vos tarifs</h2>
          <StepPricing
            categories={choisies}
            prices={prices}
            remembered={[]}
            errors={errors}
            onChange={(code, valeur) =>
              setPrices((courant) => ({ ...courant, [code]: valeur }))
            }
          />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium">Comment recevoir les colis</h2>
        <div className="mb-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
          <span className="block text-sm font-medium">
            Livraison à votre domicile incluse
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            Chaque expéditeur peut déposer son colis chez un partenaire. Il vous sera
            acheminé à l&apos;adresse vérifiée de votre profil, sans déplacement imposé.
          </span>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3.5">
          <input
            type="checkbox"
            checked={acceptsInPerson}
            onChange={(event) => setAcceptsInPerson(event.target.checked)}
            className="mt-0.5 size-4"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">
              J&apos;accepte aussi une remise en main propre
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Si l&apos;expéditeur est suffisamment proche, vous pourrez convenir ensemble
              d&apos;un lieu et d&apos;un horaire. Au-delà de la distance de sécurité, la
              livraison restera automatiquement obligatoire.
            </span>
          </span>
        </label>
      </section>

      {errors.global && (
        <p className="text-sm text-error" role="alert">
          {errors.global}
        </p>
      )}

      <button
        type="button"
        onClick={enregistrer}
        disabled={busy}
        className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-40"
      >
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}

function Message({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg space-y-2 p-6 text-center">
      <h1 className="text-xl font-semibold">{titre}</h1>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
