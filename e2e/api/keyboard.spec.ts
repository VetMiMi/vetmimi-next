import type { Locator, Page } from "@playwright/test";
import { todayIn } from "../../lib/zonedTime";
import manage from "../../messages/en/manage.json";
import {
  SERVICE,
  TIMEZONE,
  adminCall,
  madeUpVisitor,
  managedRequest,
  requestAppointment,
  sql,
} from "./backend";
import { waitOutFillTime, words } from "./bookingFlow";
import { closeWithEscape, expect, hydrated, signedIn, test } from "./fixtures";

// Booking UX §30 and §33 and brief §7 and §10 (#131): the main tasks done
// with the keyboard alone, and dialogs that keep focus while open and give
// it back to their button when closed.
const t = words.en;

const isFocused = (target: Locator) =>
  target.evaluate((element) => element === document.activeElement);

// Tab until `target` has focus, as a keyboard user moves to it.
async function tabTo(page: Page, target: Locator) {
  for (let presses = 0; presses < 60 && !(await isFocused(target)); presses++) {
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

// Tab and Shift+Tab never reach the page behind an open dialog. Past the
// dialog's last control the browser may focus its own interface, which
// leaves the page's body focused.
async function expectFocusTrapped(page: Page, dialog: Locator) {
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let presses = 0; presses < 8; presses++) {
      await page.keyboard.press(key);
      const focus = await dialog.evaluate((element) =>
        element.contains(document.activeElement) ||
        document.activeElement === document.body
          ? "inside"
          : document.activeElement?.outerHTML.slice(0, 120),
      );
      expect(focus, `${key} left the dialog`).toBe("inside");
    }
  }
}

// Opens a dialog from its button by keyboard, checks it holds focus, closes
// it with Escape and checks focus is back on the button.
async function checkDialogFocus(
  page: Page,
  trigger: Locator,
  open: string,
  dialog: Locator,
  safeChoice: string,
) {
  await tabTo(page, trigger);
  await page.keyboard.press(open);
  await expect(
    dialog.getByRole("button", { name: safeChoice, exact: true }),
  ).toBeFocused();
  await expectFocusTrapped(page, dialog);
  await closeWithEscape(page, dialog);
  await expect(trigger).toBeFocused();
}

test("a visitor sends a booking request with the keyboard alone", async ({
  page,
}) => {
  const visitor = madeUpVisitor();
  await page.goto(`/book?service=${SERVICE}`);
  const servedAt = Date.now();
  const toTimes = page.getByRole("button", { name: t.step1.continue });
  const title = (name: string) => page.getByRole("heading", { name });
  await hydrated(toTimes);
  await tabTo(page, toTimes);
  await page.keyboard.press("Enter");
  await expect(title(t.step2.title)).toBeFocused();

  // Into the calendar, along to the first day after today, then its first
  // time: today's next time may start before the test is over.
  const calendar = page.getByRole("grid");
  const laterDays = calendar.locator(
    "button:not([aria-disabled]):not([aria-current])",
  );
  await expect(calendar).toBeVisible();
  await expect(calendar).not.toHaveAttribute("aria-busy");
  if ((await laterDays.count()) === 0) {
    await tabTo(
      page,
      page.getByRole("button", { name: t.calendar.nextMonth, exact: true }),
    );
    await page.keyboard.press("Enter");
    await expect(laterDays.first()).toBeVisible();
  }
  await tabTo(page, calendar.locator('button[tabindex="0"]'));
  for (let i = 0; i < 7 && !(await isFocused(laterDays.first())); i++) {
    await page.keyboard.press("ArrowRight");
  }
  await expect(laterDays.first()).toBeFocused();
  await page.keyboard.press("Enter");
  const firstTime = page.getByRole("radiogroup").getByRole("radio").first();
  await tabTo(page, firstTime);
  await page.keyboard.press("Space");
  await expect(firstTime).toHaveAttribute("aria-checked", "true");
  await tabTo(page, page.getByRole("button", { name: t.step2.continue }));
  await page.keyboard.press("Enter");
  await expect(title(t.step3.title)).toBeFocused();

  await tabTo(page, page.locator("#book-name"));
  await page.keyboard.type(visitor.name);
  await tabTo(page, page.locator("#book-email"));
  await page.keyboard.type(visitor.email);
  for (const acknowledgement of ["#book-privacyAck", "#book-policyAck"]) {
    await tabTo(page, page.locator(acknowledgement));
    await page.keyboard.press("Space");
  }
  await tabTo(page, page.getByRole("button", { name: t.step3.continue }));
  await page.keyboard.press("Enter");
  await expect(title(t.step4.title)).toBeFocused();

  const submit = page.getByRole("button", { name: t.step4.submit });
  await waitOutFillTime(page, servedAt);
  await tabTo(page, submit);
  await page.keyboard.press("Enter");
  await expect(title(t.result.pending.title)).toBeFocused();
  expect(
    sql("select status from appointments where visitor_email = :'email'", {
      email: visitor.email,
    }),
  ).toEqual([["pending"]]);
});

