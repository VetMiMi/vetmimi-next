import type { CSSProperties } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { AA, C } from "@/lib/tokens";

// The details form's input, label and error, kept to the original /book look.
export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: `1px solid ${C.ink}33`,
  borderRadius: 4,
  fontFamily: "var(--sans)",
  fontSize: "1rem",
  backgroundColor: "#fff",
  color: C.ink,
  outline: "none",
  boxSizing: "border-box",
};

export const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: "var(--sans)",
  fontSize: "0.85rem",
  color: C.ink,
  fontWeight: 600,
  marginBottom: "0.3rem",
};

// A field's error under it: icon and words, not colour alone.
export function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p
      id={id}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        margin: "0.4rem 0 0",
        fontFamily: "var(--sans)",
        fontSize: "0.82rem",
        color: AA.action,
      }}
    >
      <WarningCircle size={16} weight="bold" aria-hidden />
      {children}
    </p>
  );
}
