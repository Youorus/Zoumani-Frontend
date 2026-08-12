"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

/**
 * Un calendrier aux couleurs de Zoumani, à la place de celui du navigateur.
 *
 * ═══ Pourquoi remplacer le champ natif ═══
 *
 * `<input type="date">` change d'apparence sur chaque système, s'affiche
 * dans la langue de l'appareil et non du site, et sur beaucoup d'Android
 * il n'ouvre rien du tout — il faut taper `12/03/1994` dans un ordre que
 * personne ne devine. Sur un formulaire d'identité, où une date fausse
 * fait refuser un dossier, cela suffit à justifier de le remplacer.
 *
 * ═══ Le choix de l'année d'abord ═══
 *
 * Une date de naissance est à trente ans en arrière. Faire défiler
 * trois cent soixante mois est absurde : l'année se choisit dans une
 * liste, et le reste suit. C'est ce qui distingue un calendrier de
 * naissance d'un calendrier de rendez-vous.
 *
 * ═══ Ce qui le rend utilisable au doigt ═══
 *
 * Chaque jour fait au moins quarante pixels de côté, la grille se
 * dimensionne en fractions et non en pixels fixes, et le panneau ne
 * dépasse jamais la largeur de l'écran.
 */

const JOURS = ["L", "M", "M", "J", "V", "S", "D"] as const;

/** Rend `AAAA-MM-JJ`, le seul format que l'API accepte. */
/** Ramène une valeur dans un intervalle. */
function borner(valeur: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function versIso(annee: number, mois: number, jour: number): string {
  return `${annee}-${String(mois + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
}

/**
 * Numéro du premier jour du mois, lundi en tête.
 *
 * `getDay()` compte le dimanche comme zéro — convention américaine. En
 * France comme en Afrique francophone, la semaine commence le lundi, et
 * un calendrier décalé d'un jour se remarque immédiatement.
 */
function decalage(annee: number, mois: number): number {
  return (new Date(annee, mois, 1).getDay() + 6) % 7;
}

function nombreDeJours(annee: number, mois: number): number {
  return new Date(annee, mois + 1, 0).getDate();
}

export function DateField({
  value,
  onChange,
  locale = "fr",
  placeholder = "Choisir une date",
  minYear,
  maxYear,
  ariaLabel,
}: {
  /** Date au format `AAAA-MM-JJ`, ou chaîne vide. */
  value: string;
  onChange: (iso: string) => void;
  locale?: string;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  ariaLabel: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const choisie = value ? new Date(`${value}T00:00:00`) : null;

  // Figé une fois : recréer la date à chaque rendu changerait l'identité
  // des dépendances des `useMemo` qui la lisent, et les recalculerait
  // sans raison.
  const [aujourdhui] = useState(() => new Date());

  const { debut, fin } = useMemo(() => {
    const borneHaute = maxYear ?? aujourdhui.getFullYear();
    return { debut: minYear ?? borneHaute - 100, fin: borneHaute };
  }, [minYear, maxYear, aujourdhui]);

  const [curseur, setCurseur] = useState(() => ({
    // **Borné à la plage autorisée.** Sans ce garde-fou, l'ouverture par
    // défaut — trente ans en arrière, ce que veut une date de naissance —
    // sortait des bornes d'un champ qui n'accepte que le futur : le
    // sélecteur affichait une année absente de ses propres options, et
    // la date composée partait avec elle. Un vol se retrouvait daté de
    // 1996, et la vérification échouait sans que rien n'explique
    // pourquoi.
    annee: borner(choisie?.getFullYear() ?? aujourdhui.getFullYear() - 30, debut, fin),
    mois: choisie?.getMonth() ?? aujourdhui.getMonth(),
  }));

  const annees = useMemo(
    // Décroissantes : une date de naissance est plus près de la fin de
    // la liste que du début, et un titre de séjour expire bientôt.
    () => Array.from({ length: fin - debut + 1 }, (_, index) => fin - index),
    [debut, fin],
  );

  const nomsDeMois = useMemo(
    () =>
      Array.from({ length: 12 }, (_, mois) =>
        new Intl.DateTimeFormat(locale, { month: "long" }).format(
          new Date(2000, mois, 1),
        ),
      ),
    [locale],
  );

  const libelle = choisie
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(choisie)
    : placeholder;

  function glisser(pas: number) {
    setCurseur((actuel) => {
      const mois = actuel.mois + pas;
      if (mois < 0) return { annee: actuel.annee - 1, mois: 11 };
      if (mois > 11) return { annee: actuel.annee + 1, mois: 0 };
      return { ...actuel, mois };
    });
  }

  return (
    <Popover open={ouvert} onOpenChange={setOuvert}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="focus-ring flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
        >
          <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className={cn("truncate", !choisie && "text-muted-foreground")}>
            {libelle}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        // Bornée à la largeur de l'écran : sur un téléphone, un panneau
        // de 20 rem déborderait et se ferait rogner par le bord.
        className="w-[min(20rem,calc(100vw-2rem))] p-3"
      >
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => glisser(-1)}
            aria-label="Mois précédent"
            className="focus-ring grid size-9 shrink-0 place-items-center rounded-lg hover:bg-muted"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>

          <select
            value={curseur.mois}
            onChange={(event) =>
              setCurseur({ ...curseur, mois: Number(event.target.value) })
            }
            aria-label="Mois"
            className="focus-ring min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-sm font-semibold capitalize"
          >
            {nomsDeMois.map((nom, index) => (
              <option key={nom} value={index}>
                {nom}
              </option>
            ))}
          </select>

          <select
            value={curseur.annee}
            onChange={(event) =>
              setCurseur({ ...curseur, annee: Number(event.target.value) })
            }
            aria-label="Année"
            className="focus-ring rounded-lg bg-transparent px-2 py-1.5 text-sm font-semibold"
          >
            {annees.map((annee) => (
              <option key={annee} value={annee}>
                {annee}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => glisser(1)}
            aria-label="Mois suivant"
            className="focus-ring grid size-9 shrink-0 place-items-center rounded-lg hover:bg-muted"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {JOURS.map((jour, index) => (
            <span
              // L'initiale du mardi et celle du mercredi sont identiques :
              // l'index désambiguïse la clé sans changer l'affichage.
              key={`${jour}-${index}`}
              className="py-1 text-xs font-semibold text-muted-foreground"
              aria-hidden="true"
            >
              {jour}
            </span>
          ))}

          {Array.from({ length: decalage(curseur.annee, curseur.mois) }, (_, index) => (
            <span key={`vide-${index}`} />
          ))}

          {Array.from(
            { length: nombreDeJours(curseur.annee, curseur.mois) },
            (_, index) => {
              const jour = index + 1;
              const iso = versIso(curseur.annee, curseur.mois, jour);
              const actif = iso === value;
              return (
                <button
                  key={jour}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setOuvert(false);
                  }}
                  aria-pressed={actif}
                  className={cn(
                    "focus-ring grid aspect-square min-h-9 place-items-center rounded-lg text-sm transition-colors",
                    actif
                      ? "bg-primary font-bold text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  {jour}
                </button>
              );
            },
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
