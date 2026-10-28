import { useTranslations } from "next-intl";

export function ProgressIndicator({ step }: { step: number }) {
  const t = useTranslations("book.progress");
  const steps = [
    { n: 1, label: t("service") },
    { n: 2, label: t("dateTime") },
    { n: 3, label: t("details") },
    { n: 4, label: t("review") },
  ];

  return (
    <div className="mb-12 grid grid-cols-4 gap-2">
      {steps.map((s) => {
        const isActive = s.n === step;
        const isComplete = s.n < step;
        const circle = isActive
          ? "bg-indigo text-white"
          : isComplete
            ? "bg-rose text-white"
            : "border border-ink/20 bg-paper text-ink";
        const label = isActive
          ? "font-semibold text-indigo"
          : isComplete
            ? "text-rose"
            : "text-ink/40";

        return (
          <div key={s.n} className="flex min-w-0 justify-center">
            <div className="flex flex-col items-center gap-[0.4rem]">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[0.875rem] font-semibold transition-[background-color] duration-200 ease-[ease] ${circle}`}
              >
                {isComplete ? "✓" : s.n}
              </div>
              <span className={`text-center text-[0.72rem] ${label}`}>
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
