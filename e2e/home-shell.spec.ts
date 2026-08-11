import { expect, test, type Page } from "@playwright/test";

const waitForHydration = async (page: Page) => {
  const languageTrigger = page.getByRole("button", { name: "Choisir la langue" });

  await expect
    .poll(() =>
      languageTrigger.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactProps")),
      ),
    )
    .toBe(true);
};

test("the main navigation remains fixed while the page scrolls", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);

  const navigation = page.locator("[data-home-navigation]:visible");
  await expect(navigation).toHaveCSS("position", "fixed");

  await page.locator("#trust:visible").scrollIntoViewIfNeeded();
  await expect(navigation).toHaveAttribute("data-scrolled", "true");

  const bounds = await navigation.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds?.y).toBeGreaterThanOrEqual(0);

  const isTopmost = await navigation.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const topElement = document.elementFromPoint(rect.left + rect.width / 2, rect.top + 24);
    return Boolean(topElement?.closest("[data-home-navigation]"));
  });
  expect(isTopmost).toBe(true);
});

test("the footer and WhatsApp contact stay usable across breakpoints", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);

  const footer = page.locator("footer#help:visible");
  const whatsapp = page.getByRole("link", { name: "Contacter Zoumani sur WhatsApp" });

  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1440, height: 960 },
  ]) {
    await page.setViewportSize(viewport);
    await footer.scrollIntoViewIfNeeded();

    await expect(
      footer.getByRole("heading", { level: 2, name: "Un trajet peut rapprocher deux vies." }),
    ).toBeVisible();
    await expect(footer.getByRole("navigation")).toHaveCount(2);
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute("href", /https:\/\/wa\.me\/.*text=/);

    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));

    expect(layout.documentWidth).toBe(layout.viewportWidth);
  }
});
