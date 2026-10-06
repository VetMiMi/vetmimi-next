"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

// "Opens in 12 min", ticking once a minute and once a second in the last
// minute. At `opensAt` the page asks the server again, which then shows the
// device check without a reload. The server's clock is the reference, so a
// visitor's wrong clock does not open the page early or late.
export function TooEarly({ opensAt, now }: { opensAt: string; now: string }) {
  const t = useTranslations("session.tooEarly");
  const router = useRouter();
  const [skew] = useState(() => Date.parse(now) - Date.now());
  const [left, setLeft] = useState(() => Date.parse(opensAt) - Date.parse(now));

  useEffect(() => {
    // Once open, ask again every few seconds until the server agrees.
    if (left <= 0) router.refresh();
    const step =
      left <= 0 ? 5_000 : left > 60_000 ? left % 60_000 || 60_000 : 1_000;
    const timer = setTimeout(
      () => setLeft(Date.parse(opensAt) - (Date.now() + skew)),
      step,
    );
    return () => clearTimeout(timer);
  }, [left, opensAt, skew, router]);

  const text =
    left <= 0
      ? t("opening")
      : left > 60_000
        ? t("opensInMinutes", { minutes: Math.ceil(left / 60_000) })
        : t("opensInSeconds", { seconds: Math.ceil(left / 1_000) });

  return (
    <p
      role="timer"
      className="self-start rounded-pill bg-ochre/12 px-4 py-1.5 text-[0.92rem] font-semibold text-gold-text"
    >
      {text}
    </p>
  );
}
