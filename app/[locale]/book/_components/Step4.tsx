import { C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { formatDate } from "./booking";
import type { BookingState, BookingFormData } from "./booking";

// ── Step 4: Review & Submit ──────────────────────────────────────────────────

export function Step4({
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
  selectedService: string;
  selectedDate: string;
  selectedTime: string;
  formData: BookingFormData;
  bookingState: BookingState;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  goToStep: (n: number) => void;
}) {
  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "0.875rem 0",
    borderBottom: `1px solid ${C.ink}11`,
  };

  const labelCol: React.CSSProperties = {
    fontFamily: "var(--sans)",
    fontSize: "0.8rem",
    color: `${C.ink}66`,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    minWidth: 100,
    marginRight: "1rem",
    paddingTop: "0.1rem",
  };

  const valueCol: React.CSSProperties = {
    fontFamily: "var(--sans)",
    fontSize: "0.95rem",
    color: C.ink,
    flex: 1,
  };

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
  };

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
      <p
        style={{
          fontFamily: "var(--sans)",
          color: `${C.ink}BB`,
          marginBottom: "2rem",
        }}
      >
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
          Something did not go through. Your message has not been sent yet. Your
          information is still here, so you can try again.
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
          <button style={editBtn} onClick={() => goToStep(1)}>
            Edit
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelCol}>Date &amp; Time</span>
          <span style={valueCol}>
            {formatDate(selectedDate)}
            {selectedTime ? ` at ${selectedTime}` : ""}
          </span>
          <button style={editBtn} onClick={() => goToStep(2)}>
            Edit
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelCol}>Name</span>
          <span style={valueCol}>{formData.name}</span>
          <button style={editBtn} onClick={() => goToStep(3)}>
            Edit
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelCol}>Email</span>
          <span style={valueCol}>{formData.email}</span>
          <button style={editBtn} onClick={() => goToStep(3)}>
            Edit
          </button>
        </div>
        {formData.phone && (
          <div style={rowStyle}>
            <span style={labelCol}>Phone</span>
            <span style={valueCol}>{formData.phone}</span>
            <button style={editBtn} onClick={() => goToStep(3)}>
              Edit
            </button>
          </div>
        )}
        {formData.format && (
          <div style={rowStyle}>
            <span style={labelCol}>Format</span>
            <span style={valueCol}>{formData.format}</span>
            <button style={editBtn} onClick={() => goToStep(3)}>
              Edit
            </button>
          </div>
        )}
        {formData.note && (
          <div style={rowStyle}>
            <span style={labelCol}>Note</span>
            <span
              style={{ ...valueCol, fontStyle: "italic", color: `${C.ink}BB` }}
            >
              {formData.note}
            </span>
            <button style={editBtn} onClick={() => goToStep(3)}>
              Edit
            </button>
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
          <strong>Please note:</strong> This is a request, not a confirmed
          booking. Daw Mi will be in touch to confirm your appointment.
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
  );
}
