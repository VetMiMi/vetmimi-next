import { C } from "@/lib/tokens"

// ── Progress indicator ──────────────────────────────────────────────────────

export function ProgressIndicator({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Service" },
    { n: 2, label: "Date & Time" },
    { n: 3, label: "Your Details" },
    { n: 4, label: "Review" },
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.5rem", marginBottom: "3rem" }}>
      {steps.map((s) => {
        const isActive = s.n === step
        const isComplete = s.n < step

        const circleStyle: React.CSSProperties = {
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.875rem",
          fontFamily: "var(--sans)",
          fontWeight: 600,
          flexShrink: 0,
          backgroundColor: isActive ? C.indigo : isComplete ? C.rose : C.paper,
          color: isActive || isComplete ? "#fff" : C.ink,
          border: isActive || isComplete ? "none" : `1px solid ${C.ink}33`,
          transition: "background-color 0.2s",
        }

        return (
          <div key={s.n} style={{ display: "flex", justifyContent: "center", minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
              <div style={circleStyle}>{isComplete ? "✓" : s.n}</div>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontFamily: "var(--sans)",
                  color: isActive ? C.indigo : isComplete ? C.rose : `${C.ink}66`,
                  fontWeight: isActive ? 600 : 400,
                  textAlign: "center",
                }}
              >
                {s.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
