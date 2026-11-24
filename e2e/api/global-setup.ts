import { adminCall, env, signIn } from "./backend";

const EVERY_WEEKDAY = [1, 2, 3, 4, 5, 6, 7];

// Runs once before the API-backed specs. Each account signs in only here,
// because the API allows ten sign-in attempts an hour per email; the specs
// share the two sessions. Then booking opens: no minimum notice, and
// 09:00–17:00 Sydney time every day.
export default async function globalSetup() {
  process.env.E2E_ADMIN_TOKEN = await signIn(
    env("E2E_ADMIN_EMAIL"),
    env("E2E_ADMIN_PASSWORD"),
  );
  process.env.E2E_EDITOR_TOKEN = await signIn(
    env("E2E_EDITOR_EMAIL"),
    env("E2E_EDITOR_PASSWORD"),
  );
  await adminCall("PATCH", "/admin/settings", {
    minNoticeHours: 0,
    publicBookingEnabled: true,
  });
  await adminCall("PUT", "/admin/availability/rules", {
    periods: EVERY_WEEKDAY.map((weekday) => ({
      weekday,
      startTime: "09:00",
      endTime: "17:00",
    })),
  });
}
