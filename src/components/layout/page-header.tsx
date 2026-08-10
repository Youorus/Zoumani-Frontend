import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-[2rem] border border-border bg-surface/90 p-6 shadow-soft lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl space-y-3">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>

      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
