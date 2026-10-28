import { useTranslations } from "next-intl";
import { C } from "@/lib/tokens";

export function HeroTrustStrip() {
  const t = useTranslations("home");
  return (
    <div
      style={{
        display: "flex",
        gap: "2.5rem",
        flexWrap: "wrap",
        paddingTop: "1.75rem",
        borderTop: "1px solid rgba(254,252,248,0.15)",
      }}
    >
      {[
        t("hero.trust.certified"),
        t("hero.trust.hospital"),
        t("hero.trust.location"),
      ].map((label) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: C.ochre,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.8rem",
              color: "rgba(255,247,239,0.5)",
              lineHeight: 1.3,
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
