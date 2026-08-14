import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { AuthenticatedUser } from "@/lib/auth/auth.types";

import { AccountUserProvider, useAccountUser } from "./account-user-provider";

const user: AuthenticatedUser = {
  id: "user-1",
  firstName: "Aïcha",
  lastName: "Diallo",
  fullName: "Aïcha Diallo",
  email: "aicha@example.com",
  phone: null,
  preferredLanguage: "fr",
  timezone: "Europe/Paris",
  status: "active",
  emailVerified: true,
  phoneVerified: false,
  identityVerified: true,
  profilePictureUrl: null,
  permissions: [],
};

function Consumer() {
  const { user: current, updateProfilePicture } = useAccountUser();
  return (
    <button type="button" onClick={() => updateProfilePicture("https://media/photo.jpg")}>
      {current.profilePictureUrl ?? "Aucune photo"}
    </button>
  );
}

describe("compte partagé dans le layout", () => {
  it("diffuse immédiatement la nouvelle photo à tous les avatars abonnés", async () => {
    const visitor = userEvent.setup();
    render(
      <AccountUserProvider initialUser={user}>
        <Consumer />
      </AccountUserProvider>,
    );

    await visitor.click(screen.getByRole("button", { name: "Aucune photo" }));

    expect(
      screen.getByRole("button", { name: "https://media/photo.jpg" }),
    ).toBeInTheDocument();
  });
});
