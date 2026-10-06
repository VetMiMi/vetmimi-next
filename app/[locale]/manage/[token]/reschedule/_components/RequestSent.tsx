"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle } from "@phosphor-icons/react";
import { Btn } from "@/components/ui/Button";

// "Reschedule request sent" (#61). Focus moves to the heading so a screen
// reader hears the outcome; the appointment itself is unchanged.
export function RequestSent({
  token,
  times,
}: {
  token: string;
  times: string[];
}) {
  const t = useTranslations("manage.reschedule.sent");
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => title.current?.focus(), []);

  return (
    <section className="flex flex-col gap-4 rounded-card bg-paper px-[clamp(20px,4vw,36px)] py-[clamp(20px,4vw,32px)]">
      <h2
        ref={title}
        tabIndex={-1}
        className="flex items-center gap-2 text-[1.5rem] outline-none!"
      >
        <CheckCircle aria-hidden="true" size={26} className="text-indigo" />
        {t("title")}
      </h2>
      {times.length > 0 && (
        <div>
          <p className="mb-1 text-[0.88rem] font-semibold">{t("times")}</p>
          <ul className="list-disc pl-5 text-[0.95rem]">
            {times.map((time) => (
              <li key={time}>{time}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[0.95rem]">{t("text")}</p>
      <div>
        <Btn href={`/manage/${token}`}>{t("back")}</Btn>
      </div>
    </section>
  );
}
