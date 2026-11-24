import { randomBytes } from "node:crypto";
import { linkToken, requestAppointment, sql } from "./backend";
import { expect, test } from "./fixtures";

// The appointment management link through Next and the API (#127). Booking
// UX §7: an invalid or expired link shows a neutral page that never says
// whether an appointment or a person exists.

// A pending request and the link its holder got by email.
async function managedRequest() {
  const appointment = await requestAppointment();
  const [[seed]] = sql(
    "select encode(management_token_seed, 'hex') from appointments where id = :'id'",
    { id: appointment.id },
  );
  return { ...appointment, link: `/manage/${linkToken("manage", seed)}` };
}

test.describe("management link: its holder can view, cancel and ask to reschedule", () => {
  test("view, then cancel after confirming", async ({ page }) => {
    const appointment = await managedRequest();
    await page.goto(appointment.link);
    await expect(
      page.getByText(`Reference ${appointment.reference}`),
    ).toBeVisible();
    await expect(page.getByText("Pending", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Cancel appointment" }).click();
    await page
      .getByRole("dialog", { name: "Cancel this appointment?" })
      .getByRole("button", { name: "Cancel appointment" })
      .click();

    await expect(page.getByText(/has been cancelled/)).toBeVisible();
    await expect(
      page.getByText("Cancelled by client", { exact: true }),
    ).toBeVisible();
    expect(
      sql("select status from appointments where id = :'id'", {
        id: appointment.id,
      }),
    ).toEqual([["cancelled_by_client"]]);
  });

  test("a reschedule request with up to three times keeps the booked time", async ({
    page,
  }) => {
    const appointment = await managedRequest();
    await page.goto(appointment.link);
    await page.getByRole("link", { name: "Ask to reschedule" }).click();

    // Late next month, where no other spec has booked anything.
    const calendar = page.getByRole("grid");
    const thisMonth = (await calendar.getAttribute("aria-labelledby")) ?? "";
    await page.getByRole("button", { name: "Next month", exact: true }).click();
    await expect(calendar).not.toHaveAttribute("aria-labelledby", thisMonth);
    await expect(calendar).not.toHaveAttribute("aria-busy");
    await calendar.locator("button:not([aria-disabled])").last().click();
    const times = page
      .getByRole("group", { name: /^Available times/ })
      .getByRole("button");
    for (const i of [0, 1, 2]) await times.nth(i).click();
    await expect(times.nth(3)).toHaveAttribute("aria-disabled", "true");
    await page.getByRole("button", { name: "Send request" }).click();

    await expect(
      page.getByRole("heading", { name: "Reschedule request sent" }),
    ).toBeVisible();
    await expect(page.getByText("Pending", { exact: true })).toBeVisible();
    expect(
      sql(
        `select jsonb_array_length(e.detail -> 'preferred'), a.status,
                a.starts_at = :'startsAt'::timestamptz
           from appointment_events e
           join appointments a on a.id = e.appointment_id
          where a.id = :'id' and e.kind = 'reschedule_requested'`,
        { id: appointment.id, startsAt: appointment.startsAt },
      ),
    ).toEqual([["3", "pending", "t"]]);
  });
});

test.describe("management link: any other token gets the neutral page (Booking UX §7)", () => {
  test("a random token shows no appointment data", async ({ page }) => {
    const token = randomBytes(32).toString("base64url");
    const response = await page.goto(`/manage/${token}`);

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "This link is not available." }),
    ).toBeVisible();
    await expect(page.getByText(/Reference VM-/)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Cancel appointment" }),
    ).toHaveCount(0);
  });
});
