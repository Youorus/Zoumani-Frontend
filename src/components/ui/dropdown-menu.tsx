"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { CheckIcon, ChevronDownIcon } from "./icons";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[calc(var(--z-overlay)+1)] min-w-52 rounded-2xl border border-border bg-surface-elevated p-2 shadow-lifted",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "focus:outline-none flex cursor-default items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  />
));

DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "focus:outline-none relative flex cursor-default items-center rounded-xl py-2 pr-3 pl-9 text-sm text-foreground transition-colors data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-3 grid size-4 place-items-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon className="size-3.5" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));

DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

export const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-3 py-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase", className)}
    {...props}
  />
));

DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn("my-2 h-px bg-border", className)} {...props} />;
}

export function DropdownMenuShortcut({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return <span className={cn("ml-auto text-xs tracking-wide text-muted-foreground", className)} {...props} />;
}

export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        "focus:outline-none flex cursor-default items-center rounded-xl px-3 py-2 text-sm text-foreground transition-colors data-[highlighted]:bg-muted",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="ml-auto size-4 -rotate-90" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export const DropdownMenuSubContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-[calc(var(--z-overlay)+1)] min-w-48 rounded-2xl border border-border bg-surface-elevated p-2 shadow-lifted",
      className,
    )}
    {...props}
  />
));

DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
