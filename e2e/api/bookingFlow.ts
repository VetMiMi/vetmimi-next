import type { Page } from "@playwright/test";
import { MIN_FILL_MS } from "../../lib/spam";
import en from "../../messages/en/book.json";
import my from "../../messages/my/book.json";
import { SERVICE, type Visitor } from "./backend";
import { expect } from "./fixtures";

// The visitor's way through /book, for the specs that walk it.

export type Words = typeof en;
export const words: Record<"en" | "my", Words> = { en, my };

// Services, Individual Art Therapy, its booking button (UX Flow §4), a
// time, the details, then the review. Returns when the form was served.
export async function reachReview(
  page: Page,
  locale: "en" | "my",
  visitor: Visitor,
) {
  const t = words[locale];
  const home = locale === "en" ? "" : "/my";
  await page.goto(`${home}/services`);
  await page
    .locator(`main a[href="${home}/services/${SERVICE}"]`)
    .first()
    .click();
  await page
    .locator(`main a[href="${home}/book?service=${SERVICE}"]`)
    .first()
    .click();
  // The flow saves its draft once it runs; a click before that is lost.
  await page.waitForFunction(() => sessionStorage.getItem("vetmimi.booking"));
  const servedAt = Date.now();
  await page.getByRole("button", { name: t.step1.continue }).click();
  await chooseFirstTimeAfterToday(page, t);
  await page.getByRole("button", { name: t.step2.continue }).click();
  await page.locator("#book-name").fill(visitor.name);
  await page.locator("#book-email").fill(visitor.email);
  await page.locator("#book-privacyAck").check();
  await page.locator("#book-policyAck").check();
  await page.getByRole("button", { name: t.step3.continue }).click();
  await expect(
    page.getByRole("heading", { name: t.step4.title }),
  ).toBeVisible();
  return servedAt;
}

// Today's next time may start before the test is over, so the first day
// after today: in next month when this month has none left.
export async function chooseFirstTimeAfterToday(page: Page, t: Words) {
  const calendar = page.getByRole("grid");
  const laterDays = calendar.locator(
    "button:not([aria-disabled]):not([aria-current])",
  );
  await expect(calendar).toBeVisible();
  await expect(calendar).not.toHaveAttribute("aria-busy");
  if ((await laterDays.count()) === 0) {
    await page
      .getByRole("button", { name: t.calendar.nextMonth, exact: true })
      .click();
  }
  await laterDays.first().click();
  await page.getByRole("radiogroup").getByRole("radio").first().click();
}

// The site refuses a request sent sooner than this after the form was
// served, as it would a bot's (lib/spam.ts).
export const waitOutFillTime = (page: Page, servedAt: number) =>
  page.waitForTimeout(Math.max(0, servedAt + MIN_FILL_MS - Date.now()));
