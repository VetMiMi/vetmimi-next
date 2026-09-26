import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities listed here; any other `quality` prop
    // is silently rounded to the nearest one. 75 is the default.
    qualities: [40, 60, 75],
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
