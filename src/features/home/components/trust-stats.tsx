import { Box, Globe2, Headphones, ShieldCheck, UsersRound } from "lucide-react";

import type { HomeContent } from "./home-content";

const statIcons = [Globe2, UsersRound, ShieldCheck, Box, Headphones] as const;

export function TrustStats({ copy }: { copy: HomeContent["stats"] }) {
  return (
    <div className="mt-2 bg-inverse-surface text-inverse-foreground">
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-2 gap-x-5 gap-y-7 px-5 py-7 sm:px-8 md:grid-cols-3 xl:grid-cols-5 xl:px-0 xl:py-5">
        {copy.map(({ value, label }, index) => {
          const Icon = statIcons[index] ?? Globe2;

          return (
            <div key={value} className="flex items-center justify-center gap-4 xl:justify-start">
              <Icon className="size-10 shrink-0 stroke-[1.7] text-rating" aria-hidden="true" />
              <p className="text-sm leading-5">
                <strong className="block text-base font-bold">{value}</strong>
                <span className="whitespace-pre-line text-inverse-muted-foreground">{label}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
