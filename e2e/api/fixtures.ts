import AxeBuilder from "@axe-core/playwright";
import {
  test as base,
  expect,
  type BrowserContext,
  type BrowserContextOptions,
  type Locator,
  type Page,
} from "@playwright/test";
import { WCAG_TAGS } from "../fixtures";
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

// The page as it is now against WCAG 2.2 AA. Soft, so a test that walks
// through several states reports every one; each finding names the rule,
// the element and why it fails.
export async function expectNoAxeViolations(page: Page, state: string) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  const findings = violations.flatMap(({ id, nodes }) =>
    nodes.map((node) => {
      const reason = node.failureSummary?.split("\n")[1]?.trim();
      return `${id} on ${node.target.join(" ")}: ${reason}`;
    }),
  );
  expect.soft(findings, `axe: ${state}`).toEqual([]);
}

// Escape closes a dialog at once, but React hears of it in the dialog's
// close event a moment later; a key press in between reaches a dialog React
// still thinks is open. So this waits for that event.
export async function closeWithEscape(page: Page, dialog: Locator) {
  const watch = await dialog.evaluateHandle((element) => ({
    closed: new Promise((done) =>
      element.addEventListener("close", done, { once: true }),
    ),
  }));
  await page.keyboard.press("Escape");
  await watch.evaluate((it) => it.closed);
  await expect(dialog).toBeHidden();
}

// Waits until React has hydrated an element, so a click or a key press
// reaches its handler.
export async function hydrated(target: Locator) {
  await expect
    .poll(() =>
      target.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactProps")),
      ),
    )
    .toBe(true);
}

export { expect };
