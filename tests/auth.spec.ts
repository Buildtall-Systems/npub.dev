import { test, expect } from "@playwright/test";

test("shows confirmation after nip07 login", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).nostr = { getPublicKey: async () => "pub" };
  });
  await page.goto("/");
  await page.getByRole("button", { name: /use nip-07/i }).click();
  await expect(page.getByRole("button", { name: /continue as/ })).toBeVisible();
});

test("status bar appears after continue", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).nostr = { getPublicKey: async () => "pub" };
  });
  await page.goto("/");
  await page.getByRole("button", { name: /use nip-07/i }).click();
  await page.getByRole("button", { name: /continue/ }).click();
  await expect(page.getByTestId("status-bar")).toBeVisible();
  await expect(page.getByTestId("main-panel")).toBeVisible();
  await expect(page.getByTestId("json-viewer")).toBeVisible();
});

test("nip46 button shows and prompts for URI", async ({ page }) => {
  const validHexPubkey = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  
  await page.addInitScript((pubkey) => {
    (window as any).prompt = () => `nostrconnect://${pubkey}@wss://relay.example.com`;
  }, validHexPubkey);
  
  await page.goto("/");
  await expect(page.getByRole("button", { name: /connect with nip-46 remote signer/i })).toBeVisible();
  
  await page.getByRole("button", { name: /connect with nip-46 remote signer/i }).click();
  await expect(page.getByText(/loading your relays/i)).toBeVisible();
});
