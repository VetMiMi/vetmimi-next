const FALLBACK = "/admin";
// Any origin works: only whether the result stays on it matters.
const BASE = "http://admin.invalid";

// Where to send Daw Mi after sign-in. `next` comes from the URL, so anyone
// can write it; only a path on this site at /admin or under /admin/ is kept.
// The URL parser does the hard part: it reads "//host", "/\host", tabs and
// dot segments the way a browser would, so whatever it resolves off this
// origin or outside /admin is refused, and the path returned is the parsed
// one, never the raw text.
export function safeNext(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return FALLBACK;
  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return FALLBACK;
  }
  if (url.origin !== BASE) return FALLBACK;
  if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) {
    return FALLBACK;
  }
  return url.pathname + url.search + url.hash;
}
