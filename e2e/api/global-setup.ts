import { adminCall, env, setWeeklyHours, signIn } from "./backend";

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
  await setWeeklyHours(true);
}
