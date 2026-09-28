import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { inputStyle } from "./booking";
import type { BookingFormData, ServiceId } from "./booking";

// ── Step 3: Your Details ─────────────────────────────────────────────────────

export function Step3({
  selectedService,
  formData,
  setFormData,
  onNext,
  onBack,
}: {
  selectedService: ServiceId | "";
  formData: BookingFormData;
  setFormData: (f: BookingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("book");
  const isIndividual = selectedService === "individual";

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
        {t("step3.title")}
      </h2>
      <p
        style={{
          fontFamily: "var(--sans)",
          color: `${C.ink}BB`,
          marginBottom: "2rem",
        }}
      >
        {t("step3.intro")}
      </p>

      <div style={{ maxWidth: 520 }}>
        <label>
          <span style={labelStyle}>
            {t("step3.name.label")} <span style={{ color: C.coral }}>*</span>
          </span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t("step3.name.placeholder")}
            style={inputStyle}
          />
        </label>

        <label>
          <span style={labelStyle}>
            {t("step3.email.label")} <span style={{ color: C.coral }}>*</span>
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
            {t("step3.phone.label")}{" "}
            <span style={{ color: `${C.ink}66`, fontWeight: 400 }}>
              {t("shared.optional")}
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
          <div>
            <span style={labelStyle}>{t("step3.format.label")}</span>
            <p style={{ margin: 0 }}>{t("step3.format.onlineOnly")}</p>
          </div>
        )}

        <label>
          <span style={labelStyle}>
            {t("step3.note.label")}{" "}
            <span style={{ color: `${C.ink}66`, fontWeight: 400 }}>
              {t("shared.optional")}
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
            {t("step3.note.help")}
          </p>
          <textarea
            value={formData.note}
            onChange={(e) => update("note", e.target.value)}
            rows={4}
            placeholder={t("step3.note.placeholder")}
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
              {t.rich("step3.privacyAck", {
                link: (chunks) => (
                  <Link
                    href="/privacy"
                    style={{ color: C.rose, textDecoration: "none" }}
                  >
                    {chunks}
                  </Link>
                ),
              })}{" "}
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
              {t.rich("step3.policyAck", {
                link: (chunks) => (
                  <Link
                    href="/booking-policy"
                    style={{ color: C.rose, textDecoration: "none" }}
                  >
                    {chunks}
                  </Link>
                ),
              })}{" "}
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
            {t("shared.back")}
          </button>
          <Btn onClick={onNext} disabled={!canProceed}>
            {t("step3.continue")}
          </Btn>
        </div>
      </div>
    </div>
  );
}
