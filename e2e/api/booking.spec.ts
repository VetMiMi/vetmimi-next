import type { Page } from "@playwright/test";
import { MIN_FILL_MS } from "../../lib/spam";
import en from "../../messages/en/book.json";
import my from "../../messages/my/book.json";
import {
  SERVICE,
  adminCall,
  madeUpVisitor,
  sql,
  visitorIp,
  type Visitor,
} from "./backend";
import { expect, test } from "./fixtures";

// Public booking through Next and the real API (#125). Requirements §4: a
// success message only once the request is stored. §6: no duplicates, and
// the time is checked again when the request is sent.

type Words = typeof en;
const words: Record<"en" | "my", Words> = { en, my };
const REFERENCE = /VM-[0-9A-Z]{6}/;

// Services, Individual Art Therapy, its booking button (UX Flow §4), a
// time, the details, then the review. Returns when the form was served.
async function reachReview(page: Page, locale: "en" | "my", visitor: Visitor) {
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
async function chooseFirstTimeAfterToday(page: Page, t: Words) {
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
const waitOutFillTime = (page: Page, servedAt: number) =>
  page.waitForTimeout(Math.max(0, servedAt + MIN_FILL_MS - Date.now()));

// S01: Pending, with the reference the API stored.
async function expectPending(page: Page, t: Words) {
  const { title, badge } = t.result.pending;
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(badge, { exact: true })).toBeVisible();
  const text = await page.getByText(REFERENCE).textContent();
  return text?.match(REFERENCE)?.[0];
}

const storedFor = (visitor: Visitor) =>
  sql(
    "select reference, status, locale from appointments where visitor_email = :'email'",
    { email: visitor.email },
  );

test.describe("booking request: Pending only once the request is stored (Requirements §4)", () => {
  test("from Services to Pending with a VM- reference", async ({ page }) => {
    const visitor = madeUpVisitor();
    const servedAt = await reachReview(page, "en", visitor);
    const review = page.getByRole("main");
    await expect(review).toContainText("Individual Art Therapy · 60 minutes");
    await expect(review).toContainText("Sydney time");
    await expect(review).toContainText("Online");
    await waitOutFillTime(page, servedAt);
    await page.getByRole("button", { name: en.step4.submit }).click();

    const reference = await expectPending(page, en);
    expect(storedFor(visitor)).toEqual([[reference, "pending", "en"]]);
    const emails = sql(
      `select c.kind, c.status from communications c
         join appointments a on a.id = c.appointment_id
        where a.visitor_email = :'email' order by c.kind`,
      { email: visitor.email },
    );
    expect(emails.map(([kind]) => kind)).toEqual([
      "practitioner_new_request",
      "request_received",
    ]);
    for (const [, status] of emails)
      expect(["queued", "sent"]).toContain(status);
  });

  test.describe("in Burmese on a phone", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("the same path at 375 px", async ({ page }) => {
      const visitor = madeUpVisitor();
      const servedAt = await reachReview(page, "my", visitor);
      await waitOutFillTime(page, servedAt);
      await page.getByRole("button", { name: my.step4.submit }).click();

      const reference = await expectPending(page, my);
      expect(storedFor(visitor)).toEqual([[reference, "pending", "my"]]);
    });
  });
});

test.describe("booking request: one request per submission (Idempotency-Key)", () => {
  test("a double-click on submit, then a reload, stores one request", async ({
    page,
  }) => {
    const visitor = madeUpVisitor();
    const servedAt = await reachReview(page, "en", visitor);
    await waitOutFillTime(page, servedAt);
    await page.getByRole("button", { name: en.step4.submit }).dblclick();
    const reference = await expectPending(page, en);

    await page.reload();
    await expect(
      page.getByRole("heading", { name: en.step1.title }),
    ).toBeVisible();
    expect(storedFor(visitor)).toEqual([[reference, "pending", "en"]]);
  });
});

test.describe("booking request: one request per time (appointments_no_overlap, S05)", () => {
  test("two visitors send the same time at once and one gets it", async ({
    page,
    newPage,
  }) => {
    const other = await newPage({
      extraHTTPHeaders: { "X-Forwarded-For": visitorIp() },
    });
    const pages = [page, other];
    const visitors = [madeUpVisitor(), madeUpVisitor()];
    const servedAt = [
      await reachReview(pages[0], "en", visitors[0]),
      await reachReview(pages[1], "en", visitors[1]),
    ];
    await waitOutFillTime(page, Math.max(...servedAt));
    await Promise.all(
      pages.map((each) =>
        each.getByRole("button", { name: en.step4.submit }).click(),
      ),
    );

    const pending = (each: Page) =>
      each.getByRole("heading", { name: en.result.pending.title });
    const timeLost = (each: Page) =>
      each.getByRole("alert").filter({ hasText: en.step2.timeLost });
    for (const each of pages) {
      await expect(pending(each).or(timeLost(each))).toBeVisible();
    }
    const won = await Promise.all(
      pages.map((each) => pending(each).isVisible()),
    );
    expect(won.filter(Boolean)).toHaveLength(1);

    // The one who lost the time keeps the details and picks another time.
    const lost = won.indexOf(false);
    const loser = pages[lost];
    await expect(loser.locator(":focus")).toContainText(en.step2.timeLost);
    await timeLost(loser).getByRole("radio").first().click();
    await loser.getByRole("button", { name: en.step2.continue }).click();
    await expect(loser.locator("#book-name")).toHaveValue(visitors[lost].name);
    expect(
      sql(
        "select count(*) from appointments where visitor_email in (:'a', :'b')",
        { a: visitors[0].email, b: visitors[1].email },
      ),
    ).toEqual([["1"]]);
  });
});

test.describe("booking request: no success message without a stored request (S03)", () => {
  test("a request that never reaches the site says it was not sent", async ({
    page,
  }) => {
    const visitor = madeUpVisitor();
    await reachReview(page, "en", visitor);
    // The request is a Server Function call: a POST to the page itself.
    await page.route(
      (url) => url.pathname === "/book",
      (route) =>
        route.request().method() === "POST" ? route.abort() : route.fallback(),
    );
    await page.getByRole("button", { name: en.step4.submit }).click();

    const failed = page
      .getByRole("alert")
      .filter({ hasText: en.step4.failed.title });
    await expect(failed).toContainText(en.step4.failed.text);
    await expect(page.getByRole("main")).toContainText(visitor.email);
    expect(storedFor(visitor)).toEqual([]);
  });
});

test.describe("booking paused: no calendar while public booking is off", () => {
  test("/book shows the paused state", async ({ page }) => {
    await adminCall("PATCH", "/admin/settings", {
      publicBookingEnabled: false,
    });
    try {
      await page.goto("/book");
      await expect(
        page.getByRole("heading", { name: en.step1.unavailable.title }),
      ).toBeVisible();
      await expect(page.getByRole("main")).toContainText(
        "Booking is not currently available.",
      );
      await expect(page.getByRole("radiogroup")).toHaveCount(0);
      await expect(page.getByRole("grid")).toHaveCount(0);
    } finally {
      await adminCall("PATCH", "/admin/settings", {
        publicBookingEnabled: true,
      });
    }
  });
});
