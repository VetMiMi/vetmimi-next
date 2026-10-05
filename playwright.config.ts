import { defineConfig, devices } from "@playwright/test";

// End-to-end checks run in CI only (job web-e2e in .github/workflows/ci.yml):
// a browser beside a production build does not fit on the 8 GB laptop.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    // After "html", which empties playwright-report/ when it writes.
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL: process.env.E2E_SITE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } },
    },
  ],
});
