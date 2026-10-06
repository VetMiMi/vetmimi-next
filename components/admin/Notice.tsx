import { Info, WarningCircle } from "@phosphor-icons/react/dist/ssr";

type Tone = "error" | "info";

// The .contact-status box (brief §7 Errors): what happened, in a tint of the
// tone's colour. An error is announced at once (`role="alert"`); news such
// as "You have signed out." politely (`role="status"`). It takes focus when
// a caller passes a ref and moves focus to it.
const tones = {
  error: {
    box: "border-red/27 bg-red/7 text-action",
    role: "alert",
    Icon: WarningCircle,
  },
  info: {
    box: "border-indigo/27 bg-indigo/7 text-indigo",
    role: "status",
    Icon: Info,
  },
} as const;

export function Notice({
  tone,
  children,
  ref,
}: {
  tone: Tone;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const { box, role, Icon } = tones[tone];
  return (
    <div
      ref={ref}
      role={role}
      tabIndex={-1}
      className={`flex items-start gap-2 rounded-notice border px-6 py-5 text-[0.92rem] leading-[1.65] ${box}`}
    >
      <Icon aria-hidden="true" size={20} className="mt-[3px] shrink-0" />
      <p>{children}</p>
    </div>
  );
}
