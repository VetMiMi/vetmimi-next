"use client";
import { useState } from "react";
import { C } from "@/lib/tokens";

/** One question on the homepage FAQ; the answer opens in place. */
export function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(40,37,45,0.1)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "1.35rem 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.05rem",
            color: C.ink,
            lineHeight: 1.4,
          }}
        >
          {q}
        </span>
        <span
          style={{
            color: C.coral,
            fontSize: "1.4rem",
            lineHeight: 1,
            flexShrink: 0,
            marginTop: "2px",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            display: "block",
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? "600px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.93rem",
            color: "rgba(40,37,45,0.65)",
            lineHeight: 1.8,
            paddingBottom: "1.35rem",
            margin: 0,
          }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}
