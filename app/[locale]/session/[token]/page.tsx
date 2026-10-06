import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Btn } from "@/components/ui/Button";
import { usePracticeFormat } from "@/components/booking/practiceFormat";
import { CardActions, SessionCard } from "@/components/session/SessionCard";
import type { Locale } from "@/i18n/routing";
import { getSessionState, type PublicSession } from "@/lib/api/session";
import { localDateKey } from "@/lib/time";
import { SessionClient } from "./_components/SessionClient";
import { TooEarly } from "./_components/TooEarly";

// Never in search results, and the token never leaves in a Referer header
// (next.config.ts sends the same as HTTP headers, with no-store).
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/session/[token]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "session.meta",
  });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

// The page the API's emails link to: SITE_URL/session/<token>, and
// SITE_URL/my/session/<token> in Burmese (ADR-007). Read fresh on every
// visit; an unknown or malformed token is the S11 page with HTTP 404.
export default async function SessionPage({
  params,
}: PageProps<"/[locale]/session/[token]">) {
  const { locale, token } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("session");

  const load = await getSessionState(token);
  if (!load.ok) {
    if (load.problem === "not_found") notFound();
    const text = {
      unavailable: t("load.text"),
      rate_limited: t("load.rateLimited"),
      not_connected: t("load.notConnected"),
    }[load.problem];
    return (
      <SessionCard title={t("load.title")}>
        <p>{text}</p>
        <CardActions>
          {load.problem !== "not_connected" && (
            <Btn href={`/session/${token}`}>{t("load.retry")}</Btn>
          )}
          <Btn variant="secondary" href="/contact">
            {t("contact")}
          </Btn>
        </CardActions>
      </SessionCard>
    );
  }

  const session = load.session;
  switch (session.state) {
    case "too_early":
      return <TooEarlyCard session={session} />;
    case "ready":
      return <SessionClient token={token} session={session} />;
    case "expired":
    case "ended":
      return (
        <SessionCard title={t(`${session.state}.title`)}>
          <p>{t(`${session.state}.text`)}</p>
          <CardActions>
            <Btn variant="secondary" href="/contact">
              {t("contact")}
            </Btn>
          </CardActions>
        </SessionCard>
      );
  }
}

// Brief §9 Too early: the start time in the practice timezone, the date and
// zone beneath, and a countdown that opens the page at `opensAt`.
function TooEarlyCard({ session: s }: { session: PublicSession }) {
  const t = useTranslations("session");
  const format = usePracticeFormat(s.timezone);
  return (
    <SessionCard title={t("tooEarly.title")}>
      <div>
        <p>{t("tooEarly.text", { time: format.time(s.startsAt) })}</p>
        <p className="text-[0.95rem] text-muted">
          {t("tooEarly.when", {
            date: format.date(localDateKey(s.startsAt, s.timezone)),
            zone: format.zone(s.startsAt),
          })}
        </p>
      </div>
      <TooEarly opensAt={s.opensAt} now={new Date().toISOString()} />
      <p className="text-[0.92rem] text-muted">{t("privacy")}</p>
    </SessionCard>
  );
}
