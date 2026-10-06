import { useTranslations } from "next-intl";
import { LinkNotAvailable } from "@/components/booking/LinkNotAvailable";
import { SessionCard } from "@/components/session/SessionCard";

// S11 for a join link: the same neutral body as a management link, for a
// malformed, unknown or revoked token alike. Sent with HTTP 404.
export default function BadSessionLink() {
  const t = useTranslations("manage");
  return (
    <SessionCard title={t("badLink.title")}>
      <LinkNotAvailable />
    </SessionCard>
  );
}
