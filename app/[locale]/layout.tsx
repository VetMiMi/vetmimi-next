import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import SiteLayout from "@/components/SiteLayout";
import { routing, type Locale } from "@/i18n/routing";
import { openGraphDefaults, siteUrl } from "@/lib/seo";
import {
  caveat,
  fraunces,
  manrope,
  notoSansMyanmar,
  notoSerifMyanmar,
} from "../fonts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "common.metadata" });
  // Each page adds its own title, description, canonical and hreflang.
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("title"), template: "%s · VetMiMi" },
    description: t("description"),
    openGraph: openGraphDefaults(locale),
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Lets every page below render statically in both languages.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${manrope.variable} ${caveat.variable} ${notoSansMyanmar.variable} ${notoSerifMyanmar.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <SiteLayout>{children}</SiteLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
