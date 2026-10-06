import { expect, test } from "@playwright/test";

const PREVIEW = "/preview/v2";

test("la recherche reste honnête et prépare le passage vers l’application", async ({ page }) => {
  await page.goto(PREVIEW);
  await page.getByLabel("Destination", { exact: true }).selectOption("Paris");
  await page.getByRole("button", { name: "Rechercher un trajet", exact: true }).click();
  await expect(page.locator("#search-error:visible")).toContainText("différente");
  await expect(page.getByRole("link", { name: "Continuer dans l’application" })).toHaveCount(0);

  await page.getByLabel("Destination", { exact: true }).selectOption("Abidjan");
  await page.getByRole("button", { name: "Rechercher un trajet", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Paris → Abidjan");
  await expect(page.getByRole("status")).toContainText("saisissez ce trajet");
  await expect(page.getByRole("link", { name: "Continuer dans l’application" })).toHaveAttribute("href", /apps\.apple\.com/);

  await page.getByRole("button", { name: "Inverser le départ et la destination" }).click();
  await expect(page.getByLabel("Départ", { exact: true })).toHaveValue("Abidjan");
  await expect(page.getByLabel("Destination", { exact: true })).toHaveValue("Paris");
  await expect(page.getByRole("status")).toBeEmpty();
});

test("les CTA et la recherche produisent une seule mesure par action", async ({ page }) => {
  // Le consentement peut installer gtag après l'init : vérifier la file commune,
  // sans contacter les régies, fonctionne avec GA4 direct comme avec GTM.
  await page.route("https://**/*", (route) => route.abort());
  await page.addInitScript(() => {
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
  });
  await page.goto(PREVIEW);
  await page.getByRole("link", { name: "Envoyer un colis", exact: true }).first().click();
  await page.getByLabel("Départ", { exact: true }).focus();
  await page.getByLabel("Destination", { exact: true }).selectOption("Dakar");
  await page.getByRole("button", { name: "Rechercher un trajet", exact: true }).click();
  const events = await page.evaluate(() => {
    const entries = (window as unknown as { dataLayer: unknown[] }).dataLayer;
    return entries.flatMap((entry) => {
      const candidate = entry as { 0?: string; 1?: string; 2?: Record<string, unknown>; event?: string };
      if (candidate[0] === "event" && typeof candidate[1] === "string") {
        return [{ name: candidate[1], params: candidate[2] ?? {} }];
      }
      if (typeof candidate.event === "string") {
        return [{ name: candidate.event, params: entry as Record<string, unknown> }];
      }
      return [];
    });
  });
  expect(events.filter((entry) => entry.name === "cta_clicked" && entry.params.cta === "v2-hero-sender")).toHaveLength(1);
  expect(events.filter((entry) => entry.name === "route_started")).toHaveLength(1);
  expect(events.filter((entry) => entry.name === "route_completed")).toHaveLength(1);
  expect(events.find((entry) => entry.name === "route_completed")?.params).toMatchObject({ origin: "Paris", destination: "Dakar", preview: true, landing_variant: "v2" });
  expect(events.filter((entry) => entry.name === "prelaunch_success")).toHaveLength(0);
});

test("la preview est lisible au clavier et sans débordement de 320 à 1440 px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PREVIEW);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Aller au contenu" })).toBeFocused();
  for (const width of [320, 360, 390, 430, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const cta = await page.getByRole("link", { name: "Envoyer un colis", exact: true }).first().boundingBox();
    expect(cta?.height).toBeGreaterThanOrEqual(44);
    if (width <= 430) expect((cta?.y ?? 900) + (cta?.height ?? 0)).toBeLessThan(650);
  }
  const summary = page.locator("#faq summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#faq details").first()).toHaveAttribute("open", "");
});

test("la route est rendue par le serveur, hors index, et les données B2B sont signalées", async ({ page, request }) => {
  const response = await request.get(PREVIEW);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("Vos colis voyagent.");
  expect(html).toMatch(/name="robots" content="noindex, nofollow"/);
  expect(html).toContain("/preview/v2");
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/preview/v2");
  await page.goto(PREVIEW);
  const business = page.locator("#entreprises:visible");
  await expect(business.getByText("DÉMONSTRATION", { exact: true })).toBeVisible();
  await expect(business.getByText("Toutes les valeurs de cette carte sont des données de démonstration.")).toBeVisible();
  await expect(business.locator("progress")).toHaveAttribute("max", "10");
  await expect(business).not.toContainText("60 jours");
  await expect(page.getByRole("link", { name: "Comparer à l’actuelle" })).toHaveAttribute("href", "/");
});
