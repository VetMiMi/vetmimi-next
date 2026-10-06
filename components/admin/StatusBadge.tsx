import {
  statuses,
  type StatusKind,
  type StatusOf,
  type StatusStyle,
} from "./status";

// Icon, label and tint together, never colour alone (Booking UX §11).
// `detail` follows the label, e.g. the time of a scheduled post.
export function StatusBadge<K extends StatusKind>({
  kind,
  status,
  detail,
}: {
  kind: K;
  status: StatusOf<K>;
  detail?: string;
}) {
  const {
    label,
    tint,
    text,
    icon: Icon,
  } = (statuses[kind] as Record<string, StatusStyle>)[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-[11px] py-1 text-[0.78rem] leading-tight font-semibold whitespace-nowrap ${tint} ${text}`}
    >
      <Icon aria-hidden="true" size={16} className="shrink-0" />
      {detail ? `${label} · ${detail}` : label}
    </span>
  );
}
