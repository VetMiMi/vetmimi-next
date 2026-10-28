import { useTranslations } from "next-intl";

// Rendered by the portfolio and stories pages, which own the filter state.
export function FilterBar({
  categories,
  active,
  onChange,
  count,
}: {
  /** value is the filter id; label is the translated text shown. */
  categories: { value: string; label: string }[];
  active: string;
  onChange: (value: string) => void;
  count: number;
}) {
  const t = useTranslations("common.editorial");
  return (
    <div className="mb-9 flex items-center justify-between gap-5 border-b border-[#ded4ce] pb-[22px] max-md:flex-col max-md:items-start">
      <div
        role="group"
        aria-label={t("filterLabel")}
        className="flex flex-wrap gap-2"
      >
        {categories.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className="min-h-11 cursor-pointer rounded-[30px] border border-[#c6bec6] px-4 py-2.5 text-[0.82rem] text-indigo aria-pressed:border-indigo aria-pressed:bg-indigo aria-pressed:text-white"
            aria-pressed={active === value}
            onClick={() => onChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p
        className="text-[0.8rem] leading-[1.8] whitespace-nowrap text-muted"
        role="status"
      >
        {t("count", { count })}
      </p>
    </div>
  );
}
