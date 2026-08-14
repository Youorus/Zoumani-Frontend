"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { AuthenticatedUser } from "@/lib/auth/auth.types";

interface AccountUserContextValue {
  user: AuthenticatedUser;
  updateProfilePicture: (url: string | null) => void;
}

const AccountUserContext = createContext<AccountUserContextValue | null>(null);

/** Source de vérité client du compte affiché dans tout l'espace connecté. */
export function AccountUserProvider({
  initialUser,
  children,
}: {
  initialUser: AuthenticatedUser;
  children: ReactNode;
}) {
  const [user, setUser] = useState(initialUser);

  return (
    <AccountUserContext.Provider
      value={{
        user,
        updateProfilePicture: (profilePictureUrl) =>
          setUser((current) => ({ ...current, profilePictureUrl })),
      }}
    >
      {children}
    </AccountUserContext.Provider>
  );
}

export function useAccountUser(): AccountUserContextValue {
  const value = useContext(AccountUserContext);
  if (!value) {
    throw new Error("useAccountUser doit être utilisé dans AccountUserProvider.");
  }
  return value;
}
