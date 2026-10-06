import { expect, test, type Page } from "@playwright/test";

const photoFrame = (page: Page) => page.locator("figure[data-hero-photo]:visible");

async function imageReady(page: Page, id: string) {
  await expect.poll(() => photoFrame(page).locator(`img[data-photo="${id}"]`).evaluate(
    (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
  )).toBe(true);
}

async function freezeClock(page: Page) {
  const time = await page.evaluate(() => Date.now() + 1_000);
  await page.clock.pauseAt(time);
}

test("les quatre photos tournent toutes les cinq secondes et le bouton pause fonctionne", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto("/");
  const frame = photoFrame(page);
  await expect(frame).toHaveAttribute("data-hero-photo", "sourire-pagne");
  await imageReady(page, "trois-generations");
  await frame.getByRole("button", { name: "Mettre les photos en pause" }).click();
  await freezeClock(page);
  await frame.getByRole("button", { name: "Reprendre le défilement des photos" }).click({ force: true });
  await page.clock.runFor(4_999);
  await expect(frame).toHaveAttribute("data-hero-photo", "sourire-pagne");
  await page.clock.runFor(30);
  await expect(frame).toHaveAttribute("data-hero-photo", "trois-generations");

  await frame.getByRole("button", { name: "Mettre les photos en pause" }).click({ force: true });
  await page.clock.runFor(15_000);
  await expect(frame).toHaveAttribute("data-hero-photo", "trois-generations");
  await frame.getByRole("button", { name: "Reprendre le défilement des photos" }).click({ force: true });
  for (const id of ["ouverture-colis", "lien-video", "sourire-pagne"]) {
    await imageReady(page, id);
    const before = await frame.boundingBox();
    await page.clock.runFor(5_050);
    await expect(frame).toHaveAttribute("data-hero-photo", id);
    expect((await frame.boundingBox())?.height).toBe(before?.height);
  }
});

test("le mouvement réduit garde une seule photo, rendue aussi sans JavaScript", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('data-hero-photo="sourire-pagne"');
  expect(html).toContain("zoumani-sourire-pagne.webp");
  expect(html).toContain("Envoyez vos colis.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  const frame = photoFrame(page);
  await imageReady(page, "sourire-pagne");
  await freezeClock(page);
  await page.clock.runFor(30_000);
  await expect(frame).toHaveAttribute("data-hero-photo", "sourire-pagne");
  await expect(frame.locator("img[data-photo]")).toHaveCount(1);
  await expect(frame.locator("button")).toBeHidden();
  await expect(frame.locator("img[data-photo]")).toHaveCSS("transition-duration", "0s");
});

test("une photo indisponible ne remplace pas la photo déjà chargée", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("url")?.includes("zoumani-trois-generations")) return route.abort();
    return route.continue();
  });
  await page.clock.install();
  await page.goto("/");
  const frame = photoFrame(page);
  await imageReady(page, "sourire-pagne");
  await expect(frame.locator('img[data-photo="trois-generations"]')).toHaveCount(1);
  await freezeClock(page);
  await page.clock.runFor(15_000);
  await expect(frame).toHaveAttribute("data-hero-photo", "sourire-pagne");
  await expect(frame.locator('img[data-photo="sourire-pagne"]')).toHaveAttribute("data-active", "true");
  await imageReady(page, "sourire-pagne");
});
