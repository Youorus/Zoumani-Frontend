import { Skeleton } from "@/components/ui/skeleton";

/**
 * L'attente avant que l'espace ne s'affiche.
 *
 * ═══ Une silhouette, pas un tourniquet ═══
 *
 * Les blocs reprennent la forme exacte de ce qui va apparaître : un
 * titre, une barre de recherche, deux cartes. L'œil se place pendant le
 * chargement, et le passage à la vraie page ne déplace rien. Un
 * tourniquet centré, lui, ne dit rien de ce qui arrive et fait sursauter
 * la mise en page au moment où elle se remplit.
 *
 * ═══ Ce que voit un lecteur d'écran ═══
 *
 * Rien de ces blocs — ce ne sont que des rectangles. Une seule phrase
 * est annoncée, une fois. Faire lire douze cases vides serait pire que
 * le silence.
 */
export default function LoadingAccount() {
  return (
    <div className="mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12">
      <span className="sr-only" role="status">
        Chargement de votre espace…
      </span>

      <div aria-hidden="true">
        <Skeleton className="h-8 w-56 sm:h-10 sm:w-72" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />

        {/* La barre de recherche : une seule colonne sur téléphone, quatre
            à partir du grand écran — exactement comme la vraie. */}
        <div className="mt-6 rounded-[1.35rem] bg-marketing-panel p-4 shadow-[0_28px_70px_-34px_rgb(13_6_2_/_0.7)] sm:p-5">
          <div className="grid items-center gap-3 lg:grid-cols-[1.3fr_1.3fr_.72fr_1.08fr]">
            <Skeleton className="h-19 w-full" />
            <Skeleton className="h-19 w-full" />
            <Skeleton className="h-19 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    </div>
  );
}
