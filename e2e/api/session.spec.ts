import { randomBytes } from "node:crypto";
import type { Page, WebSocketRoute } from "@playwright/test";
import { adminCall, linkToken, requestAppointment, sql } from "./backend";
import { expect, signedIn, test } from "./fixtures";
import { printCalls, recordCall } from "./rtc-log";

test.afterEach(async ({}, testInfo) => printCalls(testInfo));

// Video sessions through the API's signalling (#85, ADR-007): the client on
// /session/<token>, Daw Mi on the appointment's session page. The project
// "api-session" gives Chromium a fake camera and microphone.
test.describe.configure({ timeout: 90_000 });

const CONNECT = { timeout: 20_000 };

// A confirmed online appointment whose room is open now: confirming creates
// the room, and its window is moved to have opened a minute ago.
async function openRoom() {
  const appointment = await requestAppointment();
  await adminCall("POST", `/admin/appointments/${appointment.id}/confirm`, {
    version: appointment.version,
  });
  const id = { id: appointment.id };
  sql(
    "update video_rooms set opens_at = now() - interval '1 minute' where appointment_id = :'id'",
    id,
  );
  const [[seed]] = sql(
    "select encode(join_token_seed, 'hex') from video_rooms where appointment_id = :'id'",
    id,
  );
  const firstName = appointment.visitor.name.split(" ")[0];
  return {
    ...appointment,
    firstName,
    link: `/session/${linkToken("join", seed)}`,
  };
}

async function clientJoins(page: Page, link: string) {
  await recordCall(page);
  await page.goto(link);
  await page.getByRole("button", { name: "Join session" }).click();
}

async function practitionerJoins(page: Page, id: string) {
  await recordCall(page);
  await page.goto(`/admin/appointments/${id}/session`);
  await page.getByRole("button", { name: "Start session" }).click();
}

const inSession = (page: Page) => page.getByText("In session", { exact: true });

async function expectRemoteVideo(page: Page, label: string) {
  const video = page.getByLabel(label);
  await expect
    .poll(
      () => video.evaluate((element: HTMLVideoElement) => element.videoWidth),
      CONNECT,
    )
    .toBeGreaterThan(0);
}

test.describe("video session: client and practitioner meet through the API's signalling", () => {
  test("both reach In session with video; mute toggles; End session ends it", async ({
    page,
    newPage,
  }) => {
    const room = await openRoom();
    await clientJoins(page, room.link);
    await expect(page.getByText("Waiting for Daw Mi to join.")).toBeVisible(
      CONNECT,
    );
    const practitioner = await newPage({ storageState: signedIn("admin") });
    await practitionerJoins(practitioner, room.id);

    await expect(inSession(page)).toBeVisible(CONNECT);
    await expect(inSession(practitioner)).toBeVisible(CONNECT);
    await expectRemoteVideo(page, "Daw Mi's video");
    await expectRemoteVideo(practitioner, `${room.firstName}'s video`);

    const mute = page.getByRole("button", { name: "Mute" });
    await mute.click();
    await expect(mute).toHaveAttribute("aria-pressed", "true");
    await mute.click();
    await expect(mute).toHaveAttribute("aria-pressed", "false");

    await practitioner.getByRole("button", { name: "End session" }).click();
    await practitioner
      .getByRole("dialog", { name: "End this session?" })
      .getByRole("button", { name: "End session" })
      .click();
    await expect(
      page.getByRole("heading", { name: "The session has ended." }),
    ).toBeVisible(CONNECT);
  });
});

test.describe("video session: a dropped socket reconnects by itself (close 1001)", () => {
  test("the client shows Reconnecting, then In session again", async ({
    page,
    newPage,
  }) => {
    const sockets: WebSocketRoute[] = [];
    await page.routeWebSocket(/\/video\/rooms\/[^/]+\/ws/, (socket) => {
      const server = socket.connectToServer();
      // A page cannot close with 1001 itself, so the API's side closes as a
      // dropped connection would.
      socket.onClose(() => server.close());
      sockets.push(socket);
    });
    const room = await openRoom();
    await clientJoins(page, room.link);
    await practitionerJoins(
      await newPage({ storageState: signedIn("admin") }),
      room.id,
    );
    await expect(inSession(page)).toBeVisible(CONNECT);

    await sockets[0].close({ code: 1001, reason: "Going away" });
    await expect(page.getByText("Reconnecting…")).toBeVisible();
    await expect(inSession(page)).toBeVisible({ timeout: 30_000 });
    expect(sockets.length).toBeGreaterThan(1);
  });
});

test.describe("video session: one connection per role (hub replace)", () => {
  test("a second tab with the same link takes over from the first", async ({
    page,
    newPage,
  }) => {
    const room = await openRoom();
    await practitionerJoins(
      await newPage({ storageState: signedIn("admin") }),
      room.id,
    );
    await clientJoins(page, room.link);
    await expect(inSession(page)).toBeVisible(CONNECT);

    const second = await newPage();
    await clientJoins(second, room.link);
    await expect(
      page.getByRole("heading", { name: "This tab has been disconnected." }),
    ).toBeVisible(CONNECT);
    await expect(inSession(second)).toBeVisible(CONNECT);
  });
});

test.describe("video session: other links reveal nothing", () => {
  test("malformed and unknown links show the same page", async ({ page }) => {
    const malformed = await page.goto("/session/not-a-join-link");
    const text = await page.getByRole("main").innerText();
    const unknown = randomBytes(32).toString("base64url");
    const response = await page.goto(`/session/${unknown}`);

    expect(malformed?.status()).toBe(404);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "This link is not available." }),
    ).toBeVisible();
    expect(await page.getByRole("main").innerText()).toBe(text);
  });

  test("a room past its window says the time has passed", async ({ page }) => {
    const room = await openRoom();
    sql(
      `update video_rooms set opens_at = now() - interval '3 hours',
              closes_at = now() - interval '1 hour'
        where appointment_id = :'id'`,
      { id: room.id },
    );
    await page.goto(room.link);

    await expect(
      page.getByRole("heading", { name: "This session has ended." }),
    ).toBeVisible();
    await expect(page.getByRole("main")).toContainText(
      "The time for this session has passed.",
    );
  });
});
