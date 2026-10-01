"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";

/**
 * Le téléphone suit légèrement le pointeur.
 *
 * Deux ou trois degrés, pas plus : assez pour que l'objet réponde quand
 * on passe la souris sur le hero, pas assez pour qu'on le remarque comme
 * un effet. Les variables CSS `--tilt-x` et `--tilt-y` sont posées sur le
 * conteneur ; la feuille de style les ajoute à l'inclinaison de repos.
 *
 * Rien n'est fait au toucher ni en mouvement réduit : sur un téléphone,
 * il n'y a pas de pointeur à suivre, et quelqu'un qui a demandé moins de
 * mouvement ne doit pas en recevoir.
 */
export function DeviceTilt({ children, className }: PropsWithChildren<{ className?: string }>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const scene = element.closest("section") ?? element;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`);
        element.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      element.style.setProperty("--tilt-y", "0deg");
      element.style.setProperty("--tilt-x", "0deg");
    };

    scene.addEventListener("pointermove", onMove, { passive: true });
    scene.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
