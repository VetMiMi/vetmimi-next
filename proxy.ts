import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Picks the language from the URL, then the visitor's saved choice (cookie),
// then their browser language, and adds hreflang Link headers.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, Vercel paths and any file with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
