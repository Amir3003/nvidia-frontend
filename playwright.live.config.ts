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
    // Behind an egress proxy (cloud sessions) both the browser and the request context must use it.
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
});
