import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
      <h2 className={stepTitle}>
        {problem ? t("step1.unavailable.title") : t("step1.title")}
      </h2>
      {!problem && <p className={stepIntro}>{t("step1.intro")}</p>}

      {problem === "loadFailed" && (
        <Notice tone="coral" role="alert">
          {t("step1.loadFailed")}
          <NoticeActions>
            <button type="button" onClick={onRetry} className={noticeLink}>
              {t("shared.retry")}
            </button>
            <Link href="/contact" className={noticeLink}>
              {t("shared.contact")}
            </Link>
          </NoticeActions>
        </Notice>
      )}
      {problem === "paused" && (
        <Notice tone="coral">
          {t.rich("step1.unavailable.paused", {
            link: (chunks) => (
              <Link href="/contact" className="text-rose">
                {chunks}
              </Link>
            ),
          })}
        </Notice>
      )}
      {problem === "unavailable" && (
        <Notice tone="coral">
          <UnavailableBadge label={t("step1.unavailable.badge")} />
          <p>{t("step1.unavailable.service")}</p>
          <NoticeActions>
            <Link href="/services" className={noticeLink}>
              {t("shared.services")}
            </Link>
            <Link href="/contact" className={noticeLink}>
              {t("shared.contact")}
            </Link>
          </NoticeActions>
        </Notice>
      )}

      {!blocked && items.length > 0 && (
        <div
          role="radiogroup"
          aria-label={t("step1.title")}
          className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2"
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
        <div className="mb-10 rounded-cell bg-paper px-6 py-5 text-[0.9rem] leading-[1.6] text-ink/73">
          {t.rich("step1.workshops", {
            strong: (chunks) => <strong className="text-ink">{chunks}</strong>,
            link: (chunks) => (
              <Link href="/contact" className="text-rose no-underline">
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
      className={`cursor-pointer rounded-small border-2 p-8 text-left transition-[border-color,background-color] duration-[180ms] ease-[ease] ${checked ? "border-indigo bg-indigo/3" : "border-ink/13 bg-white"}`}
    >
      <div className="mb-2 text-[1.05rem] font-semibold text-ink">
        {service.name}
      </div>
      {service.description && (
        <div className="text-[0.9rem] leading-[1.6] text-ink/73">
          {service.description}
        </div>
      )}
      <div className="mt-3 text-[0.82rem] text-ink/73">
        {details.join(" · ")}
      </div>
      {checked && (
        <div className="mt-4 inline-flex items-center gap-[0.4rem] text-[0.8rem] font-semibold text-indigo">
          <span aria-hidden>✓</span> {t("step1.selected")}
        </div>
      )}
    </button>
  );
}

function UnavailableBadge({ label }: { label: string }) {
  return (
    <span className="mb-[0.6rem] inline-block rounded-pill bg-paper px-3 py-[0.2rem] text-[0.78rem] font-semibold text-muted">
      {label}
    </span>
  );
}
