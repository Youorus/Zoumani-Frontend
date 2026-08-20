"use client";

import { useEffect, useRef } from "react";

import styles from "./how-it-works.module.css";

const routePath =
  "M60 12 C24 150 97 330 60 510 C22 690 98 870 60 1050 C23 1230 96 1410 60 1590 C26 1755 80 1935 60 2088";

export function StoryRoute() {
  const routeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrame = 0;

    const updateProgress = () => {
      animationFrame = 0;
      const route = routeRef.current;
      const timeline = route?.closest<HTMLElement>("[data-story-timeline]");

      if (!route || !timeline) return;

      const bounds = timeline.getBoundingClientRect();
      const timelineTop = bounds.top + window.scrollY;
      const start = timelineTop - window.innerHeight * 0.55;
      const end = timelineTop + bounds.height - window.innerHeight * 0.45;
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - start) / (end - start)),
      );

      route.style.setProperty("--route-progress-offset", String(1 - progress));
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <div ref={routeRef} className={styles.route} aria-hidden="true">
      <svg viewBox="0 0 120 2100" preserveAspectRatio="none">
        <path
          className={styles.routeBase}
          d={routePath}
          pathLength="1"
          data-story-route="base"
        />
        <path
          className={styles.routeProgress}
          d={routePath}
          pathLength="1"
          data-story-route="progress"
        />
      </svg>
    </div>
  );
}
