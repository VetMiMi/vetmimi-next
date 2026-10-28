import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

// Server component. Only SiteHeader ships JavaScript to the browser.
export default function SiteLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  return (
    <div className="flex min-h-full flex-col">
      {/* The first stop for the Tab key, so keyboard and screen reader
          visitors can pass the header on every page. */}
      <a href="#main" className="skip-link">
        {t("skipLink")}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
