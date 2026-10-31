import { defineConfig, devices } from "@playwright/test";

// Headless UI smoke check: real browser, local dev server, no external network.
export default defineConfig({
  testDir: "./tests/smoke",
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5179",
    headless: true,
    // Optional: a preinstalled Chromium when the bundled one is not downloaded.
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 860 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5179 --strictPort",
    url: "http://127.0.0.1:5179",
    reuseExistingServer: false,
    // Empty Supabase settings keep the app local: no session checks, no sync.
    env: { VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "", VITE_SENTRY_DSN: "", VITE_REVIEW_URL: "https://example.com/review" },
  },
});
