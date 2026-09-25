"use client";
import { useState } from "react"
import Link from "next/link";
import { C } from "@/lib/tokens"
import { Btn } from "@/components/ui/Button"

type BookingState = null | "success" | "failed" | "no-times" | "time-lost" | "unavailable"

interface BookingFormData {
  name: string
  email: string
  phone: string
  format: string
  note: string
  privacyAck: boolean
  policyAck: boolean
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TIME_SLOTS = ["10:00 am", "11:00 am", "2:00 pm", "3:00 pm"]

function isAvailableDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const fiveDaysFromNow = new Date(today)
  fiveDaysFromNow.setDate(today.getDate() + 5)
  const day = date.getDay()
  return date >= fiveDaysFromNow && (day === 2 || day === 4)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

// ── Progress indicator ──────────────────────────────────────────────────────

function ProgressIndicator({ step }: { step: number }) {
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

// ── Input styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: `1px solid ${C.ink}33`,
  borderRadius: 4,
  fontFamily: "var(--sans)",
  fontSize: "1rem",
  marginBottom: "1rem",
  backgroundColor: "#fff",
  color: C.ink,
  outline: "none",
  boxSizing: "border-box",
}

// ── Step 1: Service Selection ────────────────────────────────────────────────

function Step1({
  selectedService,
  setSelectedService,
  bookingState,
  onNext,
}: {
  selectedService: string
  setSelectedService: (s: string) => void
  bookingState: BookingState
  onNext: () => void
}) {
  if (bookingState === "unavailable") {
    return (
      <div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,3vw,2.2rem)", color: C.ink, marginBottom: "1.5rem" }}>
          Service unavailable
        </h2>
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: `${C.coral}15`,
            border: `1px solid ${C.coral}44`,
            borderRadius: 8,
            fontFamily: "var(--sans)",
            color: C.ink,
          }}
        >
          <p style={{ margin: 0 }}>Booking is not currently available. Please <Link href="/contact" style={{ color: C.rose }}>contact us</Link> to discuss your options.</p>
        </div>
      </div>
    )
  }

  const services = [
    {
      id: "Individual Art Therapy",
      title: "Individual Art Therapy",
      description: "One-to-one sessions tailored to your needs. Work at your own pace in a private, supportive space.",
    },
    {
      id: "Group Art & Wellbeing",
      title: "Group Art & Wellbeing",
      description: "Small group creative sessions. Connect with others through shared creative experience.",
    },
  ]

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
        Choose a service
      </h2>
      <p style={{ fontFamily: "var(--sans)", color: `${C.ink}BB`, marginBottom: "2rem" }}>
        Select the type of session you would like to book.
      </p>

      <div className="grid-cols-1 md:grid-cols-2" style={{ display: "grid", gap: "1.25rem", marginBottom: "2rem" }}>
        {services.map((svc) => (
          <button
            key={svc.id}
            onClick={() => setSelectedService(svc.id)}
            style={{
              border: `2px solid ${selectedService === svc.id ? C.indigo : `${C.ink}22`}`,
              borderRadius: 8,
              padding: "2rem",
              cursor: "pointer",
              backgroundColor: selectedService === svc.id ? `${C.indigo}08` : "#fff",
              textAlign: "left",
              transition: "border-color 0.18s, background-color 0.18s",
            }}
          >
            <div
              style={{
                fontFamily: "var(--sans)",
                fontWeight: 600,
                fontSize: "1.05rem",
                color: C.ink,
                marginBottom: "0.5rem",
              }}
            >
              {svc.title}
            </div>
            <div style={{ fontFamily: "var(--sans)", color: `${C.ink}BB`, fontSize: "0.9rem", lineHeight: 1.6 }}>
              {svc.description}
            </div>
            {selectedService === svc.id && (
              <div
                style={{
                  marginTop: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.8rem",
                  fontFamily: "var(--sans)",
                  color: C.indigo,
                  fontWeight: 600,
                }}
              >
                <span>✓</span> Selected
              </div>
            )}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "1.25rem 1.5rem",
          backgroundColor: C.paper,
          borderRadius: 6,
          marginBottom: "2.5rem",
          fontFamily: "var(--sans)",
          fontSize: "0.9rem",
          color: `${C.ink}BB`,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: C.ink }}>Workshops & Programs</strong> are arranged by enquiry.{" "}
        <Link href="/contact" style={{ color: C.rose, textDecoration: "none" }}>
          Contact us
        </Link>{" "}
        to discuss your project.
      </div>

      <Btn onClick={onNext} disabled={!selectedService}>
        Continue to Date &amp; Time →
      </Btn>
    </div>
  )
}

