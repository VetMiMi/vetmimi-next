import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { apiConfigured, publicApi } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/problem";
import { issueFormToken } from "@/lib/spam";
import { BookingFlow } from "./_components/BookingFlow";
import "@/styles/booking.css";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/book">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "book.metadata" });
  return pageMetadata(locale, "/book", {
    title: t("title"),
    description: t("description"),
  });
}

// The bookable services are read fresh on every visit: Daw Mi can pause
// booking or a service at any moment.
export default async function BookPage({
  params,
  searchParams,
}: PageProps<"/[locale]/book">) {
  const { locale } = await params;
  const { service } = await searchParams;
  setRequestLocale(locale as Locale);

  return (
    <BookingFlow
      list={await bookableServices(locale as Locale)}
      requested={typeof service === "string" ? service : ""}
      formToken={issueFormToken("booking")}
    />
  );
}

// Null when the API cannot answer, so the flow shows its own retry state
// rather than an error page.
async function bookableServices(locale: Locale) {
  // Before the API is live, show the "booking is not available" notice with
  // the contact link rather than a load error.
  if (!apiConfigured()) {
    return {
      bookingEnabled: false,
      bookingMode: "request_approval" as const,
      timezone: "Australia/Sydney",
      items: [],
    };
  }
  try {
    return unwrap(
      await publicApi().GET("/public/booking/services", {
        params: { query: { locale } },
      }),
    );
  } catch (error) {
    const code = error instanceof ApiError ? error.code : "unavailable";
    console.error(`bookable services: ${code}`);
    return null;
  }
}
