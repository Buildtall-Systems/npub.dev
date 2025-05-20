import { test, expect } from "@playwright/test";

test("shows confirmation after nip07 login", async ({ page }) => {
  await page.addInitScript(() => {
    window.nostr = { getPublicKey: async () => "pub" };
  });
  await page.goto("/");
  await page.getByRole("button", { name: /use nip-07/i }).click();
  await expect(page.getByRole("button", { name: /continue as/ })).toBeVisible();
});
