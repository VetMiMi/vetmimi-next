import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import SiteLayout from "@/components/SiteLayout";
import { routing } from "@/i18n/routing";
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
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as (typeof routing.locales)[number],
    namespace: "common.metadata",
  });
  return { title: t("title"), description: t("description") };
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
