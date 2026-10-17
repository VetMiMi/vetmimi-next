import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VetMiMi · Art therapy with Daw Mi",
    short_name: "VetMiMi",
    start_url: "/",
    display: "browser",
    background_color: "#fff7ef",
    theme_color: "#494c6d",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
