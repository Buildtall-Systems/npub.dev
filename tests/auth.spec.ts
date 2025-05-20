import { test, expect } from "@playwright/test";

test("shows confirmation after nip07 login", async ({ page }) => {
  await page.addInitScript(() => {
    window.nostr = { getPublicKey: async () => "pub" };
  });
  await page.goto("/");
  await page.getByRole("button", { name: /use nip-07/i }).click();
  await expect(page.getByRole("button", { name: /continue as/ })).toBeVisible();
});

test("status bar appears after continue", async ({ page }) => {
  await page.addInitScript(() => {
    window.nostr = { getPublicKey: async () => "pub" };
  });
  await page.goto("/");
  await page.getByRole("button", { name: /use nip-07/i }).click();
  await page.getByRole("button", { name: /continue/ }).click();
  await expect(page.getByTestId("status-bar")).toBeVisible();
  await expect(page.getByTestId("main-panel")).toBeVisible();
  await expect(page.getByTestId("json-viewer")).toBeVisible();
});
