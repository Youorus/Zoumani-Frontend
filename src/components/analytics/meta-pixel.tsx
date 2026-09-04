"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { env } from "@/lib/env/env";
import { type ConsentChoice, readConsent } from "@/lib/marketing/consent";
import { metaTrack } from "@/lib/marketing/meta";

/**
 * Le pixel Meta.
 *
 * ═══ Pourquoi il ressemble à Clarity et non à GA4 ═══
 *
 * GA4 et GTM comprennent le Consent Mode : on peut les poser tout de
 * suite, ils se taisent tant que le consentement est refusé. **Meta ne
 * l'implémente pas.** Chargé, il mesure — il n'existe pas d'état
 * intermédiaire où il serait présent et muet.
 *
 * Il n'est donc pas rendu tant que la publicité n'est pas acceptée. Le
 * script n'est pas seulement inerte : il n'est pas demandé, pas
 * téléchargé, et `connect.facebook.net` n'est jamais contacté.
 *
 * ═══ Et pourquoi la catégorie « publicité », pas « mesure » ═══
 *
 * Le bandeau distingue les deux finalités depuis le 30 août, et cette
 * distinction avait été construite exactement pour ce moment. Un pixel
 * publicitaire glissé sous le consentement de la mesure d'audience
 * serait un accord obtenu sur une finalité qu'on n'a pas nommée —
 * c'est-à-dire pas un accord. Quelqu'un qui accepte la mesure et refuse
 * la publicité est mesuré par GA4 et par Clarity, et ignoré de Meta.
 *
 * ═══ Un seul `PageView` par page vue ═══
 *
 * Le site est une application à navigation client : `fbevents.js` ne voit
 * pas les changements de page, et n'en compterait qu'un pour toute la
 * visite. Ce composant les émet donc lui-même.
 *
 * Trois gardes empêchent le double comptage, et chacune couvre un cas
 * distinct :
 *
 * 1. `document.getElementById` — le script n'est injecté qu'une fois,
 *    même si l'effet se rejoue (mode strict, remontage).
 * 2. `dernierChemin` — le `PageView` du chargement vaut pour la page
 *    courante ; le suivant n'est émis que si le chemin a réellement
 *    changé.
 * 3. Le `Lead`, lui, est dédoublonné par son `eventID` dans `meta.ts` —
 *    la seule garde qui doive survivre au démontage du composant.
 */
export function MetaPixel() {
  const id = env.NEXT_PUBLIC_META_PIXEL_ID;
  const chemin = usePathname();
  const [autorise, setAutorise] = useState(false);
  const dernierChemin = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const evaluer = (choix: ConsentChoice | null) => setAutorise(choix?.marketing === true);
    evaluer(readConsent());

    // Le bandeau émet cet événement au clic : sans lui, quelqu'un qui
    // accepte ne serait mesuré qu'à la page suivante.
    const auConsentement = (e: Event) => evaluer((e as CustomEvent<ConsentChoice>).detail);
    window.addEventListener("zoumani:consent", auConsentement);
    return () => window.removeEventListener("zoumani:consent", auConsentement);
  }, [id]);

  useEffect(() => {
    if (!id || !autorise) return;

    if (!document.getElementById("meta-pixel")) {
      // L'amorçage officiel de Meta : il définit `fbq` de façon
      // synchrone — une file d'attente — puis charge la bibliothèque.
      // Les appels passés entre les deux ne sont donc pas perdus.
      const script = document.createElement("script");
      script.id = "meta-pixel";
      script.async = true;
      // ═══ `autoConfig: false`, avant `init` ═══
      //
      // Sans cette ligne, le pixel se met à observer la page de
      // lui-même : mesuré en production le 4 septembre 2026, il envoyait
      // quatre `SubscribedButtonClick` par parcours, chacun portant le
      // texte du bouton, la structure du formulaire — identifiants, noms
      // de champs, types, textes indicatifs — et le titre de la page.
      //
      // Aucune valeur saisie n'y figurait, vérifié : ni le prénom, ni
      // l'adresse électronique. Ce n'est donc pas une fuite. Mais c'est
      // une collecte qu'on n'a pas demandée, qui décrit le formulaire à
      // un tiers, et qui double ce que `cta_clicked` et
      // `funnel_step_viewed` disent déjà — mieux, et sans quitter GA4.
      //
      // On ne mesure que ce qui sert à décider. Le reste est de la
      // surveillance sans usage, y compris quand c'est la régie qui la
      // fait toute seule.
      script.innerHTML = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set','autoConfig',false,'${id}');
fbq('init','${id}');`;
      document.head.appendChild(script);

      dernierChemin.current = chemin;
      metaTrack("PageView");
      return;
    }

    if (dernierChemin.current === chemin) return;
    dernierChemin.current = chemin;
    metaTrack("PageView");
  }, [id, autorise, chemin]);

  return null;
}
