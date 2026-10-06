import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { Notice, NoticeActions, noticeLink } from "./Notice";
import { stepIntro, stepTitle } from "./booking";
import type { BookableService, ServiceList } from "./booking";

// Why the visitor cannot continue: the list failed to load, booking is
// paused, or the service they came for is not bookable (S06).
export type ServiceProblem = "loadFailed" | "paused" | "unavailable" | null;

export function ServiceStep({
  list,
  selected,
  problem,
  onSelect,
  onRetry,
  onNext,
}: {
  list: ServiceList | null;
  selected: string;
  problem: ServiceProblem;
  onSelect: (slug: string) => void;
  onRetry: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("book");
  const items = list?.items ?? [];
  const blocked = problem === "loadFailed" || problem === "paused";

  return (
    <div>
      <h2 style={stepTitle}>
        {problem ? t("step1.unavailable.title") : t("step1.title")}
      </h2>
      {!problem && <p style={stepIntro}>{t("step1.intro")}</p>}

      {problem === "loadFailed" && (
        <Notice tone="coral" role="alert">
          {t("step1.loadFailed")}
          <NoticeActions>
            <button type="button" onClick={onRetry} style={noticeLink}>
              {t("shared.retry")}
            </button>
            <Link href="/contact" style={noticeLink}>
              {t("shared.contact")}
            </Link>
          </NoticeActions>
        </Notice>
      )}
      {problem === "paused" && (
        <Notice tone="coral">
          {t.rich("step1.unavailable.paused", {
            link: (chunks) => (
              <Link href="/contact" style={{ color: C.rose }}>
                {chunks}
              </Link>
            ),
          })}
        </Notice>
      )}
      {problem === "unavailable" && (
        <Notice tone="coral">
          <UnavailableBadge label={t("step1.unavailable.badge")} />
          <p style={{ margin: 0 }}>{t("step1.unavailable.service")}</p>
          <NoticeActions>
            <Link href="/services" style={noticeLink}>
              {t("shared.services")}
            </Link>
            <Link href="/contact" style={noticeLink}>
              {t("shared.contact")}
            </Link>
          </NoticeActions>
        </Notice>
      )}

      {!blocked && items.length > 0 && (
        <div
          role="radiogroup"
          aria-label={t("step1.title")}
          className="grid-cols-1 md:grid-cols-2"
          style={{ display: "grid", gap: "1.25rem", marginBottom: "2rem" }}
        >
          {items.map((svc) => (
            <ServiceCard
              key={svc.slug}
              service={svc}
              checked={svc.slug === selected}
              onSelect={() => onSelect(svc.slug)}
            />
          ))}
        </div>
      )}

      {!blocked && (
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
      )}

      {!blocked && items.length > 0 && (
        <Btn onClick={onNext} disabled={!selected}>
          {t("step1.continue")}
        </Btn>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  checked,
  onSelect,
}: {
  service: BookableService;
  checked: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("book");
  const details = [
    t("shared.minutes", { count: service.durationMinutes }),
    service.formats.map((f) => t(`formats.${f}`)).join(" / "),
    t(`actions.${service.bookingAction}`),
  ];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      style={{
        border: `2px solid ${checked ? C.indigo : `${C.ink}22`}`,
        borderRadius: 8,
        padding: "2rem",
        cursor: "pointer",
        backgroundColor: checked ? `${C.indigo}08` : "#fff",
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
        {service.name}
      </div>
      {service.description && (
        <div
          style={{
            fontFamily: "var(--sans)",
            color: `${C.ink}BB`,
            fontSize: "0.9rem",
            lineHeight: 1.6,
          }}
        >
          {service.description}
        </div>
      )}
      <div
        style={{
          fontFamily: "var(--sans)",
          color: `${C.ink}BB`,
          fontSize: "0.82rem",
          marginTop: "0.75rem",
        }}
      >
        {details.join(" · ")}
      </div>
      {checked && (
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
          <span aria-hidden>✓</span> {t("step1.selected")}
        </div>
      )}
    </button>
  );
}

function UnavailableBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.75rem",
        marginBottom: "0.6rem",
        backgroundColor: C.paper,
        color: AA.muted,
        borderRadius: 20,
        fontSize: "0.78rem",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
