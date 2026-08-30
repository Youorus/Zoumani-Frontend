"use client";

import { useEffect, useState } from "react";

import { env } from "@/lib/env/env";
import { type ConsentChoice, readConsent } from "@/lib/marketing/consent";

/**
 * Microsoft Clarity — enregistrement de session et cartes de chaleur.
 *
 * ═══ Pourquoi il ne se charge pas comme les autres ═══
 *
 * GA4 et GTM comprennent le Consent Mode : on peut les poser tout de
 * suite, ils se taisent tant que le consentement est refusé. **Clarity
 * ne l'implémente pas.** Chargé, il enregistre — il n'existe pas d'état
 * intermédiaire où il serait présent et muet.
 *
 * Il n'est donc pas rendu tant que la mesure d'audience n'est pas
 * acceptée. Le script n'est pas seulement inerte : il n'est pas demandé,
 * pas téléchargé, et son domaine n'est jamais contacté. C'est la seule
 * lecture défendable de « les scripts soumis au consentement ne doivent
 * pas être chargés avant l'autorisation ».
 *
 * Conséquence assumée : quelqu'un qui accepte voit son enregistrement
 * commencer au clic, pas à l'arrivée. On perd les premières secondes de
 * la session. C'est le prix du consentement préalable, et il se paie.
 *
 * ═══ Ce que l'enregistrement ne doit pas contenir ═══
 *
 * Clarity rejoue l'écran. Sans précaution, il rejouerait donc le prénom,
 * l'e-mail et le téléphone saisis dans le tunnel. `content: false` coupe
 * la capture du texte des champs à la source, côté navigateur : la
 * frappe ne quitte jamais la machine. C'est plus sûr qu'un masquage
 * décidé côté serveur, qui suppose que la donnée soit d'abord partie.
 *
 * ═══ Ni SSR ni hydratation ═══
 *
 * Le chargement se fait dans un effet, après le rendu : rien n'entre
 * dans le HTML initial, aucune différence entre serveur et client, aucun
 * blocage du premier affichage.
 */
export function MicrosoftClarity() {
  const id = env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const [autorise, setAutorise] = useState(false);

  useEffect(() => {
    if (!id) return;

    const evaluer = (choix: ConsentChoice | null) => setAutorise(choix?.analytics === true);
    evaluer(readConsent());

    // Le bandeau émet cet événement au clic : sans lui, quelqu'un qui
    // accepte ne serait mesuré qu'à la page suivante.
    const auConsentement = (e: Event) => evaluer((e as CustomEvent<ConsentChoice>).detail);
    window.addEventListener("zoumani:consent", auConsentement);
    return () => window.removeEventListener("zoumani:consent", auConsentement);
  }, [id]);

  useEffect(() => {
    if (!id || !autorise) return;
    if (document.getElementById("clarity-script")) return;

    const script = document.createElement("script");
    script.id = "clarity-script";
    script.async = true;
    script.innerHTML = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");
window.clarity("consent");
window.clarity("set","content",false);`;
    document.head.appendChild(script);
  }, [id, autorise]);

  return null;
}
