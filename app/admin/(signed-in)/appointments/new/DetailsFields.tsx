import { Checkbox } from "@/components/admin/Checkbox";
import { Input } from "@/components/admin/Input";
import { RadioCards } from "@/components/admin/RadioCards";
import { Textarea } from "@/components/admin/Textarea";
import type { ManualFields } from "@/lib/admin/manualAppointment";

// The visitor and the appointment's settings, under the time (#78).
export function DetailsFields({
  fields,
  errors,
  update,
  blur,
}: {
  fields: ManualFields;
  errors: Record<string, string>;
  update: <K extends keyof ManualFields>(
    name: K,
    value: ManualFields[K],
  ) => void;
  blur: (name: keyof ManualFields) => () => void;
}) {
  return (
    <>
      <Input
        label="Visitor's name"
        name="name"
        required
        maxLength={120}
        autoComplete="off"
        value={fields.name}
        onChange={(event) => update("name", event.target.value)}
        onBlur={blur("name")}
        error={errors.name}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        required
        maxLength={254}
        autoComplete="off"
        value={fields.email}
        onChange={(event) => update("email", event.target.value)}
        onBlur={blur("email")}
        error={errors.email}
      />
      <Input
        label="Phone"
        name="phone"
        type="tel"
        maxLength={32}
        autoComplete="off"
        value={fields.phone}
        onChange={(event) => update("phone", event.target.value)}
        onBlur={blur("phone")}
        error={errors.phone}
      />
      <Textarea
        label="Visitor's practical note"
        name="note"
        help="Practical details only. No health information."
        maxLength={500}
        rows={3}
        value={fields.note}
        onChange={(event) => update("note", event.target.value)}
        onBlur={blur("note")}
        error={errors.note}
      />
      <RadioCards
        label="Email language"
        name="locale"
        value={fields.locale}
        onChange={(value) => update("locale", value)}
        options={[
          { value: "en", label: "English" },
          { value: "my", label: "Burmese" },
        ]}
      />
      <RadioCards
        label="Status"
        name="status"
        value={fields.status}
        onChange={(value) => update("status", value)}
        options={[
          { value: "confirmed", label: "Confirmed" },
          { value: "pending", label: "Pending — I still need to confirm" },
        ]}
      />
      <Checkbox
        label="Email the visitor"
        name="notifyVisitor"
        checked={fields.notifyVisitor}
        onChange={(event) => update("notifyVisitor", event.target.checked)}
        help={
          fields.status === "pending"
            ? "They will receive a 'request received' email."
            : "They will receive the confirmation and, later, the reminder."
        }
      />
      <Textarea
        label="Private note"
        name="adminNote"
        help="Private — never sent to the visitor."
        maxLength={2000}
        rows={3}
        value={fields.adminNote}
        onChange={(event) => update("adminNote", event.target.value)}
        onBlur={blur("adminNote")}
        error={errors.adminNote}
      />
    </>
  );
}
