import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities listed here; any other `quality` prop
    // is silently rounded to the nearest one. 75 is the default.
    qualities: [40, 60, 75],
  },
};

export default nextConfig;
