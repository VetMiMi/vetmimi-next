import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import SiteLayout from "@/components/SiteLayout";

export const metadata: Metadata = {
  title: "VetMiMi",
  description: "Art, reflection and wellbeing with Daw Mi.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}