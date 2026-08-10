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

test("the parcel story stays readable and contained at every breakpoint", async ({ page }) => {
  await page.goto("/#fonctionnement");

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    const section = page.locator("#fonctionnement");
    await section.scrollIntoViewIfNeeded();

    await expect(
      section.getByRole("heading", {
        level: 2,
        name: "Un colis. Un voyage. Une personne qui l’attend.",
      }),
    ).toBeVisible();
    await expect(section.getByRole("article")).toHaveCount(4);

    for (const image of await section.getByRole("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      await expect
        .poll(() => image.evaluate((element) => (element as HTMLImageElement).complete))
        .toBe(true);
    }

    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      overflowingElements: Array.from(document.querySelectorAll("#fonctionnement *")).filter(
        (element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < -1 || rect.right > window.innerWidth + 1;
        },
      ).length,
    }));

    expect(layout.documentWidth).toBe(layout.viewportWidth);
    expect(layout.overflowingElements).toBe(0);
  }
});

test("the story remains complete with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#fonctionnement");
  await waitForHydration(page);

  const section = page.locator("#fonctionnement:visible");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("article")).toHaveCount(4);
  const senderCta = section.getByRole("link", { name: "Trouver un voyageur" });
  const travelerCta = section.getByRole("link", { name: "Proposer mon trajet" });
  await expect(senderCta).toBeVisible();

  await senderCta.focus();
  await expect(senderCta).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(travelerCta).toBeFocused();

  const animatedElements = section.locator("article h3, article img");
  const animationNames = await animatedElements.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).animationName),
  );

  expect(animationNames.every((name) => name === "none")).toBe(true);
});

test("the orange route becomes continuous as the story advances", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await waitForHydration(page);

  const timeline = page.locator("[data-story-timeline]");
  const progressRoute = page.locator('[data-story-route="progress"]');

  const timelineMetrics = await timeline.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top + window.scrollY, height: rect.height };
  });

  await page.evaluate((top) => window.scrollTo({ top, behavior: "auto" }), timelineMetrics.top - 500);
  await page.waitForTimeout(100);
  const beginning = Number.parseFloat(
    await progressRoute.evaluate((element) => getComputedStyle(element).strokeDashoffset),
  );

  await page.evaluate(
    ({ top, height }) => window.scrollTo({ top: top + height * 0.72, behavior: "auto" }),
    timelineMetrics,
  );
  await page.waitForTimeout(100);
  const advanced = Number.parseFloat(
    await progressRoute.evaluate((element) => getComputedStyle(element).strokeDashoffset),
  );

  expect(advanced).toBeLessThan(beginning);
});

test("the English story remains contained on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const languageTrigger = page.getByRole("button", { name: "Choisir la langue" });
  await expect
    .poll(() =>
      languageTrigger.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactProps")),
      ),
    )
    .toBe(true);
  await languageTrigger.focus();
  await page.keyboard.press("Enter");
  const englishOption = page.getByRole("menuitem", { name: "English" });
  await expect(englishOption).toBeVisible();
  await englishOption.click();

  const section = page.locator("#fonctionnement");
  await section.scrollIntoViewIfNeeded();
  await expect(
    section.getByRole("heading", {
      level: 2,
      name: "One parcel. One journey. Someone waiting for it.",
    }),
  ).toBeVisible();

  const aboutSection = page.locator("#trust");
  await aboutSection.scrollIntoViewIfNeeded();
  await expect(
    aboutSection.getByRole("heading", {
      level: 2,
      name: "What connects us deserves more than a simple delivery.",
    }),
  ).toBeVisible();

  const footer = page.locator("footer#help");
  await footer.scrollIntoViewIfNeeded();
  await expect(
    footer.getByRole("heading", {
      level: 2,
      name: "One journey can bring two lives closer.",
    }),
  ).toBeVisible();

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));

  expect(layout.documentWidth).toBe(layout.viewportWidth);
});
