import { createHash, timingSafeEqual } from "node:crypto";

// The API sends SITE_REVALIDATE_SECRET in X-Revalidate-Secret. Both sides
// are hashed first so the comparison takes the same time whatever the
// length or content of a wrong guess. Without a configured secret nothing
// matches, so the endpoint is closed rather than open.
export function revalidateSecretMatches(
  given: string | null,
  expected: string | undefined,
): boolean {
  if (!given || !expected) return false;
  return timingSafeEqual(digest(given), digest(expected));
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}
