import type { Page } from "@playwright/test";
import { baseline, expect, test } from "./fixtures";

// UX Flow §2: the mobile menu must "clearly open and close, close after
// navigation, remain keyboard accessible, and avoid trapping visitors".
// A test listed under "keyboard" in e2e/axe-baseline.json is expected to
// fail; once it passes, Playwright fails it until the entry is removed.
test.beforeEach(({}, testInfo) => {
  test.fail(
    baseline.keyboard.includes(testInfo.title),
    "listed in e2e/axe-baseline.json",
  );
});

const toggle = (page: Page) =>
  page.locator('button[aria-controls="mobile-navigation"]');
const menu = (page: Page) => page.locator("#mobile-navigation");

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "the menu exists below 1024 px");

  test("opens with Enter on its toggle", async ({ page, visit }) => {
    await visit("/");
    await toggle(page).focus();
    await page.keyboard.press("Enter");
    await expect(menu(page)).toBeVisible();
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("closes with Escape and returns focus to the toggle", async ({
    page,
    visit,
  }) => {
    await visit("/");
    await toggle(page).focus();
    await page.keyboard.press("Enter");
    await menu(page).getByRole("link").first().focus();
    await page.keyboard.press("Escape");
    await expect(menu(page)).toBeHidden();
    await expect(toggle(page)).toBeFocused();
  });

  test("closes after following a link", async ({ page, visit }) => {
    await visit("/");
    await toggle(page).focus();
    await page.keyboard.press("Enter");
    await menu(page).locator('a[href="/about"]').focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/about");
    await expect(menu(page)).toBeHidden();
  });
});

// #13: switching language keeps the visitor on the same page.
for (const [from, to, target] of [
  ["/about", "/my/about", "my"],
  ["/my/services/group-art-wellbeing", "/services/group-art-wellbeing", "en"],
] as const) {
  test(`language switcher goes from ${from} to ${to}`, async ({
    page,
    visit,
    isMobile,
  }) => {
    await visit(from);
    if (isMobile) {
      await toggle(page).focus();
      await page.keyboard.press("Enter");
    }
    await page.locator(`header a[hreflang="${target}"]:visible`).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(to);
  });
}
