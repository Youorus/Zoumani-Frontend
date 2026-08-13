"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { RealtimeEvent, RealtimeEventHandler } from "./events";
import { realtimeClient } from "./realtime-client";

interface RealtimeContextValue {
  emitLocalEvent: (event: Omit<RealtimeEvent, "source" | "occurredAt">) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

interface RealtimeProviderProps extends PropsWithChildren {
  handlers?: RealtimeEventHandler[];
}

export function RealtimeProvider({ children, handlers = [] }: RealtimeProviderProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = realtimeClient.subscribe((event) => {
      handlers
        .filter((handler) => handler.type === event.type)
        .forEach((handler) => handler.handle({ event, queryClient }));
    });

    return unsubscribe;
  }, [handlers, queryClient]);

  const value = useMemo(
    () => ({
      emitLocalEvent: (event: Omit<RealtimeEvent, "source" | "occurredAt">) => {
        realtimeClient.emit({
          ...event,
          source: "local",
          occurredAt: new Date().toISOString(),
        });
      },
    }),
    [],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider.");
  }

  return context;
}
