import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import SiteLayout from "@/components/SiteLayout";
import { caveat, fraunces, manrope } from "./fonts";

export const metadata: Metadata = {
  title: "VetMiMi",
  description: "Art, reflection and wellbeing with Daw Mi.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${caveat.variable}`}
    >
      <body>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
