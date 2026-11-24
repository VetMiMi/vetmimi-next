import {
  Caveat,
  Fraunces,
  Manrope,
  Noto_Sans_Myanmar,
  Noto_Serif_Myanmar,
} from "next/font/google";

// Self-hosted at build time: no request to Google, no render-blocking CSS.
// All three are variable fonts, so one file covers every weight.
export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-serif",
});

export const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Decorative handwriting for small labels: not preloaded, so it never
// competes with the hero image for bandwidth.
export const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-hand",
});

// Burmese. Fraunces, Manrope and Caveat have no Myanmar glyphs, so these sit
// after them in each font stack and the browser uses them only for Burmese
// characters. Not preloaded: English pages never download them.
export const notoSansMyanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  display: "swap",
  preload: false,
  variable: "--font-sans-my",
});

export const notoSerifMyanmar = Noto_Serif_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
  variable: "--font-serif-my",
});
