// Paper blocks with the final radii (brief §7 Loading). They do not shimmer:
// nothing loops in admin but the spinner (brief §6). The caller marks the
// region `aria-busy="true"`; the blocks themselves are hidden from screen
// readers.
const variants = {
  text: "h-4 w-[min(56ch,100%)] rounded-small",
  row: "h-12 w-full rounded-control",
  card: "h-40 w-full rounded-card",
};

export function Skeleton({
  variant,
  count = 1,
}: {
  variant: keyof typeof variants;
  count?: number;
}) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`bg-paper ${variants[variant]}`} />
      ))}
    </div>
  );
}
