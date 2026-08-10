import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1440, height: 960 },
] as const;

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

test("the About manifesto remains expressive and contained", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    const section = page.locator("#trust:visible");
    await section.scrollIntoViewIfNeeded();

    await expect(
      section.getByRole("heading", {
        level: 2,
        name: "Ce qui nous relie mérite mieux qu’un simple envoi.",
      }),
    ).toBeVisible();
    await expect(section.getByRole("article")).toHaveCount(3);

    const palette = await section.evaluate((element) => {
      const rootStyles = getComputedStyle(document.documentElement);
      return {
        background: getComputedStyle(element).backgroundColor,
        inverseSurface: rootStyles.getPropertyValue("--inverse-surface").trim(),
      };
    });
    expect(palette.background).not.toBe(palette.inverseSurface);

    const image = section.getByRole("img");
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(
        () =>
          image.evaluate((element) => {
            const imageElement = element as HTMLImageElement;
            return imageElement.complete && imageElement.naturalWidth > 0;
          }),
        { timeout: 15_000 },
      )
      .toBe(true);

    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      overflowingElements: Array.from(document.querySelectorAll("#trust *")).filter((element) => {
        if (element.closest("[data-about-decoration]")) return false;
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > window.innerWidth + 1;
      }).length,
    }));

    expect(layout.documentWidth).toBe(layout.viewportWidth);
    expect(layout.overflowingElements).toBe(0);
  }
});

test("the About manifesto is complete with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await waitForHydration(page);

  const section = page.locator("#trust:visible");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("article")).toHaveCount(3);

  const animationNames = await section.locator("figure, article").evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).animationName),
  );

  expect(animationNames.every((name) => name === "none")).toBe(true);
});
