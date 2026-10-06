import { useTranslations } from "next-intl";

// The card's shape while the session state loads (brief §7 Loading).
export default function Loading() {
  const t = useTranslations("session");
  const bar = "animate-pulse rounded-small bg-paper motion-reduce:animate-none";
  return (
    <div
      aria-busy="true"
      className="bg-canvas px-4 pt-[clamp(32px,6vw,64px)] pb-20 sm:px-5"
    >
      <div className="mx-auto max-w-[560px]">
        <p className="mb-3 text-[0.75rem] font-bold tracking-[0.14em] text-label uppercase">
          {t("eyebrow")}
        </p>
        <div className="flex flex-col gap-4 rounded-card border border-card-border bg-white px-[clamp(20px,4vw,36px)] py-[clamp(24px,4vw,36px)]">
          <div className={`h-9 w-3/4 ${bar}`} />
          <div className={`h-4 w-full ${bar}`} />
          <div className={`h-4 w-5/6 ${bar}`} />
          <div className={`mt-2 h-12 w-40 ${bar}`} />
        </div>
      </div>
    </div>
  );
}
