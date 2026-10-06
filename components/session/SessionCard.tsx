import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

// The join page's calm frame (brief §9, 1/5 treatment): canvas page, one
// white card, no artwork, and the crisis boundary every booking page
// repeats. Every state that is not the call itself sits in it.
export function SessionCard({
  title,
  wide = false,
  children,
}: {
  title: string;
  // The device check needs room for the camera preview.
  wide?: boolean;
  children: ReactNode;
}) {
  const t = useTranslations();
  return (
    <div className="bg-canvas px-4 pt-[clamp(32px,6vw,64px)] pb-20 sm:px-5">
      <div className={`mx-auto ${wide ? "max-w-[720px]" : "max-w-[560px]"}`}>
        <p className="mb-3 text-[0.75rem] font-bold tracking-[0.14em] text-label uppercase">
          {t("session.eyebrow")}
        </p>
        <section className="rounded-card border border-card-border bg-white px-[clamp(20px,4vw,36px)] py-[clamp(24px,4vw,36px)]">
          <h1 className="mb-4 text-[clamp(1.6rem,2.4vw,2rem)] text-ink">
            {title}
          </h1>
          <div className="flex flex-col gap-5 text-[1.0625rem] leading-[1.7] text-ink/80">
            {children}
          </div>
        </section>
        <p className="mt-6 text-[0.82rem] leading-[1.6] text-muted">
          {t.rich("book.boundary", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      </div>
    </div>
  );
}

// The actions row under a card's text.
export function CardActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
      {children}
    </div>
  );
}
