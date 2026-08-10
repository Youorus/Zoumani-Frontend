"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";

import { ToastProvider } from "@/components/ui/toast";
import { tripRealtimeHandlers } from "@/features/trips/realtime/trip-realtime-handlers";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { getQueryClient } from "@/lib/query/query-client";
import { RealtimeProvider } from "@/lib/realtime/realtime-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";

export function AppProviders({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <RealtimeProvider handlers={tripRealtimeHandlers}>{children}</RealtimeProvider>
          </ToastProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
