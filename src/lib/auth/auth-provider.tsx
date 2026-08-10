"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";

import { configureAuthInterceptor } from "@/lib/api/auth-interceptor";

import { useAuthStore } from "./auth-store";

export function AuthProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    configureAuthInterceptor(() => useAuthStore.getState().accessToken);
  }, []);

  return children;
}
