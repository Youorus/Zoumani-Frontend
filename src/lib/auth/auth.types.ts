export type UserRole = "admin" | "traveler" | "sender" | "support";

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface SessionSnapshot {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthenticatedUser | null;
  status: "anonymous" | "authenticated" | "refreshing";
}
