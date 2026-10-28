import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, HourglassMedium } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import { PetalOutline } from "@/components/art/Shapes";
import { usePracticeFormat } from "@/components/booking/practiceFormat";
import type { Receipt } from "./booking";

const PENDING_STEPS = ["review", "email", "join"] as const;
const CONFIRMED_STEPS = ["email", "manage", "join"] as const;

// S01 Pending and S02 Confirmed: shown only after the API stored the
// request, with the reference it returned (Requirements §4).
export function ResultState({ receipt }: { receipt: Receipt }) {
  const t = useTranslations("book");
  const format = usePracticeFormat(receipt.timezone);
  const status = receipt.status;
  const Icon = status === "pending" ? HourglassMedium : CheckCircle;
  const nextSteps =
    status === "pending"
      ? PENDING_STEPS.map((step) => t(`result.next.pending.${step}`))
      : CONFIRMED_STEPS.map((step) => t(`result.next.confirmed.${step}`));
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const summary = [
    receipt.service.name,
    t("step4.dateTimeValue", {
      dateTime: format.dateTime(receipt.startsAt),
      zone: format.zone(receipt.startsAt),
    }),
    `${t("shared.minutes", { count: receipt.durationMinutes })} · ${t(`formats.${receipt.format}`)}`,
  ];

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-8 py-16">
      <div className="max-w-[560px] text-center">
        <div className="mx-auto mb-6 w-14">
          <PetalOutline size={56} />
        </div>
        <div
          className={`mb-8 inline-flex items-center gap-[0.4rem] rounded-pill px-5 py-[0.4rem] text-[0.82rem] font-bold tracking-[0.08em] uppercase ${status === "pending" ? "bg-ochre/19 text-gold-text" : "bg-indigo/12 text-indigo"}`}
        >
          <Icon size={16} weight="bold" aria-hidden />
          {t(`result.${status}.badge`)}
        </div>

        {/* The line height needs `!` to beat the global h1 rule; Burmese keeps
            its own taller one. */}
        <h1
          ref={heading}
          tabIndex={-1}
          className="mb-6 text-[clamp(2rem,4vw,2.8rem)] text-ink outline-none leading-[1.2]"
        >
          {t(`result.${status}.title`)}
        </h1>

        <p className="mb-8 text-[1rem] leading-[1.78] text-ink/73">
          {t(`result.${status}.text`)}
        </p>

        <div className="mb-6 rounded-control border border-ink/9 bg-white px-6 py-5 text-left leading-[1.7] wrap-anywhere">
          <div className="mb-[0.4rem] font-bold text-ink">
            {t("result.reference", { reference: receipt.reference })}
          </div>
          {summary.map((line) => (
            <div key={line} className="text-ink/80">
              {line}
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-control bg-paper px-8 py-7 text-left">
          <div className="mb-4 text-[0.9rem] font-bold text-ink">
            {t("result.next.title")}
          </div>
          {nextSteps.map((step, i) => (
            <div
              key={step}
              className="flex items-start gap-4 not-last:mb-[0.875rem]"
            >
              <div className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-indigo text-[0.75rem] font-bold text-white">
                {i + 1}
              </div>
              <span className="pt-[0.15rem] leading-[1.6] text-ink/80">
                {step}
              </span>
            </div>
          ))}
        </div>

        <p className="mb-10 text-left text-[0.82rem] leading-[1.6] text-muted">
          {t.rich("boundary", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Btn href="/">{t("result.home")}</Btn>
          <Link
            href="/contact"
            className="inline-flex items-center gap-[0.3rem] text-[0.9rem] text-rose no-underline"
          >
            {t("result.question")}
          </Link>
        </div>
      </div>
    </div>
  );
}
