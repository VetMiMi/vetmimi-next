import type { ReactNode } from "react";

// The flow's message boxes: coral for something that went wrong, ochre for
// "nothing here right now", paper for a quiet note.
const tones = {
  coral: "border-coral/27 bg-coral/8",
  ochre: "border-ochre/40 bg-ochre/13",
  paper: "border-transparent bg-paper",
} as const;

export function Notice({
  tone,
  role,
  children,
  id,
  tabIndex,
}: {
  tone: keyof typeof tones;
  role?: "alert" | "status";
  children: ReactNode;
  id?: string;
  tabIndex?: number;
}) {
  return (
    <div
      id={id}
      role={role}
      tabIndex={tabIndex}
      className={`mb-6 rounded-cell border px-5 py-4 text-[0.9rem] leading-[1.6] text-ink ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

// A row of next actions under a notice.
export function NoticeActions({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{children}</div>;
}

export const noticeLink =
  "cursor-pointer text-[0.9rem] font-semibold text-rose underline underline-offset-2";
