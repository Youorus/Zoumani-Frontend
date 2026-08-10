"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { CloseIcon } from "./icons";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;
export const DrawerPortal = DialogPrimitive.Portal;
export const DrawerTitle = DialogPrimitive.Title;
export const DrawerDescription = DialogPrimitive.Description;

export const DrawerOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[var(--z-overlay)] bg-foreground/20 backdrop-blur-sm transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
      className,
    )}
    {...props}
  />
));

DrawerOverlay.displayName = "DrawerOverlay";

const drawerSides = {
  right: "top-0 right-0 h-full w-[min(92vw,30rem)] translate-x-0 data-[state=closed]:translate-x-full",
  left: "top-0 left-0 h-full w-[min(92vw,30rem)] translate-x-0 data-[state=closed]:-translate-x-full",
  bottom:
    "right-0 bottom-0 left-0 w-full rounded-b-none rounded-t-[1.75rem] data-[state=closed]:translate-y-full",
} as const;

export const DrawerContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: keyof typeof drawerSides;
  }
>(({ className, children, side = "right", ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[calc(var(--z-overlay)+1)] rounded-[1.75rem] border border-border bg-surface-elevated p-6 shadow-lifted transition duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
        drawerSides[side],
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="focus-ring absolute top-4 right-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <CloseIcon className="size-4" />
        <span className="sr-only">Fermer</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DrawerPortal>
));

DrawerContent.displayName = "DrawerContent";
