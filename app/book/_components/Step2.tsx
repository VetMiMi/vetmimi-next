import { useState } from "react"
import { C } from "@/lib/tokens"
import { Btn } from "@/components/ui/Button"
import { getDaysInMonth, getFirstDayOfMonth, MONTH_NAMES, DAY_LABELS, TIME_SLOTS, isAvailableDate, formatDate } from "./booking"
import type { BookingState } from "./booking"

// ── Step 2: Date & Time ──────────────────────────────────────────────────────

export function Step2({
  selectedService,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  bookingState,
  onNext,
  onBack,
}: {
  selectedService: string
  selectedDate: string
  setSelectedDate: (d: string) => void
  selectedTime: string
  setSelectedTime: (t: string) => void
  bookingState: BookingState
  onNext: () => void
  onBack: () => void
}) {
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)

  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(calYear, calMonth, d))

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const handleDateClick = (date: Date) => {
    const iso = date.toISOString().slice(0, 10)
    setSelectedDate(iso)
    setSelectedTime("")
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(1.6rem,3vw,2.2rem)",
          color: C.ink,
          marginBottom: "0.5rem",
        }}
      >
        Choose a date and time
      </h2>

      <div
        style={{
          display: "inline-block",
          padding: "0.4rem 1rem",
          backgroundColor: `${C.indigo}12`,
          borderRadius: 20,
          fontFamily: "var(--sans)",
          fontSize: "0.85rem",
          color: C.indigo,
          marginBottom: "2rem",
        }}
      >
        {selectedService}
      </div>

      {bookingState === "no-times" && (
        <div
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: `${C.ochre}20`,
            border: `1px solid ${C.ochre}66`,
            borderRadius: 6,
            fontFamily: "var(--sans)",
            fontSize: "0.9rem",
            color: C.ink,
            marginBottom: "1.5rem",
          }}
        >
          There are no available times for this period. Please try a different date.
        </div>
      )}

      {bookingState === "time-lost" && (
        <div
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: `${C.coral}15`,
            border: `1px solid ${C.coral}44`,
            borderRadius: 6,
            fontFamily: "var(--sans)",
            fontSize: "0.9rem",
            color: C.ink,
            marginBottom: "1.5rem",
          }}
        >
          That time is no longer available. Please choose another.
        </div>
      )}

      {/* Calendar */}
      <div
        style={{
          backgroundColor: "#fff",
          border: `1px solid ${C.ink}18`,
          borderRadius: 10,
          padding: "1.5rem",
          marginBottom: "1.5rem",
          maxWidth: 420,
        }}
      >
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <button
            onClick={prevMonth}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: C.ink, padding: "0.25rem 0.5rem" }}
          >
            ‹
          </button>
          <span style={{ fontFamily: "var(--sans)", fontWeight: 600, color: C.ink }}>
            {MONTH_NAMES[calMonth]} {calYear}
          </span>
          <button
            onClick={nextMonth}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: C.ink, padding: "0.25rem 0.5rem" }}
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", marginBottom: "0.5rem" }}>
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: "0.72rem",
                fontFamily: "var(--sans)",
                color: `${C.ink}66`,
                fontWeight: 600,
                padding: "0.25rem 0",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />
            const available = isAvailableDate(date)
            const iso = date.toISOString().slice(0, 10)
            const isSelected = iso === selectedDate
            const isToday = new Date().toDateString() === date.toDateString()

            return (
              <button
                key={iso}
                disabled={!available}
                onClick={() => handleDateClick(date)}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  border: isSelected ? `2px solid ${C.indigo}` : "2px solid transparent",
                  borderRadius: 6,
                  cursor: available ? "pointer" : "default",
                  backgroundColor: isSelected
                    ? C.indigo
                    : available
                    ? `${C.coral}18`
                    : "transparent",
                  color: isSelected ? "#fff" : available ? C.coral : `${C.ink}33`,
                  fontFamily: "var(--sans)",
                  fontSize: "0.82rem",
                  fontWeight: available || isToday ? 600 : 400,
                  transition: "background-color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              fontFamily: "var(--sans)",
              fontWeight: 600,
              color: C.ink,
              marginBottom: "0.75rem",
              fontSize: "0.9rem",
            }}
          >
            Available times for {formatDate(selectedDate)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "0.5rem" }}>
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                style={{
                  padding: "0.6rem 1.25rem",
                  border: `1px solid ${selectedTime === t ? C.indigo : `${C.ink}33`}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  backgroundColor: selectedTime === t ? C.indigo : "#fff",
                  color: selectedTime === t ? "#fff" : C.ink,
                  fontFamily: "var(--sans)",
                  fontSize: "0.9rem",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.78rem",
              color: `${C.ink}66`,
              margin: 0,
            }}
          >
            Times shown in AEST [To confirm]
          </p>
        </div>
      )}

      {/* Summary */}
      {selectedDate && selectedTime && (
        <div
          style={{
            padding: "1.25rem",
            backgroundColor: C.paper,
            borderRadius: 8,
            marginBottom: "2rem",
            fontFamily: "var(--sans)",
            fontSize: "0.9rem",
          }}
        >
          <div style={{ color: `${C.ink}88`, marginBottom: "0.3rem", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your selection</div>
          <div style={{ color: C.ink, fontWeight: 600 }}>{selectedService}</div>
          <div style={{ color: `${C.ink}BB` }}>{formatDate(selectedDate)} at {selectedTime}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--sans)",
            color: `${C.ink}88`,
            fontSize: "0.9rem",
            padding: 0,
          }}
        >
          ← Back
        </button>
        <Btn onClick={onNext} disabled={!selectedDate || !selectedTime}>
          Continue to Your Details →
        </Btn>
      </div>
    </div>
  )
}
