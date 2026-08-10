"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/cn";

import { DotIcon } from "./icons";

export function RadioGroup({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn("grid gap-3", className)} {...props} />;
}

export function RadioGroupItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "focus-ring grid size-5 place-items-center rounded-full border border-border bg-surface text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator>
        <DotIcon className="size-3.5" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
