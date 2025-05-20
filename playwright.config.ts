import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "pnpm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: true,
  },
  testDir: "tests",
});
