import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { publicApi } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/problem";
import { issueFormToken } from "@/lib/spam";
import { BookingFlow } from "./_components/BookingFlow";
import "@/styles/booking.css";

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
