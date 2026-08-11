import type { HomeLanguage } from "@/features/home/components/home-content";

import type { AccountRole } from "../types/account-role";

interface SignupContext {
  intent?: "shipment";
  from?: string;
  to?: string;
  weight?: string;
  trip?: string;
}

export function buildSignupHref(
  role: AccountRole,
  language: HomeLanguage,
  context: SignupContext = {},
) {
  return {
    pathname: "/signup" as const,
    query: { role, lang: language, ...context },
  };
}
