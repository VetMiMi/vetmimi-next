import type { Page } from "@playwright/test";
import {
  SERVICE,
  adminCall,
  madeUpVisitor,
  publicCall,
  requestAppointment,
  sql,
} from "./backend";
import {
  expect,
  expectNoAxeViolations,
  hydrated,
  signedIn,
  test,
} from "./fixtures";

// Brief §10 on Daw Mi's screens (#131), at a phone's and a laptop's width,
// against WCAG 2.2 AA with nothing allowed. The dashboard is left out until
// its rebuild (#229) is merged.
test.describe.configure({ timeout: 60_000 });

// A page's own title, which its loading skeleton does not have.
const titled = (page: Page, name: string) =>
  expect(page.getByRole("heading", { level: 1, name })).toBeVisible();

// Opens a dialog with its button, scans it, and closes it with Escape.
async function scanDialog(page: Page, button: string, title: string) {
  await page.getByRole("button", { name: button, exact: true }).click();
  const dialog = page.getByRole("dialog", { name: title });
  await expect(dialog).toBeVisible();
  await expectNoAxeViolations(page, `dialog "${title}"`);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
}

for (const width of [375, 1280]) {
  test.describe(`admin at ${width} px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test("sign-in", async ({ page }) => {
      await page.goto("/admin/sign-in");
      await titled(page, "Sign in");
      await expectNoAxeViolations(page, "sign-in");
    });

    test.describe("as the booking admin", () => {
      test.use({ storageState: signedIn("admin") });

      test("appointments: list, a request, a confirmed one, reschedule, new", async ({
        page,
      }) => {
        const scan = (state: string) => expectNoAxeViolations(page, state);
        const request = await requestAppointment();
        const confirmed = await requestAppointment();
        await adminCall("POST", `/admin/appointments/${confirmed.id}/confirm`, {
          version: confirmed.version,
        });

        await page.goto("/admin/appointments");
        await expect(
          page
            .locator(`a[href="/admin/appointments/${request.id}"]`)
            .filter({ visible: true }),
        ).toBeVisible();
        await scan("appointments");

        await page.goto(`/admin/appointments/${request.id}`);
        await titled(page, request.reference);
        await hydrated(
          page.getByRole("button", { name: "Confirm", exact: true }),
        );
        await scan("a pending request");
        await scanDialog(page, "Confirm", "Confirm this appointment?");
        await scanDialog(page, "Decline", "Decline this request?");

        await page.goto(`/admin/appointments/${confirmed.id}`);
        await titled(page, confirmed.reference);
        await hydrated(
          page.getByRole("button", { name: "Cancel appointment", exact: true }),
        );
        await scan("a confirmed appointment");
        await scanDialog(
          page,
          "Cancel appointment",
          "Cancel this appointment?",
        );

        await page.goto(`/admin/appointments/${confirmed.id}/reschedule`);
        await titled(page, "Reschedule");
        await expect(page.getByRole("grid")).toBeVisible();
        await expect(page.getByRole("grid")).not.toHaveAttribute("aria-busy");
        await scan("reschedule");

        await page.goto("/admin/appointments/new");
        await titled(page, "New appointment");
        const review = page.getByRole("button", { name: "Review appointment" });
        await hydrated(review);
        await scan("new appointment");
        await review.click();
        await expect(
          page
            .getByRole("alert")
            .filter({ hasText: "Check the highlighted details." }),
        ).toBeVisible();
        await scan("new appointment with errors");
      });

      test("availability, services, enquiries, settings, more", async ({
        page,
      }) => {
        const scan = (state: string) => expectNoAxeViolations(page, state);
        await page.goto("/admin/availability");
        await titled(page, "Availability");
        await expect(page.getByText(/Clients can(not)? book/)).toBeVisible();
        await scan("availability");
        const today = page
          .getByRole("grid")
          .locator('button[aria-current="date"]');
        await hydrated(today);
        await today.click();
        await page.getByRole("button", { name: "Set hours" }).click();
        await scan("availability, one day's hours");

        const [[serviceId]] = sql(
          "select id from services where slug = :'slug'",
          { slug: SERVICE },
        );
        await page.goto("/admin/services");
        await titled(page, "Services");
        await scan("services");
        await page.goto(`/admin/services/${serviceId}`);
        await titled(page, "Individual Art Therapy");
        await scan("a service");

        const visitor = madeUpVisitor();
        const { reference } = await publicCall<{ reference: string }>(
          "POST",
          "/public/contact-enquiries",
          {
            body: {
              ...visitor,
              enquiryType: "general",
              subject: "A question about sessions",
              message: "Could we talk about a group session next month?",
              locale: "en",
              privacyAcknowledged: true,
            },
          },
        );
        const [[enquiryId]] = sql(
          "select id from contact_enquiries where reference = :'reference'",
          { reference },
        );
        await page.goto("/admin/enquiries");
        await titled(page, "Enquiries");
        await scan("enquiries");
        await page.goto(`/admin/enquiries/${enquiryId}`);
        await titled(page, reference);
        await scan("an enquiry");

        await page.goto("/admin/settings");
        await titled(page, "Settings");
        const open = page.getByRole("checkbox", {
          name: "Public booking is open",
        });
        await hydrated(open);
        await scan("settings");
        // Asks first; Escape keeps booking open.
        await open.click();
        const pause = page.getByRole("dialog", {
          name: "Pause public booking?",
        });
        await expect(pause).toBeVisible();
        await scan('dialog "Pause public booking?"');
        await page.keyboard.press("Escape");
        await expect(open).toBeChecked();

        await page.goto("/admin/more");
        await titled(page, "More");
        await scan("more");
      });
    });

    test.describe("as the content editor", () => {
      test.use({ storageState: signedIn("editor") });

      test("posts: an editor, its media library, the list, the calendar", async ({
        page,
      }) => {
        const scan = (state: string) => expectNoAxeViolations(page, state);
        await page.goto("/admin/posts");
        const newPost = page.getByRole("button", { name: "New post" });
        await hydrated(newPost);
        await newPost.click();
        await page.waitForURL(/\/admin\/posts\/[0-9a-f-]{36}$/);
        await titled(page, "Untitled post");
        await scan("a new post");

        const addImage = page
          .getByRole("button", { name: "Add image" })
          .first();
        await hydrated(addImage);
        await addImage.click();
        const picker = page.getByRole("dialog");
        await expect(picker).toBeVisible();
        await expect(picker.getByText("Loading the library…")).toBeHidden();
        await scan("media library");
        await picker.getByRole("button", { name: "Upload new" }).click();
        await scan("media upload");
        await page.keyboard.press("Escape");
        await expect(picker).toBeHidden();

        await page.goto("/admin/posts");
        await titled(page, "Posts");
        await scan("posts");
        await page.goto("/admin/posts/calendar");
        await titled(page, "Post calendar");
        await scan("post calendar");
      });
    });
  });
}
