"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/cn";

import { CheckIcon } from "./icons";

export function Checkbox({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "focus-ring peer grid size-5 shrink-0 place-items-center rounded-md border border-border bg-surface text-primary transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
