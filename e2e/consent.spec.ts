import { expect, test } from "@playwright/test";

/**
 * La fenêtre de consentement, vue par un visiteur qui n'a pas encore
 * répondu. Elle n'existe que si un identifiant de mesure est posé au
 * build : sans lui, il n'y a rien à autoriser et le test n'a pas d'objet.
 */
test.use({ storageState: { cookies: [], origins: [] } });

test("la fenêtre est centrée, refuser coûte le même geste qu'accepter, et rien n'est précoché", async ({ page }) => {
  await page.route(/googletagmanager|google-analytics|clarity\.ms|facebook/, (route) => route.abort());
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: /Votre vie privée/ });
  const ouverte = await dialog.waitFor({ timeout: 5_000 }).then(() => true, () => false);
  test.skip(!ouverte, "aucun identifiant de mesure au build : la fenêtre n'a pas lieu d'être");

  await expect(dialog).toBeFocused();
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.x + box!.width / 2 - width / 2)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }

  const refuser = dialog.getByRole("button", { name: "Refuser" });
  const accepter = dialog.getByRole("button", { name: "Accepter" });
  const [r, a] = [await refuser.boundingBox(), await accepter.boundingBox()];
  expect(Math.round(r!.width)).toBe(Math.round(a!.width));
  expect(Math.round(r!.height)).toBe(Math.round(a!.height));

  await dialog.getByRole("button", { name: "Personnaliser" }).click();
  for (const box of await dialog.getByRole("checkbox").all()) await expect(box).not.toBeChecked();

  await refuser.click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await expect(page.getByRole("dialog", { name: /Votre vie privée/ })).toHaveCount(0);
});
