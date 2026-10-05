import type { AnchorHTMLAttributes } from "react";
import { useTranslations } from "next-intl";

// A link to another site. It opens in a new tab, so its accessible name
// says so (brief §10), and it does not hand the new page this window.
export function ExternalLink({
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">) {
  const t = useTranslations("common");
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> {t("newTab")}</span>
    </a>
  );
}
