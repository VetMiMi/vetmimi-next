import { Caveat, Fraunces, Manrope } from "next/font/google";

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

export const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hand",
});