test("the link's holder cancels with the keyboard alone", async ({ page }) => {
  const appointment = await managedRequest();
  await page.goto(appointment.link);
  const cancel = page.getByRole("button", { name: manage.actions.cancel });
  const dialog = page.getByRole("dialog", { name: manage.cancel.title });
  await hydrated(cancel);
  await checkDialogFocus(page, cancel, "Enter", dialog, manage.cancel.keep);

  await page.keyboard.press("Enter");
  await tabTo(
    page,
    dialog.getByRole("button", { name: manage.cancel.confirm }),
  );
  await page.keyboard.press("Enter");
  await expect(page.locator(":focus")).toContainText("has been cancelled");
  expect(
    sql("select status from appointments where id = :'id'", {
      id: appointment.id,
    }),
  ).toEqual([["cancelled_by_client"]]);
});

test.describe("Daw Mi with the keyboard alone", () => {
  test.use({ storageState: signedIn("admin") });

  test("confirms a request", async ({ page }) => {
    const appointment = await requestAppointment();
    await page.goto(`/admin/appointments/${appointment.id}`);
    const confirm = page.getByRole("button", { name: "Confirm", exact: true });
    const dialog = page.getByRole("dialog", {
      name: "Confirm this appointment?",
    });
    await hydrated(confirm);
    await checkDialogFocus(page, confirm, "Enter", dialog, "Not yet");

    await page.keyboard.press("Enter");
    await tabTo(
      page,
      dialog.getByRole("button", { name: "Confirm appointment" }),
    );
    await page.keyboard.press("Enter");
    await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
    expect(
      sql("select status from appointments where id = :'id'", {
        id: appointment.id,
      }),
    ).toEqual([["confirmed"]]);
  });

  // Today, which no other spec books: they all start from tomorrow.
  test("blocks a day", async ({ page }) => {
    const today = todayIn(TIMEZONE);
    await page.goto("/admin/availability");
    const day = page.getByRole("grid").locator('button[aria-current="date"]');
    await hydrated(day);
    try {
      await tabTo(page, day);
      await page.keyboard.press("Enter");
      await tabTo(page, page.getByRole("button", { name: "Mark as day off" }));
      await page.keyboard.press("Enter");
      await expect(day).toHaveAttribute("aria-label", /: day off$/);
      await expect(day).toBeFocused();
    } finally {
      const blocks = await adminCall<{ items: { id: string }[] }>(
        "GET",
        `/admin/availability/blocks?from=${today}&to=${today}`,
      );
      for (const { id } of blocks.items) {
        await adminCall("DELETE", `/admin/availability/blocks/${id}`);
      }
    }
  });

  test("pauses public booking", async ({ page }) => {
    await page.goto("/admin/settings");
    const open = page.getByRole("checkbox", { name: "Public booking is open" });
    const dialog = page.getByRole("dialog", { name: "Pause public booking?" });
    await hydrated(open);
    try {
      await checkDialogFocus(page, open, "Space", dialog, "Keep open");
      await expect(open).toBeChecked();

      await page.keyboard.press("Space");
      await tabTo(page, dialog.getByRole("button", { name: "Pause booking" }));
      await page.keyboard.press("Enter");
      await expect(open).not.toBeChecked();
      await expect(open).toBeFocused();
      const settings = await adminCall<{ publicBookingEnabled: boolean }>(
        "GET",
        "/admin/settings",
      );
      expect(settings.publicBookingEnabled).toBe(false);
    } finally {
      await adminCall("PATCH", "/admin/settings", {
        publicBookingEnabled: true,
      });
    }
  });
});
