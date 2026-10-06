import Link from "next/link";

export type TabItem = {
  id: string;
  label: string;
  href: string;
  count?: number;
};

// Filters whose state lives in the URL, in the .ed-filters pill style
// (brief §8). They wrap rather than scroll sideways. The border is the
// admin input border (#8a8389, 3.69:1) rather than the public #c6bec6,
// which is under the 3:1 a control's edge needs.
export function Tabs({
  label,
  items,
  active,
}: {
  label: string;
  items: TabItem[];
  active: string;
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              aria-current={item.id === active ? "page" : undefined}
              className="inline-flex min-h-11 items-center gap-1 rounded-pill border border-input-border px-4 py-2.5 text-[0.82rem] leading-tight text-indigo no-underline transition-colors duration-150 hover:bg-indigo/12 motion-reduce:transition-none aria-[current=page]:border-indigo aria-[current=page]:bg-indigo aria-[current=page]:text-white"
            >
              {item.label}
              {item.count !== undefined && (
                <>
                  <span aria-hidden="true">({item.count})</span>
                  <span className="sr-only">
                    , {item.count} {item.count === 1 ? "item" : "items"}
                  </span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
