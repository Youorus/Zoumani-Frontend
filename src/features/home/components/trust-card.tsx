import { Check, Shield } from "lucide-react";

import type { HomeContent } from "./home-content";

export function TrustCard({ copy }: { copy: HomeContent["trustCard"] }) {
  return (
    <aside className="absolute top-[8.5rem] right-[5.5%] z-20 hidden w-[252px] items-center gap-4 rounded-[1.5rem] border border-hero-glass-border bg-hero-glass px-5 py-5 text-inverse-foreground shadow-lifted backdrop-blur-md 2xl:flex">
      <span className="relative grid size-14 shrink-0 place-items-center text-rating">
        <Shield className="size-14 fill-current stroke-none" />
        <Check className="absolute size-6 stroke-[3] text-inverse-surface" />
      </span>
      <p className="text-sm leading-6">
        {copy.eyebrow}
        <strong className="block text-xl leading-7">{copy.title}</strong>
        <span className="mt-1 block text-inverse-muted-foreground">{copy.footer}</span>
      </p>
    </aside>
  );
}
