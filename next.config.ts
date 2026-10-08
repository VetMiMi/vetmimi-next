import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // The live site runs as a Docker image (Dockerfile); Vercel ignores this.
  output: "standalone",
  images: {
    // Next 16 only serves qualities listed here; any other `quality` prop
    // is silently rounded to the nearest one. 75 is the default.
    qualities: [40, 60, 75],
  },
  async headers() {
    return [
      {
        // Admin must stay out of search results and can never be framed,
        // so no other site can trick a click on an admin action.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      // Management links carry a token as good as a password: never
      // indexed, and never passed on to another page as a Referer.
      ...["/manage/:path*", "/my/manage/:path*"].map((source) => ({
        source,
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      })),
      // Join links too, and the session state is never kept by a shared
      // cache: it changes from "too early" to "ready" to "ended".
      ...["/session/:path*", "/my/session/:path*"].map((source) => ({
        source,
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      })),
    ];
  },
  async redirects() {
    return [
      // Artworks now open in a lightbox on the portfolio page itself.
      {
        source: "/portfolio/:slug",
        destination: "/portfolio",
        permanent: true,
      },
      {
        source: "/my/portfolio/:slug",
        destination: "/my/portfolio",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
