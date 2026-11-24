import type { Page } from "@playwright/test";
import { clockWithZone, longDay } from "../../lib/admin/appointments";
import { localDateKey } from "../../lib/time";
import { TIMEZONE, env, freeSlots, requestAppointment, sql } from "./backend";
import { expect, signedIn, test } from "./fixtures";

// Daw Mi's booking admin against the API (#128): Booking UX §13 (confirm
// shows what is confirmed), §29 (roles, an ended session) and §30 (another
// admin's change is never silently overwritten). /admin itself is being
// rebuilt as the dashboard, so the specs use /admin/appointments.
test.use({ storageState: signedIn("admin") });

const detail = (id: string) => `/admin/appointments/${id}`;

const dialog = (page: Page, title: string) =>
  page.getByRole("dialog", { name: title });

async function confirmThroughDialog(page: Page) {
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await dialog(page, "Confirm this appointment?")
    .getByRole("button", { name: "Confirm appointment" })
    .click();
}

const communications = (page: Page) =>
  page.locator("section").filter({
    has: page.getByRole("heading", { name: "Communications", exact: true }),
  });

test.describe("admin list: a new request waits for Daw Mi", () => {
  test("the pending request is on /admin/appointments", async ({ page }) => {
    const { visitor } = await requestAppointment();
    await page.goto("/admin/appointments");
    const row = page.getByRole("row").filter({ hasText: visitor.name });
    await expect(row.first()).toContainText("Pending");
  });
});

test.describe("admin confirm and decline: each change goes through its dialog (§13)", () => {
  test("confirm shows what is confirmed, then Confirmed and its email", async ({
    page,
  }) => {
    const appointment = await requestAppointment();
    await page.goto(detail(appointment.id));
    await page.getByRole("button", { name: "Confirm", exact: true }).click();

    const confirm = dialog(page, "Confirm this appointment?");
    const { startsAt } = appointment;
    await expect(confirm).toContainText("Individual Art Therapy");
    await expect(confirm).toContainText(
      longDay(localDateKey(startsAt, TIMEZONE)),
    );
    await expect(confirm).toContainText(clockWithZone(startsAt, TIMEZONE));
    await expect(confirm).toContainText("Online");
    await expect(confirm).toContainText(
      "The visitor will be emailed a confirmation.",
    );
    await confirm.getByRole("button", { name: "Confirm appointment" }).click();

    await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
    await expect(communications(page)).toContainText("Booking confirmed");
  });

  test("decline gives Declined and frees the time again", async ({ page }) => {
    const appointment = await requestAppointment();
    const day = localDateKey(appointment.startsAt, TIMEZONE);
    expect(await freeSlots(day, day)).not.toContain(appointment.startsAt);

    await page.goto(detail(appointment.id));
    await page.getByRole("button", { name: "Decline", exact: true }).click();
    await dialog(page, "Decline this request?")
      .getByRole("button", { name: "Decline request" })
      .click();

    await expect(page.getByText("Declined", { exact: true })).toBeVisible();
    expect(await freeSlots(day, day)).toContain(appointment.startsAt);
  });
});

test.describe("admin stale update: 409 stale_version, never a silent overwrite (§30)", () => {
  test("a second admin confirming an old copy is told to refresh", async ({
    page,
    newPage,
  }) => {
    const appointment = await requestAppointment();
    const other = await newPage({ storageState: signedIn("admin") });
    await page.goto(detail(appointment.id));
    await other.goto(detail(appointment.id));

    await confirmThroughDialog(page);
    await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
    await confirmThroughDialog(other);

    await expect(dialog(other, "Confirm this appointment?")).toContainText(
      "This appointment has changed since you opened it. Refresh to see the latest.",
    );
    expect(
      sql(
        "select count(*) from appointment_events where appointment_id = :'id' and kind = 'confirmed'",
        { id: appointment.id },
      ),
    ).toEqual([["1"]]);
  });
});

test.describe("admin roles: a content editor sees no booking data (§29)", () => {
  test.use({ storageState: signedIn("editor") });

  test("appointments show the permission page only", async ({ page }) => {
    const { visitor } = await requestAppointment();
    await page.goto("/admin/appointments");

    await expect(
      page.getByRole("heading", {
        name: "You do not have access to this page.",
      }),
    ).toBeVisible();
    await expect(page.getByText(visitor.name)).toHaveCount(0);
    await expect(page.getByRole("table")).toHaveCount(0);
    await expect(page.getByText(/Pending requests/)).toHaveCount(0);
  });
});

test.describe("admin sign-in: an ended session returns to the page asked for (§29)", () => {
  test("with the session cookie gone, sign-in leads back to the appointment", async ({
    page,
    context,
  }) => {
    const appointment = await requestAppointment();
    const reference = page.getByRole("heading", {
      name: appointment.reference,
    });
    await page.goto(detail(appointment.id));
    await expect(reference).toBeVisible();

    await context.clearCookies();
    await page.reload();
    await expect(page).toHaveURL(/\/admin\/sign-in\?next=/);
    await page.getByLabel("Email").fill(env("E2E_ADMIN_EMAIL"));
    await page.getByLabel("Password").fill(env("E2E_ADMIN_PASSWORD"));
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(detail(appointment.id));
    await expect(reference).toBeVisible();
  });
});
