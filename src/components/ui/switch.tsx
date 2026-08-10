"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/cn";

export function Switch({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "focus-ring relative inline-flex h-7 w-12 shrink-0 rounded-full border border-transparent bg-muted transition-colors data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 translate-x-1 rounded-full bg-surface-elevated shadow-sm transition-transform data-[state=checked]:translate-x-6" />
    </SwitchPrimitive.Root>
  );
}
