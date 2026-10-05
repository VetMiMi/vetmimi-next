import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// Picks the language from the URL, then the visitor's saved choice (cookie),
// then their browser language, and adds hreflang Link headers.
const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin is English only and outside locale routing (ADR-002), so it must
  // never reach next-intl: no /en rewrite, no locale cookie, no hreflang.
  // Server components cannot read the URL, so the path and query travel in
  // a request header for sending Daw Mi back to the page she asked for.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const headers = new Headers(request.headers);
    headers.set("x-admin-path", pathname + search);
    return NextResponse.next({ request: { headers } });
  }

  return handleI18nRouting(request);
}

export const config = {
  // Skip Next internals, Vercel paths and any file with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
