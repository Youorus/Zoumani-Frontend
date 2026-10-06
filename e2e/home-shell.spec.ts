import { expect, test, type Page } from "@playwright/test";

const LARGEURS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 900 },
  { width: 1440, height: 960 },
] as const;

const attendreHydratation = async (page: Page) => {
  const selecteurLangue = page.getByRole("button", { name: "Choisir la langue" });

  await expect
    .poll(() =>
      selecteurLangue.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactProps")),
      ),
    )
    .toBe(true);
};

test("la page enchaîne ses quatre sections et son pied de page", async ({ page }) => {
  await page.goto("/");

  for (const identifiant of ["#telecharger", "#partenaires", "#fonctionnement", "#faq"]) {
    await expect(page.locator(`${identifiant}:visible`)).toHaveCount(1);
  }

  await expect(
    page.getByRole("heading", { level: 1, name: /Envoyez vos colis/ }),
  ).toBeVisible();
  await expect(
    page.locator("footer").getByRole("heading", {
      level: 2,
      name: "Votre colis part avec le prochain voyageur.",
    }),
  ).toBeVisible();
});

test("la barre de navigation reste fixe et s'opacifie au défilement", async ({ page }) => {
  await page.goto("/");
  await attendreHydratation(page);

  const navigation = page.locator("[data-home-navigation]:visible");
  await expect(navigation).toHaveCSS("position", "fixed");
  await expect(navigation).toHaveAttribute("data-scrolled", "false");

  await page.locator("#faq:visible").scrollIntoViewIfNeeded();
  await expect(navigation).toHaveAttribute("data-scrolled", "true");

  // Elle doit rester au-dessus du contenu qu'elle survole : c'est tout
  // l'intérêt d'être fixe.
  const auPremierPlan = await navigation.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const dessus = document.elementFromPoint(rect.left + rect.width / 2, rect.top + 24);
    return Boolean(dessus?.closest("[data-home-navigation]"));
  });
  expect(auPremierPlan).toBe(true);
});

test("les onglets de « Comment ça marche » échangent les deux parcours", async ({ page }) => {
  await page.goto("/");
  await attendreHydratation(page);

  const section = page.locator("#fonctionnement:visible");
  await section.scrollIntoViewIfNeeded();

  const expediteur = section.getByRole("tab", { name: "J’envoie un colis" });
  const voyageur = section.getByRole("tab", { name: "Je voyage" });

  await expect(expediteur).toHaveAttribute("aria-selected", "true");
  await expect(
    section.getByRole("heading", { level: 3, name: "Décrivez votre envoi" }),
  ).toBeVisible();

  await voyageur.click();
  await expect(voyageur).toHaveAttribute("aria-selected", "true");
  await expect(
    section.getByRole("heading", { level: 3, name: "Publiez votre voyage" }),
  ).toBeVisible();
  await expect(
    section.getByRole("heading", { level: 3, name: "Décrivez votre envoi" }),
  ).toBeHidden();

  // Les flèches parcourent le groupe : c'est ce qu'attend un lecteur
  // d'écran d'un `tablist`, et la tabulation en sort.
  await voyageur.press("ArrowLeft");
  await expect(expediteur).toBeFocused();
  await expect(expediteur).toHaveAttribute("aria-selected", "true");
});

test("les réponses de la FAQ sont dans le HTML servi, dépliées ou non", async ({
  request,
}) => {
  // Lu sans navigateur : c'est ce que reçoit un robot qui n'exécute pas de
  // JavaScript. Une réponse repliée doit être dans le document, sinon la
  // section ne pèse rien pour le référencement.
  const html = await (await request.get("/")).text();

  expect(html).toContain("Zoumani est une application de cotransportage");
  expect(html).toContain("Jamais avant la remise.");
  expect((html.match(/<details/g) ?? []).length).toBe(10);
});

test("la FAQ déplie ses réponses une à une", async ({ page }) => {
  await page.goto("/");

  const section = page.locator("#faq:visible");
  const premiere = section.locator("details").first();
  await expect(premiere).toHaveAttribute("open", "");
  await expect(premiere.locator("p")).toBeVisible();

  const deuxieme = section.locator("details").nth(1);
  await expect(deuxieme.locator("p")).toBeHidden();
  await deuxieme.locator("summary").click();
  await expect(deuxieme.locator("p")).toBeVisible();
});

