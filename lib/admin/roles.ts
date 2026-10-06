import type { components } from "../api/schema.ts";

export type Role = components["schemas"]["Role"];

// Whether a user with `roles` may use something open to `allowed`.
// `site_admin` implies every other role; an empty `allowed` means anyone
// signed in. Content access never implies booking access (Booking UX §8).
export function canUse(roles: readonly Role[], allowed: readonly Role[]) {
  return (
    allowed.length === 0 ||
    roles.includes("site_admin") ||
    allowed.some((role) => roles.includes(role))
  );
}
