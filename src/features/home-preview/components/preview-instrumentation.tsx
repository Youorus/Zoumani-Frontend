"use client";

import { useEffect, useRef } from "react";

import { readAttribution } from "@/lib/marketing/attribution";
import { EVENTS, track } from "@/lib/marketing/events";

/** Remplace PageInstrumentation sur cette seule route : un écouteur, une mesure par clic. */
export function PreviewInstrumentation() {
  const viewed = useRef(false);

  useEffect(() => {
    const context = { landing_variant: "v2", preview: true };
    if (!viewed.current) {
      viewed.current = true;
      track(EVENTS.landingViewed, { ...readAttribution(), ...context });
    }

    function onClick(event: MouseEvent) {
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-cta]") : null;
      if (!element) return;
      track(EVENTS.ctaClicked, {
        ...context,
        cta: element.dataset.cta,
        intent_role: element.dataset.intentRole,
        href: element.getAttribute("href") ?? undefined,
        origin: document.querySelector<HTMLSelectElement>("#preview-origin")?.value,
        destination: document.querySelector<HTMLSelectElement>("#preview-destination")?.value,
      });
    }

    const seen = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || seen.has(entry.target.id)) return;
        seen.add(entry.target.id);
        track(EVENTS.sectionViewed, { ...context, section: entry.target.id });
      });
    }, { threshold: 0.25 });
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      observer.disconnect();
    };
  }, []);

  return null;
}
