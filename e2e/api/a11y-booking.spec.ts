import { randomBytes } from "node:crypto";
import manageEn from "../../messages/en/manage.json";
import manageMy from "../../messages/my/manage.json";
import sessionEn from "../../messages/en/session.json";
import sessionMy from "../../messages/my/session.json";
import {
  SERVICE,
  adminCall,
  confirmedRoom,
  madeUpVisitor,
  managedRequest,
  requestAppointment,
  setWeeklyHours,
  sql,
} from "./backend";
import {
  chooseFirstTimeAfterToday,
  reachReview,
  waitOutFillTime,
  words,
} from "./bookingFlow";
import { expect, expectNoAxeViolations, hydrated, test } from "./fixtures";

// Brief §10 on the visitor's screens (#131): every /book step and result,
// the management link and the session link, in both languages at a phone's
// and a laptop's width, against WCAG 2.2 AA with nothing allowed.
test.describe.configure({ timeout: 60_000 });

const manageWords = { en: manageEn, my: manageMy };
const sessionWords = { en: sessionEn, my: sessionMy };
const unknownToken = () => randomBytes(32).toString("base64url");

for (const width of [375, 1280]) {
  for (const locale of ["en", "my"] as const) {
    test.describe(`${locale} at ${width} px`, () => {
      test.use({ viewport: { width, height: 800 } });
      const home = locale === "en" ? "" : "/my";
      const t = words[locale];

      test("booking: each step, a failed send, a lost time, Pending", async ({
        page,
      }) => {
        const scan = (state: string) => expectNoAxeViolations(page, state);
        const visitor = madeUpVisitor();
        await page.goto(`${home}/book`);
        const servedAt = Date.now();
        const card = page.getByRole("radiogroup").getByRole("radio").first();
        await hydrated(card);
        await scan("step 1");

        await card.click();
        await page.getByRole("button", { name: t.step1.continue }).click();
        await chooseFirstTimeAfterToday(page, t);
        await scan("step 2 with a time chosen");

        await page.getByRole("button", { name: t.step2.continue }).click();
        await page.getByRole("button", { name: t.step3.continue }).click();
        await expect(
          page.getByRole("alert").filter({ hasText: t.step3.errors.summary }),
        ).toBeVisible();
        await scan("step 3 with errors");

        await page.locator("#book-name").fill(visitor.name);
        await page.locator("#book-email").fill(visitor.email);
        await page.locator("#book-privacyAck").check();
        await page.locator("#book-policyAck").check();
        await page.getByRole("button", { name: t.step3.continue }).click();
        await expect(
          page.getByRole("heading", { name: t.step4.title }),
        ).toBeVisible();
        await scan("step 4");

        // S03: the request never reaches the site.
        await page.route(
          (url) => url.pathname === `${home}/book`,
          (route) =>
            route.request().method() === "POST"
              ? route.abort()
              : route.fallback(),
        );
        await waitOutFillTime(page, servedAt);
        const submit = page.getByRole("button", { name: t.step4.submit });
        await submit.click();
        await expect(
          page.getByRole("alert").filter({ hasText: t.step4.failed.title }),
        ).toBeVisible();
        await scan("S03, not sent");
        await page.unrouteAll();

        // S05: another visitor takes the time first.
        const { slot } = await page.evaluate(() =>
          JSON.parse(sessionStorage.getItem("vetmimi.booking") ?? "{}"),
        );
        await requestAppointment(madeUpVisitor(), slot.startsAt);
        await submit.click();
        const timeLost = page
          .getByRole("alert")
          .filter({ hasText: t.step2.timeLost });
        await expect(timeLost).toBeVisible();
        await scan("S05, time lost");

        await timeLost.getByRole("radio").first().click();
        await page.getByRole("button", { name: t.step2.continue }).click();
        await page.getByRole("button", { name: t.step3.continue }).click();
        await submit.click();
        await expect(
          page.getByRole("heading", { name: t.result.pending.title }),
        ).toBeVisible();
        await scan("S01, Pending");
      });

      test("booking: S02, Confirmed when booking is instant", async ({
        page,
      }) => {
        const service = { slug: SERVICE };
        sql(
          "update services set booking_action = 'book' where slug = :'slug'",
          service,
        );
        await adminCall("PATCH", "/admin/settings", { bookingMode: "instant" });
        try {
          const servedAt = await reachReview(page, locale, madeUpVisitor());
          await waitOutFillTime(page, servedAt);
          await page
            .getByRole("button", { name: t.step4.submitInstant })
            .click();
          await expect(
            page.getByRole("heading", { name: t.result.confirmed.title }),
          ).toBeVisible();
          await expectNoAxeViolations(page, "S02, Confirmed");
        } finally {
          await adminCall("PATCH", "/admin/settings", {
            bookingMode: "request_approval",
          });
          sql(
            "update services set booking_action = 'request' where slug = :'slug'",
            service,
          );
        }
      });

      test("booking: S06, times not loaded, paused, S04", async ({ page }) => {
        const scan = (state: string) => expectNoAxeViolations(page, state);
        const next = page.getByRole("button", { name: t.step1.continue });
        // Each visit starts afresh, not at the step the last one saved.
        const visit = async (path: string) => {
          await page.evaluate(() => sessionStorage.clear());
          await page.goto(`${home}${path}`);
        };
        const toTimes = async () => {
          await visit(`/book?service=${SERVICE}`);
          await hydrated(next);
          await next.click();
        };

        await page.goto(`${home}/book?service=no-such-service`);
        await expect(page.getByText(t.step1.unavailable.badge)).toBeVisible();
        await scan("S06, service unavailable");

        await page.route("**/api/booking/availability**", (route) =>
          route.abort(),
        );
        await toTimes();
        await expect(
          page.getByRole("alert").filter({ hasText: t.step2.loadFailed }),
        ).toBeVisible();
        await scan("step 2, times not loaded");
        await page.unrouteAll();

        await adminCall("PATCH", "/admin/settings", {
          publicBookingEnabled: false,
        });
        try {
          await visit("/book");
          await expect(
            page.getByRole("heading", { name: t.step1.unavailable.title }),
          ).toBeVisible();
          await scan("booking paused");
        } finally {
          await adminCall("PATCH", "/admin/settings", {
            publicBookingEnabled: true,
          });
        }

        await setWeeklyHours(false);
        try {
          await toTimes();
          await expect(
            page.getByRole("status").filter({ hasText: t.step2.noTimes }),
          ).toBeVisible();
          await scan("S04, no times");
        } finally {
          await setWeeklyHours(true);
        }
      });

      test("management link: the request, cancel, reschedule, a bad link", async ({
        page,
      }) => {
        const scan = (state: string) => expectNoAxeViolations(page, state);
        const m = manageWords[locale];
        const { link } = await managedRequest();
        const cancel = page.getByRole("button", { name: m.actions.cancel });
        const dialog = page.getByRole("dialog", { name: m.cancel.title });
        await page.goto(`${home}${link}`);
        await hydrated(cancel);
        await scan("a pending request");

        await cancel.click();
        await expect(dialog).toBeVisible();
        await scan("cancel dialog open");

        await page.goto(`${home}${link}/reschedule`);
        await expect(page.getByRole("grid")).toBeVisible();
        await expect(page.getByRole("grid")).not.toHaveAttribute("aria-busy");
        await scan("ask to reschedule");

        await page.goto(`${home}${link}`);
        await hydrated(cancel);
        await cancel.click();
        await dialog.getByRole("button", { name: m.cancel.confirm }).click();
        await expect(
          page.getByRole("link", { name: m.actions.book }),
        ).toBeVisible();
        await scan("cancelled");

        await page.goto(`${home}/manage/${unknownToken()}`);
        await expect(
          page.getByRole("heading", { name: m.badLink.title }),
        ).toBeVisible();
        await scan("bad link");
      });

      test("session link: a bad link, too early, expired", async ({ page }) => {
        const scan = (state: string) => expectNoAxeViolations(page, state);
        const s = sessionWords[locale];
        await page.goto(`${home}/session/${unknownToken()}`);
        await expect(
          page.getByRole("heading", {
            name: manageWords[locale].badLink.title,
          }),
        ).toBeVisible();
        await scan("bad link");

        const room = await confirmedRoom();
        await page.goto(`${home}${room.link}`);
        await expect(
          page.getByRole("heading", { name: s.tooEarly.title }),
        ).toBeVisible();
        await scan("too early");

        sql(
          `update video_rooms set opens_at = now() - interval '3 hours',
                  closes_at = now() - interval '1 hour'
            where appointment_id = :'id'`,
          { id: room.id },
        );
        await page.goto(`${home}${room.link}`);
        await expect(
          page.getByRole("heading", { name: s.expired.title }),
        ).toBeVisible();
        await scan("expired");
      });
    });
  }
}
