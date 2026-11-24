import { defineConfig, devices } from "@playwright/test";

// End-to-end checks run in CI only: a browser beside a production build
// does not fit on the 8 GB laptop. Job web-e2e runs the API-free specs; job
// web-e2e-api starts the Go API, sets API_URL and runs e2e/api instead.
const withApi = Boolean(process.env.API_URL);

const desktop = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1280, height: 800 },
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // The API specs share one practitioner's calendar and the booking switch.
  workers: withApi ? 1 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  globalSetup: withApi ? "./e2e/api/global-setup.ts" : undefined,
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
  projects: withApi
    ? [
        {
          name: "api",
          testDir: "e2e/api",
          testIgnore: "session.spec.ts",
          use: desktop,
        },
        {
          name: "api-session",
          testDir: "e2e/api",
          testMatch: "session.spec.ts",
          use: {
            ...desktop,
            permissions: ["camera", "microphone"],
            launchOptions: {
              args: [
                "--use-fake-ui-for-media-stream",
                "--use-fake-device-for-media-stream",
              ],
            },
          },
        },
      ]
    : [
        { name: "desktop", testIgnore: "api/**", use: desktop },
        {
          name: "mobile",
          testIgnore: "api/**",
          use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } },
        },
      ],
});
