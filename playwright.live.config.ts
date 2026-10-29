import { defineConfig } from "@playwright/test";

// Read-only check of the deployed site. LIVE_URL overrides the production domain.
export default defineConfig({
  testDir: "./tests/live",
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: process.env.LIVE_URL || "https://www.qadamhub.com",
    headless: true,
    viewport: { width: 1280, height: 860 },
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
});