// ── Step 2: Date & Time ──────────────────────────────────────────────────────

function Step2({
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

// ── Step 3: Your Details ─────────────────────────────────────────────────────

function Step3({
  selectedService,
  formData,
  setFormData,
  onNext,
  onBack,
}: {
  selectedService: string
  formData: BookingFormData
  setFormData: (f: BookingFormData) => void
  onNext: () => void
  onBack: () => void
}) {
  const isIndividual = selectedService === "Individual Art Therapy"

  const update = (key: keyof BookingFormData, value: string | boolean) => {
    setFormData({ ...formData, [key]: value })
  }

  const canProceed = formData.name.trim() !== "" && formData.email.trim() !== "" && formData.privacyAck && formData.policyAck

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--sans)",
    fontSize: "0.85rem",
    color: C.ink,
    fontWeight: 600,
    marginBottom: "0.3rem",
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
        Your details
      </h2>
      <p style={{ fontFamily: "var(--sans)", color: `${C.ink}BB`, marginBottom: "2rem" }}>
        Please provide your contact information.
      </p>

      <div style={{ maxWidth: 520 }}>
        <label>
          <span style={labelStyle}>Full name <span style={{ color: C.coral }}>*</span></span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </label>

        <label>
          <span style={labelStyle}>Email address <span style={{ color: C.coral }}>*</span></span>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </label>

        <label>
          <span style={labelStyle}>Phone number <span style={{ color: `${C.ink}66`, fontWeight: 400 }}>(optional)</span></span>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+61 4xx xxx xxx"
            style={inputStyle}
          />
        </label>

        {isIndividual && (
          <label>
            <span style={labelStyle}>Session format</span>
            <select
              value={formData.format}
              onChange={(e) => update("format", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select a format</option>
              <option value="Online">Online</option>
              <option value="In-person">In-person [To confirm]</option>
            </select>
          </label>
        )}

        <label>
          <span style={labelStyle}>
            Short note <span style={{ color: `${C.ink}66`, fontWeight: 400 }}>(optional)</span>
          </span>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.82rem",
              color: `${C.ink}99`,
              marginTop: 0,
              marginBottom: "0.5rem",
              lineHeight: 1.6,
            }}
          >
            You are welcome to share anything that would help Daw Mi prepare. Please do not include private medical or detailed health information here.
          </p>
          <textarea
            value={formData.note}
            onChange={(e) => update("note", e.target.value)}
            rows={4}
            placeholder="Optional note…"
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </label>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={formData.privacyAck}
              onChange={(e) => update("privacyAck", e.target.checked)}
              style={{ marginTop: "0.2rem", accentColor: C.indigo, flexShrink: 0 }}
            />
            <span style={{ fontFamily: "var(--sans)", fontSize: "0.875rem", color: C.ink, lineHeight: 1.6 }}>
              I have read and agree to the{" "}
              <Link href="/privacy" style={{ color: C.rose, textDecoration: "none" }}>
                Privacy Policy
              </Link>{" "}
              <span style={{ color: C.coral }}>*</span>
            </span>
          </label>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={formData.policyAck}
              onChange={(e) => update("policyAck", e.target.checked)}
              style={{ marginTop: "0.2rem", accentColor: C.indigo, flexShrink: 0 }}
            />
            <span style={{ fontFamily: "var(--sans)", fontSize: "0.875rem", color: C.ink, lineHeight: 1.6 }}>
              I have read and agree to the{" "}
              <Link href="/booking-policy" style={{ color: C.rose, textDecoration: "none" }}>
                Booking &amp; Cancellation Policy
              </Link>{" "}
              <span style={{ color: C.coral }}>*</span>
            </span>
          </label>
        </div>

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
          <Btn onClick={onNext} disabled={!canProceed}>
            Review your request →
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ── Step 4: Review & Submit ──────────────────────────────────────────────────

function Step4({
  selectedService,
  selectedDate,
  selectedTime,
  formData,
  bookingState,
  isSubmitting,
  onSubmit,
  onBack,
  goToStep,
}: {
  selectedService: string
  selectedDate: string
  selectedTime: string
  formData: BookingFormData
  bookingState: BookingState
  isSubmitting: boolean
  onSubmit: () => void
  onBack: () => void
  goToStep: (n: number) => void
}) {
  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "0.875rem 0",
    borderBottom: `1px solid ${C.ink}11`,
  }

  const labelCol: React.CSSProperties = {
    fontFamily: "var(--sans)",
    fontSize: "0.8rem",
    color: `${C.ink}66`,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    minWidth: 100,
    marginRight: "1rem",
    paddingTop: "0.1rem",
  }

  const valueCol: React.CSSProperties = {
    fontFamily: "var(--sans)",
    fontSize: "0.95rem",
    color: C.ink,
    flex: 1,
  }

  const editBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--sans)",
    fontSize: "0.82rem",
    color: C.rose,
    padding: 0,
    textDecoration: "underline",
    flexShrink: 0,
    marginLeft: "1rem",
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
        Review your request
      </h2>
      <p style={{ fontFamily: "var(--sans)", color: `${C.ink}BB`, marginBottom: "2rem" }}>
        Please check your details before submitting.
      </p>

      {bookingState === "failed" && (
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
            lineHeight: 1.6,
          }}
        >
          Something did not go through. Your message has not been sent yet. Your information is still here, so you can try again.
        </div>
      )}

      <div
        style={{
          backgroundColor: "#fff",
          border: `1px solid ${C.ink}18`,
          borderRadius: 10,
          padding: "0.25rem 1.5rem",
          marginBottom: "1.5rem",
          maxWidth: 560,
        }}
      >
        <div style={rowStyle}>
          <span style={labelCol}>Service</span>
          <span style={valueCol}>{selectedService}</span>
          <button style={editBtn} onClick={() => goToStep(1)}>Edit</button>
        </div>
        <div style={rowStyle}>
          <span style={labelCol}>Date &amp; Time</span>
          <span style={valueCol}>{formatDate(selectedDate)}{selectedTime ? ` at ${selectedTime}` : ""}</span>
          <button style={editBtn} onClick={() => goToStep(2)}>Edit</button>
        </div>
        <div style={rowStyle}>
          <span style={labelCol}>Name</span>
          <span style={valueCol}>{formData.name}</span>
          <button style={editBtn} onClick={() => goToStep(3)}>Edit</button>
        </div>
        <div style={rowStyle}>
          <span style={labelCol}>Email</span>
          <span style={valueCol}>{formData.email}</span>
          <button style={editBtn} onClick={() => goToStep(3)}>Edit</button>
        </div>
        {formData.phone && (
          <div style={rowStyle}>
            <span style={labelCol}>Phone</span>
            <span style={valueCol}>{formData.phone}</span>
            <button style={editBtn} onClick={() => goToStep(3)}>Edit</button>
          </div>
        )}
        {formData.format && (
          <div style={rowStyle}>
            <span style={labelCol}>Format</span>
            <span style={valueCol}>{formData.format}</span>
            <button style={editBtn} onClick={() => goToStep(3)}>Edit</button>
          </div>
        )}
        {formData.note && (
          <div style={rowStyle}>
            <span style={labelCol}>Note</span>
            <span style={{ ...valueCol, fontStyle: "italic", color: `${C.ink}BB` }}>{formData.note}</span>
            <button style={editBtn} onClick={() => goToStep(3)}>Edit</button>
          </div>
        )}
      </div>

      <div
        style={{
          padding: "1.25rem 1.5rem",
          backgroundColor: `${C.ochre}18`,
          border: `1px solid ${C.ochre}44`,
          borderRadius: 8,
          marginBottom: "2rem",
          maxWidth: 560,
        }}
      >
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.875rem",
            color: C.ink,
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          <strong>Please note:</strong> This is a request, not a confirmed booking. Daw Mi will be in touch to confirm your appointment.
        </p>
      </div>

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
        <Btn onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit Appointment Request"}
        </Btn>
      </div>
    </div>
  )
}

