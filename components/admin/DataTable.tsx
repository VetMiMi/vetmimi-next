import Link from "next/link";

export type Column<Row> = {
  key: string;
  label: string;
  render: (row: Row) => React.ReactNode;
};

const linkClass =
  "font-semibold text-ink underline decoration-1 underline-offset-4 transition-colors duration-150 hover:text-indigo motion-reduce:transition-none";

// One column config, two renderings (brief §7 Tables and cards): a table
// from 768px, stacked cards below ("Mobile should use stacked cards rather
// than forcing a wide table"). The hidden one is display:none, so only one
// is ever in the accessibility tree. The first column links to the row's
// detail page, which makes every row reachable by keyboard.
export function DataTable<Row>({
  caption,
  columns,
  rows,
  rowHref,
  empty,
}: {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  rowHref: (row: Row) => string;
  empty: React.ReactNode;
}) {
  if (rows.length === 0) return empty;
  const [first, ...rest] = columns;

  return (
    <>
      <table className="hidden w-full border-collapse text-left text-[0.95rem] md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-divider">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="py-3 pr-6 text-[0.75rem] font-semibold tracking-[0.1em] text-muted uppercase last:pr-0"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowHref(row)} className="border-b border-divider">
              <th scope="row" className="py-3 pr-6 text-left font-normal">
                <Link href={rowHref(row)} className={linkClass}>
                  {first.render(row)}
                </Link>
              </th>
              {rest.map((column) => (
                <td key={column.key} className="py-3 pr-6 last:pr-0">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul aria-label={caption} className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li
            key={rowHref(row)}
            className="rounded-card border border-card-border bg-raised px-5 py-2"
          >
            <dl className="text-[0.88rem]">
              {columns.map((column, i) => (
                <div
                  key={column.key}
                  className="grid grid-cols-[100px_1fr] gap-4 border-b border-divider py-3 last:border-b-0"
                >
                  <dt className="text-muted">{column.label}</dt>
                  <dd className="min-w-0 break-words">
                    {i === 0 ? (
                      <Link href={rowHref(row)} className={linkClass}>
                        {column.render(row)}
                      </Link>
                    ) : (
                      column.render(row)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
