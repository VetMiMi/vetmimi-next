import "@/styles/editorial.css"

// Rendered by the portfolio and stories pages, which own the filter state.
export function FilterBar({
  categories,
  active,
  onChange,
  count,
}: {
  categories: string[]
  active: string
  onChange: (value: string) => void
  count: number
}) {
  return (
    <div className="ed-filter-bar">
      <div role="group" aria-label="Filter by category" className="ed-filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={active === category}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="ed-count" role="status">
        {count} {count === 1 ? "item" : "items"}
      </p>
    </div>
  )
}
