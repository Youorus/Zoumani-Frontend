import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const badgeVariants = {
  primary: "bg-primary/12 text-primary",
  accent: "bg-accent/12 text-accent",
  surface: "bg-muted text-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  error: "bg-error/12 text-error",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

export function Badge({ className, variant = "surface", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
