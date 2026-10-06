import type { ReactNode } from "react";
import { C } from "@/lib/tokens";

// The flow's message boxes: coral for something that went wrong, ochre for
// "nothing here right now", paper for a quiet note.
const tones = {
  coral: { backgroundColor: `${C.coral}15`, border: `1px solid ${C.coral}44` },
  ochre: { backgroundColor: `${C.ochre}20`, border: `1px solid ${C.ochre}66` },
  paper: { backgroundColor: C.paper, border: "1px solid transparent" },
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
      style={{
        ...tones[tone],
        padding: "1rem 1.25rem",
        borderRadius: 6,
        fontFamily: "var(--sans)",
        fontSize: "0.9rem",
        color: C.ink,
        lineHeight: 1.6,
        marginBottom: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}

// A row of next actions under a notice.
export function NoticeActions({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem 1.25rem",
        marginTop: "0.75rem",
      }}
    >
      {children}
    </div>
  );
}

export const noticeLink = {
  color: C.rose,
  fontFamily: "var(--sans)",
  fontSize: "0.9rem",
  fontWeight: 600,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: 2,
} as const;
