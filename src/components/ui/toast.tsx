"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import type { PropsWithChildren, ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";

type ToastVariant = "info" | "success" | "warning" | "error";

interface ToastPayload {
  title: string;
  description?: string;
  action?: ReactNode;
  duration?: number;
  variant?: ToastVariant;
}

interface ToastRecord extends ToastPayload {
  id: string;
  open: boolean;
}

interface ToastContextValue {
  toast: (payload: ToastPayload) => string;
  dismiss: (id: string) => void;
}

const toastVariantClasses = {
  info: "border-info/20 bg-surface-elevated text-foreground",
  success: "border-success/20 bg-success/10 text-foreground",
  warning: "border-warning/20 bg-warning/10 text-foreground",
  error: "border-error/20 bg-error/10 text-foreground",
} as const;

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : `toast-${Date.now()}`;
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      setToasts((currentToasts) =>
        currentToasts.map((toast) =>
          toast.id === id ? { ...toast, open: false } : toast,
        ),
      );

      window.setTimeout(() => removeToast(id), 180);
    },
    [removeToast],
  );

  const toast = useCallback(
    ({ variant = "info", duration = 4200, ...payload }: ToastPayload) => {
      const id = createToastId();

      setToasts((currentToasts) => [
        {
          id,
          open: true,
          variant,
          duration,
          ...payload,
        },
        ...currentToasts,
      ]);

      return id;
    },
    [],
  );

  const value = useMemo(() => ({ toast, dismiss }), [dismiss, toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map(
          ({ id, title, description, action, duration, variant = "info", open }) => (
            <ToastPrimitive.Root
              key={id}
              open={open}
              duration={duration}
              onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                  dismiss(id);
                }
              }}
              className={cn(
                "grid gap-1 rounded-2xl border p-4 shadow-lifted",
                toastVariantClasses[variant],
              )}
            >
              <ToastPrimitive.Title className="text-sm font-semibold">
                {title}
              </ToastPrimitive.Title>
              {description ? (
                <ToastPrimitive.Description className="text-sm text-muted-foreground">
                  {description}
                </ToastPrimitive.Description>
              ) : null}
              {action ? <div className="mt-2">{action}</div> : null}
            </ToastPrimitive.Root>
          ),
        )}
        <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-[var(--z-toast)] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
