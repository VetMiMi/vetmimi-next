// A label/value list in the .contact-details pattern: the `dt` style from
// brief §4 above each value.
export function Facts({
  items,
}: {
  items: [label: string, value: React.ReactNode][];
}) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="mb-1 text-[0.75rem] font-semibold tracking-[0.1em] text-muted uppercase">
            {label}
          </dt>
          <dd className="text-[0.95rem] break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export const cardTitle = "mb-6 text-[1.35rem]";