// ── Success State ────────────────────────────────────────────────────────────

function SuccessState() {
  return (
    <div
      style={{
        backgroundColor: C.canvas,
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
      }}
    >
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "0.4rem 1.25rem",
            backgroundColor: `${C.ochre}30`,
            color: C.ochre,
            borderRadius: 20,
            fontFamily: "var(--sans)",
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
        >
          Pending
        </div>

        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(2rem,4vw,2.8rem)",
            color: C.ink,
            marginBottom: "1.5rem",
            lineHeight: 1.2,
          }}
        >
          Appointment request received.
        </h1>

        <p
          style={{
            fontFamily: "var(--sans)",
            color: `${C.ink}BB`,
            lineHeight: 1.78,
            fontSize: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          Thank you for reaching out. Your request has been received and is not yet confirmed. Daw Mi will be in touch within [To confirm] business days to confirm your appointment.
        </p>

        <div
          style={{
            backgroundColor: C.paper,
            borderRadius: 10,
            padding: "1.75rem 2rem",
            textAlign: "left",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--sans)",
              fontWeight: 700,
              color: C.ink,
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            What happens next?
          </div>
          {[
            "Daw Mi reviews your request.",
            "You receive a confirmation email.",
            "Your appointment is confirmed.",
          ].map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                marginBottom: i < 2 ? "0.875rem" : 0,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: C.indigo,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontFamily: "var(--sans)",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontFamily: "var(--sans)", color: `${C.ink}CC`, lineHeight: 1.6, paddingTop: "0.15rem" }}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Btn href="/">Return to home</Btn>
          <Link
            href="/contact"
            style={{
              fontFamily: "var(--sans)",
              color: C.rose,
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            Have a question? →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BookAppointment() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [bookingState, setBookingState] = useState<BookingState>(null)
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    format: "",
    note: "",
    privacyAck: false,
    policyAck: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    // TODO: nothing is sent yet. This timeout fakes a booking and the request
    // is discarded, so Daw Mi never hears about it. Wire up a real backend.
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setBookingState("success")
    }, 1500)
  }

  if (bookingState === "success") return <SuccessState />

  return (
    <div style={{ backgroundColor: C.canvas, minHeight: "100dvh" }}>
      {/* Hero / Page header */}
      <div
        style={{
          borderBottom: `1px solid ${C.ink}0F`,
          padding: "3rem 2rem 2rem",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Link
            href="/services"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.82rem",
              color: `${C.ink}66`,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              marginBottom: "1.25rem",
            }}
          >
            ← Services
          </Link>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.75rem,3.5vw,2.5rem)",
              color: C.ink,
              margin: 0,
            }}
          >
            Book an appointment
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ maxWidth: 660, margin: "0 auto", paddingTop: "3rem", paddingBottom: "6rem" }}>
          <ProgressIndicator step={step} />

          {step === 1 && (
            <Step1
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              bookingState={bookingState}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2
              selectedService={selectedService}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              bookingState={bookingState}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3
              selectedService={selectedService}
              formData={formData}
              setFormData={setFormData}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <Step4
              selectedService={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              formData={formData}
              bookingState={bookingState}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onBack={() => setStep(3)}
              goToStep={(n) => setStep(n as 1 | 2 | 3 | 4)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
