"use client";
import { useTranslations } from "next-intl";
import { X } from "@phosphor-icons/react";

// The times picked so far, as removable chips (brief §5: pills on paper),
// with how many of the three are used. Announced as they change.
export function ChosenTimes({
  times,
  full,
  onRemove,
}: {
  times: { startsAt: string; label: string }[];
  full: boolean;
  onRemove: (startsAt: string) => void;
}) {
  const t = useTranslations("manage.reschedule");
  return (
    <section aria-labelledby="chosen-title" aria-live="polite">
      <h3 id="chosen-title" className="mb-2 text-[1.1rem]">
        {t("chosen")}
        <span className="mt-1 block font-body text-[0.85rem] text-muted">
          {t("chosenCount", { count: times.length })}
        </span>
      </h3>
      {times.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {times.map(({ startsAt, label }) => (
            <li
              key={startsAt}
              className="inline-flex items-center gap-1 rounded-pill bg-paper py-1 pr-1 pl-4 text-[0.88rem]"
            >
              {label}
              <button
                type="button"
                aria-label={t("remove", { time: label })}
                onClick={() => onRemove(startsAt)}
                className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-ink/8 hover:text-ink"
              >
                <X aria-hidden="true" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {full && <p className="mt-2 text-[0.85rem] text-muted">{t("full")}</p>}
    </section>
  );
}
