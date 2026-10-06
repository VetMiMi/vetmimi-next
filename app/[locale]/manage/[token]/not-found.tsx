import { useTranslations } from "next-intl";
import { LinkNotAvailable } from "@/components/booking/LinkNotAvailable";
import { ManageShell } from "./_components/ManageShell";

// S11 (Booking UX §7): an invalid, expired or used link, one neutral page
// that never says whether an appointment or a person exists. Sent with
// HTTP 404 and noindex.
export default function BadLink() {
  const t = useTranslations("manage");
  return (
    <ManageShell title={t("badLink.title")}>
      <LinkNotAvailable />
    </ManageShell>
  );
}
