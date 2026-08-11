"use client";

import { ArrowRight, BadgeCheck, Plane, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAccountCopy } from "@/features/account/components/account-copy-provider";
import type { AccountCopy } from "@/features/account/content/account-content";
import { accountLanguage } from "@/features/account/lib/account-language";
import { homeContent } from "@/features/home/components/home-content";
import { ShipmentSearch } from "@/features/home/components/shipment-search";
import { SearchResultsView } from "@/features/shipment-search/components/search-results-view";
import type { TripSearchFilters } from "@/features/shipment-search/schemas/trip-search.schema";
import type { AuthenticatedUser } from "@/lib/auth/auth.types";

/**
 * L'accueil de l'espace personnel.
 *
 * ═══ Une seule question en haut de l'écran ═══
 *
 * « Où va votre colis ? », et la barre juste dessous. C'est ce que la
 * grande majorité vient faire, et le poser d'emblée évite de demander à
 * quelqu'un de choisir ce qu'il est avant de pouvoir agir.
 *
 * ═══ Les résultats ne font pas changer de page ═══
 *
 * Ils s'ouvrent **sous** la barre, qui reste garnie. Chercher, c'est
 * essayer : on change de ville, on ajuste le poids, on recommence. Une
 * navigation à chaque essai efface le formulaire, recharge l'écran et
 * casse le fil — au point qu'on renonce à affiner.
 *
 * Le visiteur non connecté, lui, continue d'être envoyé sur `/search` :
 * il arrive sans contexte, et une page dédiée lui en donne un, avec une
 * adresse qu'il peut partager.
 *
 * ═══ Proposer un trajet vient après, et pas à côté ═══
 *
 * Deux appels à l'action de même poids obligent à arbitrer ; l'un sous
 * l'autre se lisent dans l'ordre. Et il est formulé comme une
 * circonstance — « je pars en voyage » — jamais comme une identité :
 * personne n'« est » voyageur, on part en voyage ce mois-ci.
 */
export function AccountHome({
  user,
  welcome,
}: {
  user: AuthenticatedUser;
  /** Vrai à la toute première venue : le compte vient d'être créé. */
  welcome: boolean;
}) {
  // `null` tant qu'on n'a rien cherché : l'écran d'arrivée montre ce
  // qu'on peut faire, pas une liste vide qui ressemble à une panne.
  const copy = useAccountCopy();
  const language = accountLanguage(user.preferredLanguage);
  const [filters, setFilters] = useState<TripSearchFilters | null>(null);

  return (
    <div className="mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12">
      <header className="mb-5 sm:mb-6">
        <h1 className="font-display text-2xl leading-tight text-foreground sm:text-3xl lg:text-4xl">
          {welcome ? copy.welcome(user.firstName) : copy.greeting(user.firstName)}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {copy.search.description}
        </p>
      </header>

      {/* Une question, pas une étiquette. « Destination » décrit un champ ;
          « Où va votre colis ? » dit quoi faire — et se comprend sans
          avoir jamais utilisé de site de réservation. */}
      <h2 className="mb-3 font-display text-lg text-foreground sm:text-xl">
        {copy.search.title}
      </h2>

      {/* La barre de la page d'accueil, telle quelle : mêmes champs, même
          attente, mêmes villes. Importée et non recopiée — une correction
          faite d'un côté vaut pour les deux. */}
      <ShipmentSearch
        className="px-0 sm:px-0 lg:px-0"
        copy={homeContent[language].search}
        language={language}
        onSearch={({ from, to, weight }) =>
          setFilters({ from, to, weight, lang: language })
        }
      />

      {filters ? (
        <section className="mt-6 sm:mt-8" aria-live="polite">
          {/* Le même composant que la page de résultats : même attente,
              même carte de voyageur, même message quand il n'y a personne
              sur le trajet. */}
          <SearchResultsView filters={filters} language={language} />
        </section>
      ) : (
        <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[1.4fr_1fr]">
          <ProposeTripCard copy={copy.actions.travel} />
          <IdentityCard copy={copy.identity} verified={user.identityVerified} />
        </div>
      )}
    </div>
  );
}

function ProposeTripCard({ copy }: { copy: AccountCopy["actions"]["travel"] }) {
  return (
    <section className="panel-surface flex flex-col justify-between gap-5 p-5 sm:p-6">
      <div>
        <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Plane className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-xl text-foreground sm:text-2xl">
          {copy.title}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          {copy.description}
        </p>
      </div>

      <Link
        href="/compte/trajets"
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 sm:w-fit"
      >
        {copy.cta}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

/**
 * L'état de la vérification d'identité.
 *
 * Montré ici plutôt qu'enfoui dans le profil : c'est ce qui bloquera un
 * premier trajet ou un premier envoi, et découvrir ce blocage au moment
 * de publier est la pire façon de l'apprendre.
 */
function IdentityCard({
  copy,
  verified,
}: {
  copy: AccountCopy["identity"];
  verified: boolean;
}) {
  return (
    <section className="panel-surface flex flex-col justify-between gap-5 p-5 sm:p-6">
      <div>
        <span
          className={
            verified
              ? "grid size-11 place-items-center rounded-xl bg-success/10 text-success"
              : "grid size-11 place-items-center rounded-xl bg-warning/10 text-warning"
          }
        >
          {verified ? (
            <BadgeCheck className="size-5" aria-hidden="true" />
          ) : (
            <ShieldAlert className="size-5" aria-hidden="true" />
          )}
        </span>
        <h2 className="mt-4 font-display text-xl text-foreground sm:text-2xl">
          {verified ? copy.verified : copy.pending}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {verified ? copy.verifiedDescription : copy.pendingDescription}
        </p>
      </div>

      {verified ? null : (
        <Link
          href="/compte/identite"
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted sm:w-fit"
        >
          {copy.cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
