import { describe, expect, it } from "vitest";

import { can, canAny, toAuthenticatedUser, type RawCurrentUser } from "../auth.types";

const raw: RawCurrentUser = {
  id: "f7d8c2a1-0000-4000-8000-000000000001",
  first_name: "Aïcha",
  last_name: "Diallo",
  full_name: "Aïcha Diallo",
  email: "aicha@example.com",
  phone: "+237699123456",
  preferred_language: "fr",
  timezone: "Africa/Douala",
  status: "active",
  email_verified: true,
  phone_verified: false,
  identity_verified: true,
  profile_picture_url: null,
  permissions: ["trips:read", "users:read"],
};

describe("conversion du contrat de l'API", () => {
  it("traduit le snake_case en une seule fois", () => {
    // La conversion vit à un seul endroit : sans cela, chaque composant
    // choisirait sa convention et l'on trouverait `identity_verified` ici,
    // `identityVerified` là.
    const user = toAuthenticatedUser(raw);

    expect(user.fullName).toBe("Aïcha Diallo");
    expect(user.identityVerified).toBe(true);
    expect(user.preferredLanguage).toBe("fr");
  });

  it("ne fabrique aucun rôle", () => {
    // AGENTS.md §9 : le rôle n'est pas un attribut de la personne. Un
    // `role` réintroduirait côté client l'erreur que le backend s'interdit.
    const user = toAuthenticatedUser(raw);

    expect(user).not.toHaveProperty("role");
    expect(Object.keys(user)).not.toContain("isAdmin");
  });

  it("ne transporte aucun jeton", () => {
    // Les jetons vivent dans des cookies httpOnly. En faire transiter un
    // par l'état React le rendrait lisible par toute dépendance npm.
    const user = toAuthenticatedUser(raw);
    const serialized = JSON.stringify(user);

    expect(serialized).not.toContain("token");
  });
});

describe("permissions", () => {
  const user = toAuthenticatedUser(raw);

  it("reconnaît une permission détenue", () => {
    expect(can(user, "trips:read")).toBe(true);
  });

  it("refuse une permission absente", () => {
    expect(can(user, "trips:decide")).toBe(false);
  });

  it("traite l'anonyme comme dépourvu de tout droit", () => {
    expect(can(null, "trips:read")).toBe(false);
    expect(canAny(null, ["trips:read", "users:read"])).toBe(false);
  });

  it("accepte qu'une seule permission suffise", () => {
    expect(canAny(user, ["trips:decide", "users:read"])).toBe(true);
  });

  it("refuse quand aucune ne correspond", () => {
    expect(canAny(user, ["trips:decide", "trips:review"])).toBe(false);
  });
});
