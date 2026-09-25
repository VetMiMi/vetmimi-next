"use client";
import { useState } from "react"
import Link from "next/link";
import { C } from "@/lib/tokens"
import { ProgressIndicator } from "./_components/ProgressIndicator"
import { Step1 } from "./_components/Step1"
import { Step2 } from "./_components/Step2"
import { Step3 } from "./_components/Step3"
import { Step4 } from "./_components/Step4"
import { SuccessState } from "./_components/SuccessState"
import type { BookingState, BookingFormData } from "./_components/booking"

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
