import type { Metadata } from "next";
import "../globals.css";
import { fraunces, manrope, notoSansMyanmar, notoSerifMyanmar } from "../fonts";

export const metadata: Metadata = {
  title: { template: "%s · VetMiMi admin", default: "VetMiMi admin" },
  robots: { index: false, follow: false },
};

// Admin is English only and sits outside locale routing (ADR-002), so it has
// its own root layout. The Myanmar fonts are kept because visitors' names
// can be Burmese; they are not preloaded and only download for those
// characters. Without them `--serif` and `--sans` in globals.css would hold
// an undefined variable and fall back to the browser's font.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${notoSansMyanmar.variable} ${notoSerifMyanmar.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
