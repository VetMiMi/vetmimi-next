import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { SERVICE_IDS } from "./booking";
import type { BookingState, ServiceId } from "./booking";

// ── Step 1: Service Selection ────────────────────────────────────────────────

export function Step1({
  selectedService,
  setSelectedService,
  bookingState,
  onNext,
}: {
  selectedService: ServiceId | "";
  setSelectedService: (s: ServiceId) => void;
  bookingState: BookingState;
  onNext: () => void;
}) {
  const t = useTranslations("book");

  if (bookingState === "unavailable") {
    return (
      <div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(1.6rem,3vw,2.2rem)",
            color: C.ink,
            marginBottom: "1.5rem",
          }}
        >
          {t("step1.unavailable.title")}
        </h2>
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: `${C.coral}15`,
            border: `1px solid ${C.coral}44`,
            borderRadius: 8,
            fontFamily: "var(--sans)",
            color: C.ink,
          }}
        >
          <p style={{ margin: 0 }}>
            {t.rich("step1.unavailable.text", {
              link: (chunks) => (
                <Link href="/contact" style={{ color: C.rose }}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    );
  }

  const services = SERVICE_IDS.map((id) => ({
    id,
    title: t(`services.${id}.title`),
    description: t(`services.${id}.description`),
  }));

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(1.6rem,3vw,2.2rem)",
          color: C.ink,
          marginBottom: "0.5rem",
        }}
      >
        {t("step1.title")}
      </h2>
      <p
        style={{
          fontFamily: "var(--sans)",
          color: `${C.ink}BB`,
          marginBottom: "2rem",
        }}
      >
        {t("step1.intro")}
      </p>

      <div
        className="grid-cols-1 md:grid-cols-2"
        style={{ display: "grid", gap: "1.25rem", marginBottom: "2rem" }}
      >
        {services.map((svc) => (
          <button
            key={svc.id}
            onClick={() => setSelectedService(svc.id)}
            style={{
              border: `2px solid ${selectedService === svc.id ? C.indigo : `${C.ink}22`}`,
              borderRadius: 8,
              padding: "2rem",
              cursor: "pointer",
              backgroundColor:
                selectedService === svc.id ? `${C.indigo}08` : "#fff",
              textAlign: "left",
              transition: "border-color 0.18s, background-color 0.18s",
            }}
          >
            <div
              style={{
                fontFamily: "var(--sans)",
                fontWeight: 600,
                fontSize: "1.05rem",
                color: C.ink,
                marginBottom: "0.5rem",
              }}
            >
              {svc.title}
            </div>
            <div
              style={{
                fontFamily: "var(--sans)",
                color: `${C.ink}BB`,
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              {svc.description}
            </div>
            {selectedService === svc.id && (
              <div
                style={{
                  marginTop: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.8rem",
                  fontFamily: "var(--sans)",
                  color: C.indigo,
                  fontWeight: 600,
                }}
              >
                <span>✓</span> {t("step1.selected")}
              </div>
            )}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "1.25rem 1.5rem",
          backgroundColor: C.paper,
          borderRadius: 6,
          marginBottom: "2.5rem",
          fontFamily: "var(--sans)",
          fontSize: "0.9rem",
          color: `${C.ink}BB`,
          lineHeight: 1.6,
        }}
      >
        {t.rich("step1.workshops", {
          strong: (chunks) => (
            <strong style={{ color: C.ink }}>{chunks}</strong>
          ),
          link: (chunks) => (
            <Link
              href="/contact"
              style={{ color: C.rose, textDecoration: "none" }}
            >
              {chunks}
            </Link>
          ),
        })}
      </div>

      <Btn onClick={onNext} disabled={!selectedService}>
        {t("step1.continue")}
      </Btn>
    </div>
  );
}
