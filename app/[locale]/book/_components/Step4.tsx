import { useTranslations } from "next-intl";
import { C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { useFormatDate } from "./booking";
import type {
  BookingState,
  BookingFormData,
  ServiceId,
  TimeSlot,
} from "./booking";

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
  selectedService: ServiceId | "";
  selectedDate: string;
  selectedTime: TimeSlot | "";
  formData: BookingFormData;
  bookingState: BookingState;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  goToStep: (n: number) => void;
}) {
  const t = useTranslations("book");
  const formatDate = useFormatDate();

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
        {t("step4.title")}
      </h2>
      <p
        style={{
          fontFamily: "var(--sans)",
          color: `${C.ink}BB`,
          marginBottom: "2rem",
        }}
      >
        {t("step4.intro")}
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
          {t("shared.failed")}
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
          <span style={labelCol}>{t("step4.rows.service")}</span>
          <span style={valueCol}>
            {selectedService && t(`services.${selectedService}.title`)}
          </span>
          <button style={editBtn} onClick={() => goToStep(1)}>
            {t("step4.edit")}
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelCol}>{t("step4.rows.dateTime")}</span>
          <span style={valueCol}>
            {selectedTime
              ? t("calendar.dateAtTime", {
                  date: formatDate(selectedDate),
                  time: t(`calendar.times.${selectedTime}`),
                })
              : formatDate(selectedDate)}
          </span>
          <button style={editBtn} onClick={() => goToStep(2)}>
            {t("step4.edit")}
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelCol}>{t("step4.rows.name")}</span>
          <span style={valueCol}>{formData.name}</span>
          <button style={editBtn} onClick={() => goToStep(3)}>
            {t("step4.edit")}
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelCol}>{t("step4.rows.email")}</span>
          <span style={valueCol}>{formData.email}</span>
          <button style={editBtn} onClick={() => goToStep(3)}>
            {t("step4.edit")}
          </button>
        </div>
        {formData.phone && (
          <div style={rowStyle}>
            <span style={labelCol}>{t("step4.rows.phone")}</span>
            <span style={valueCol}>{formData.phone}</span>
            <button style={editBtn} onClick={() => goToStep(3)}>
              {t("step4.edit")}
            </button>
          </div>
        )}
        {formData.format && (
          <div style={rowStyle}>
            <span style={labelCol}>{t("step4.rows.format")}</span>
            <span style={valueCol}>
              {t(`step4.formatValues.${formData.format}`)}
            </span>
            <button style={editBtn} onClick={() => goToStep(3)}>
              {t("step4.edit")}
            </button>
          </div>
        )}
        {formData.note && (
          <div style={rowStyle}>
            <span style={labelCol}>{t("step4.rows.note")}</span>
            <span
              style={{ ...valueCol, fontStyle: "italic", color: `${C.ink}BB` }}
            >
              {formData.note}
            </span>
            <button style={editBtn} onClick={() => goToStep(3)}>
              {t("step4.edit")}
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
          {t.rich("step4.notice", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
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
          {t("shared.back")}
        </button>
        <Btn onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? t("step4.submitting") : t("step4.submit")}
        </Btn>
      </div>
    </div>
  );
}
