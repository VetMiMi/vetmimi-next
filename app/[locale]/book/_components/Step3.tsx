import Link from "next/link";
import { C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { inputStyle } from "./booking";
import type { BookingFormData } from "./booking";

// ── Step 3: Your Details ─────────────────────────────────────────────────────

export function Step3({
  selectedService,
  formData,
  setFormData,
  onNext,
  onBack,
}: {
  selectedService: string;
  formData: BookingFormData;
  setFormData: (f: BookingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isIndividual = selectedService === "Individual Art Therapy";

  const update = (key: keyof BookingFormData, value: string | boolean) => {
    setFormData({ ...formData, [key]: value });
  };

  const canProceed =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.privacyAck &&
    formData.policyAck;

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--sans)",
    fontSize: "0.85rem",
    color: C.ink,
    fontWeight: 600,
    marginBottom: "0.3rem",
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
        Your details
      </h2>
      <p
        style={{
          fontFamily: "var(--sans)",
          color: `${C.ink}BB`,
          marginBottom: "2rem",
        }}
      >
        Please provide your contact information.
      </p>

      <div style={{ maxWidth: 520 }}>
        <label>
          <span style={labelStyle}>
            Full name <span style={{ color: C.coral }}>*</span>
          </span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </label>

        <label>
          <span style={labelStyle}>
            Email address <span style={{ color: C.coral }}>*</span>
          </span>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </label>

        <label>
          <span style={labelStyle}>
            Phone number{" "}
            <span style={{ color: `${C.ink}66`, fontWeight: 400 }}>
              (optional)
            </span>
          </span>
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
            Short note{" "}
            <span style={{ color: `${C.ink}66`, fontWeight: 400 }}>
              (optional)
            </span>
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
            You are welcome to share anything that would help Daw Mi prepare.
            Please do not include private medical or detailed health information
            here.
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
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={formData.privacyAck}
              onChange={(e) => update("privacyAck", e.target.checked)}
              style={{
                marginTop: "0.2rem",
                accentColor: C.indigo,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.875rem",
                color: C.ink,
                lineHeight: 1.6,
              }}
            >
              I have read and agree to the{" "}
              <Link
                href="/privacy"
                style={{ color: C.rose, textDecoration: "none" }}
              >
                Privacy Policy
              </Link>{" "}
              <span style={{ color: C.coral }}>*</span>
            </span>
          </label>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={formData.policyAck}
              onChange={(e) => update("policyAck", e.target.checked)}
              style={{
                marginTop: "0.2rem",
                accentColor: C.indigo,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.875rem",
                color: C.ink,
                lineHeight: 1.6,
              }}
            >
              I have read and agree to the{" "}
              <Link
                href="/booking-policy"
                style={{ color: C.rose, textDecoration: "none" }}
              >
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
  );
}
