import {
  test as base,
  expect,
  type BrowserContext,
  type BrowserContextOptions,
  type Page,
} from "@playwright/test";
import { visitorIp } from "./backend";

type Fixtures = {
  /** Another browser beside the test's page (a second visitor, Daw Mi),
   * closed when the test ends. */
  newPage: (options?: BrowserContextOptions) => Promise<Page>;
};

// Playwright calls the fixture callback "use"; it is named "provide" here
// because the React Hooks lint rule treats any call to use() as a hook.
export const test = base.extend<Fixtures>({
  // Next forwards the first X-Forwarded-For address as X-Visitor-IP, so
  // each test is its own visitor to the API's per-visitor limits.
  extraHTTPHeaders: async ({}, provide) => {
    await provide({ "X-Forwarded-For": visitorIp() });
  },
  newPage: async ({ browser }, provide) => {
    const contexts: BrowserContext[] = [];
    await provide(async (options) => {
      const context = await browser.newContext(options);
      contexts.push(context);
      return context.newPage();
    });
    await Promise.all(contexts.map((context) => context.close()));
  },
});

// The cookie the site keeps the API session in, holding the session
// global-setup.ts opened, so admin pages open signed in. Signing in through
// the form has its own test (admin.spec.ts).
export function signedIn(role: "admin" | "editor") {
  const token =
    process.env[role === "admin" ? "E2E_ADMIN_TOKEN" : "E2E_EDITOR_TOKEN"];
  return {
    cookies: [
      {
        name: "vm_session",
        value: token ?? "",
        domain: "localhost",
        path: "/admin",
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
      },
    ],
    origins: [],
  };
}

export { expect };
