import { expect, test } from "@playwright/test";

test("a landing search opens the animated journey results", async ({ page }) => {
  await page.goto("/");

  const searchButton = page.getByRole("button", { name: "Rechercher un voyage" });
  await expect(searchButton).toBeVisible();
  await searchButton.click();

  await expect(page).toHaveURL(/\/search\?from=paris&to=abidjan&weight=1&lang=fr/);
  await expect(page.locator("[data-search-loading]")).toBeVisible();
  await expect(page.locator("[data-search-result]")).toHaveCount(3, { timeout: 10_000 });
  await expect(
    page.getByRole("heading", { level: 1, name: "3 voyageurs pour votre colis" }),
  ).toBeVisible();
});

test("an empty route offers a no-account alert and preserves context for signup", async ({ page }) => {
  await page.goto("/search?from=paris&to=nairobi&weight=2&lang=fr");

  await expect(page.locator("[data-search-empty]")).toBeVisible({ timeout: 10_000 });
  await page.getByLabel("Adresse email").fill("amina@example.com");
  await page.getByLabel("Numéro de téléphone").fill("+33 6 12 34 56 78");
  await page.getByLabel("J’accepte d’être contacté uniquement pour cette recherche.").click();
  await page.getByRole("button", { name: "Créer mon alerte" }).click();
  await expect(page.getByRole("heading", { name: "Votre alerte est en route." })).toBeVisible();

  await page.getByRole("link", { name: "Créer mon compte expéditeur" }).click();
  await expect(page).toHaveURL(/\/signup\?.*role=sender/);
  await expect(page).toHaveURL(/from=paris/);
  await expect(page).toHaveURL(/to=nairobi/);
  await expect(page.locator('[data-signup-role="sender"]:visible')).toBeVisible();
  await expect(page.getByText("Paris, France → Nairobi, Kenya · 2 kg")).toBeVisible();
});

test("one account screen adapts from traveler to sender", async ({ page }) => {
  await page.goto("/signup?role=traveler&lang=fr");

  await expect(page.locator('[data-signup-role="traveler"]:visible')).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Voyagez comme prévu. Gagnez en rendant service." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Créer mon compte voyageur" })).toBeVisible();

  await page.getByRole("button", { name: "Envoyer un colis" }).click();
  await expect(page).toHaveURL(/role=sender/);
  await expect(page.locator('[data-signup-role="sender"]:visible')).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Envoyez sereinement. Gardez chaque étape à portée de main." }),
  ).toBeVisible();
});

test("search and signup screens stay contained on mobile and desktop", async ({ page }) => {
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1440, height: 960 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/search?from=paris&to=abidjan&weight=1&lang=fr");
    await expect(page.locator("[data-search-result]").first()).toBeVisible({ timeout: 10_000 });

    const searchLayout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(searchLayout.documentWidth).toBe(searchLayout.viewportWidth);

    await page.goto("/signup?role=sender&lang=fr");
    await expect(page.locator('[data-signup-role="sender"]:visible')).toBeVisible();
    const signupLayout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(signupLayout.documentWidth).toBe(signupLayout.viewportWidth);
  }
});