test("les questions affichées sont exactement celles du JSON-LD", async ({ page }) => {
  await page.goto("/");

  // `:visible` : pendant l'hydratation, le document porte brièvement deux
  // copies de la section — celle que React vient d'insérer et le fragment
  // encore masqué dont il l'a tirée. Sans ce filtre, on compte les deux.
  const affichees = await page
    .locator("#faq:visible details summary span")
    .allTextContents();
  const balisees = await page.evaluate(() => {
    const graphes = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).map((n) => JSON.parse(n.textContent ?? "{}"));
    const noeuds = graphes.flatMap((g) => g["@graph"] ?? []);
    const faq = noeuds.find((n) => n["@type"] === "FAQPage");
    return (faq?.mainEntity ?? []).map((q: { name: string }) => q.name);
  });

  expect(balisees).toEqual(affichees);
});

test("WhatsApp reste joignable, et rien ne déborde en largeur", async ({ page }) => {
  await page.goto("/");
  await attendreHydratation(page);

  const whatsapp = page
    .getByRole("link", { name: "Contacter Zoumani sur WhatsApp" })
    .first();

  for (const largeur of LARGEURS) {
    await page.setViewportSize(largeur);

    await page.locator("#faq:visible").scrollIntoViewIfNeeded();
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute("href", /https:\/\/wa\.me\/.*text=/);

    const mise_en_page = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      fenetre: document.documentElement.clientWidth,
    }));

    expect(mise_en_page.document).toBe(mise_en_page.fenetre);
  }
});

test("le passage à l'anglais traduit toute la page", async ({ page }) => {
  await page.goto("/");
  await attendreHydratation(page);

  await page.getByRole("button", { name: "Choisir la langue" }).click();
  await page.getByRole("menuitem", { name: "English" }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: /Send your parcels/ }),
  ).toBeVisible();
  await expect(page.locator("#telecharger").getByRole("link", { name: "Download on the App Store" })).toHaveAttribute("href", /apps\.apple\.com/);
  await expect(page.locator("#telecharger")).toContainText("EXAMPLE ROUTE");
  await expect(
    page.locator("#fonctionnement").getByRole("tab", { name: "I’m travelling" }),
  ).toBeVisible();
  await expect(
    page.locator("footer").getByRole("heading", {
      level: 2,
      name: "Your parcel leaves with the next traveller.",
    }),
  ).toBeVisible();
});


test("le Hero conserve les téléchargements directs, les corridors et une seule mesure par clic", async ({ page }) => {
  await page.route("https://**/*", (route) => route.abort());
  await page.addInitScript(() => {
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
  });
  await page.goto("/");
  await attendreHydratation(page);
  const hero = page.locator("#telecharger:visible");
  const apple = hero.getByRole("link", { name: /App Store/ });
  await expect(apple).toHaveAttribute("href", /apps\.apple\.com\/fr\/app\/zoumani\/id6803543420/);
  const playBadge = hero.getByRole("img", { name: "Disponible sur Google Play" });
  await expect(playBadge).toBeVisible();
  const playLink = hero.locator('[data-cta="hero-stores-play"]');
  if (await playLink.count()) {
    await expect(playLink).toHaveAttribute("href", /play\.google\.com/);
  } else {
    await expect(playBadge.locator('..')).toHaveAttribute("aria-disabled", "true");
    await expect(hero.getByText("Bientôt", { exact: true })).toBeVisible();
  }
  for (const width of [320, 390, 430, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    expect((await apple.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  const corridors = hero.locator("ul li:not([aria-hidden=true])");
  await expect(corridors).toHaveCount(34);
  await expect(corridors.first()).toHaveText("Paris → Dakar");
  await expect(corridors.last()).toHaveText("Rome → Addis-Abeba");
  const ticker = hero.locator("ul.marquee");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(ticker).toHaveCSS("animation-name", "marquee");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(ticker).toHaveCSS("animation-name", "none");
  const popupPromise = page.waitForEvent("popup");
  await apple.click();
  const popup = await popupPromise;
  await popup.close();
  const events = await page.evaluate(() => {
    return (window as unknown as { dataLayer: unknown[] }).dataLayer.flatMap((entry) => {
      const candidate = entry as { 0?: string; 1?: string; 2?: Record<string, unknown>; event?: string };
      if (candidate[0] === "event" && candidate[1] === "cta_clicked") return [candidate[2] ?? {}];
      if (candidate.event === "cta_clicked") return [entry as Record<string, unknown>];
      return [];
    });
  });
  expect(events.filter((entry) => entry.cta === "hero-stores-apple")).toHaveLength(1);
});
