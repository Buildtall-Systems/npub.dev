import { test, expect } from "@playwright/test";

test("publish triggers animation", async ({ page }) => {
  await page.addInitScript(() => {
    window.nostr = { getPublicKey: async () => "pub" };
  });
  await page.goto("/");
  await page.getByRole("button", { name: /use nip-07/i }).click();
  await page.getByRole("button", { name: /continue/ }).click();
  const viewer = page.getByTestId("json-viewer");
  await page.getByTestId("publish").click();
  await expect(viewer).toHaveClass(/animate-ping/);
});
