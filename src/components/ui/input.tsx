import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "focus-ring h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted-foreground/80 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
