import { useTranslations } from "next-intl";
import "@/styles/editorial.css";

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
    <div className="ed-filter-bar">
      <div role="group" aria-label={t("filterLabel")} className="ed-filters">
        {categories.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={active === value}
            onClick={() => onChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="ed-count" role="status">
        {t("count", { count })}
      </p>
    </div>
  );
}
