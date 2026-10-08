import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// Picks the language from the URL, then the visitor's saved choice (cookie),
// then their browser language, and adds hreflang Link headers.
const handleI18nRouting = createMiddleware(routing);

// Admin paths that need no session: sign-in itself, and the primitives
// gallery, which holds no data and is a 404 in production.
const OPEN_ADMIN_PATHS = new Set(["/admin/sign-in", "/admin/primitives"]);

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin is English only and outside locale routing (ADR-002), so it must
  // never reach next-intl: no /en rewrite, no locale cookie, no hreflang.
  // Server components cannot read the URL, so the path and query travel in
  // a request header for sending Daw Mi back to the page she asked for.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Without a session cookie no admin page can render, so send Daw Mi to
    // sign-in now. Only an optimistic check: the API decides whether the
    // cookie is still good (lib/admin/session.ts).
    if (!request.cookies.has("vm_session") && !OPEN_ADMIN_PATHS.has(pathname)) {
      const signIn = new URL("/admin/sign-in", request.url);
      signIn.searchParams.set("next", pathname + search);
      return NextResponse.redirect(signIn);
    }
    const headers = new Headers(request.headers);
    headers.set("x-admin-path", pathname + search);
    return NextResponse.next({ request: { headers } });
  }

  return handleI18nRouting(request);
}

export const config = {
  // Skip Next internals, Vercel paths and any file with an extension. Skip
  // the media upload too: a proxied body is buffered and cut at 10 MB, and
  // the route handler checks the session itself.
  matcher: "/((?!api|_next|_vercel|admin/media/upload|.*\\..*).*)",
};
