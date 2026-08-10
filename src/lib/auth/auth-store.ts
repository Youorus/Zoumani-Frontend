import { create } from "zustand";

import type { AuthenticatedUser, SessionSnapshot } from "./auth.types";

interface AuthStore extends SessionSnapshot {
  setSession: (payload: {
    accessToken: string;
    refreshToken?: string | null;
    user: AuthenticatedUser;
  }) => void;
  setRefreshing: () => void;
  clearSession: () => void;
}

const initialState: SessionSnapshot = {
  accessToken: null,
  refreshToken: null,
  user: null,
  status: "anonymous",
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  setSession: ({ accessToken, refreshToken = null, user }) =>
    set({
      accessToken,
      refreshToken,
      user,
      status: "authenticated",
    }),
  setRefreshing: () => set({ status: "refreshing" }),
  clearSession: () => set(initialState),
}));
