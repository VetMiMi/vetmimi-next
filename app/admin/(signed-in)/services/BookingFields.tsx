import { Checkbox } from "@/components/admin/Checkbox";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import type { components } from "@/lib/api/schema";
import { bookingActions } from "./serviceText";

export const legendClass =
  "mb-4 font-body text-[0.75rem] font-semibold tracking-[0.1em] text-muted uppercase";

// The scheduling facts of a service, with the API's ranges as help text
// (data-model.md "services").
export function BookingFields({
  service,
  errors,
}: {
  service?: components["schemas"]["Service"];
  errors: Record<string, string>;
}) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-[18px] border-0 p-0">
      <legend className={legendClass}>Booking</legend>
      <Select
        label="How visitors book"
        name="bookingAction"
        required
        defaultValue={service?.bookingAction ?? "request"}
        error={errors.bookingAction}
        options={Object.entries(bookingActions).map(([value, label]) => ({
          value,
          label,
        }))}
      />
      <Input
        label="Length in minutes"
        name="durationMinutes"
        type="number"
        inputMode="numeric"
        min={5}
        max={480}
        help="5 to 480. Needed when visitors book or request it."
        defaultValue={service?.durationMinutes}
        error={errors.durationMinutes}
      />
      <div className="grid gap-[18px] md:grid-cols-2">
        <Input
          label="Buffer before, minutes"
          name="bufferBeforeMinutes"
          type="number"
          inputMode="numeric"
          min={0}
          max={240}
          help="0 to 240"
          defaultValue={service?.bufferBeforeMinutes ?? 0}
          error={errors.bufferBeforeMinutes}
        />
        <Input
          label="Buffer after, minutes"
          name="bufferAfterMinutes"
          type="number"
          inputMode="numeric"
          min={0}
          max={240}
          help="0 to 240"
          defaultValue={service?.bufferAfterMinutes ?? 0}
          error={errors.bufferAfterMinutes}
        />
      </div>
      <div>
        <p className="mb-1 text-[0.88rem] font-medium">Formats</p>
        <Checkbox
          label="Online"
          name="formats"
          value="online"
          defaultChecked={service ? service.formats.includes("online") : true}
        />
        <Checkbox
          label="In person"
          name="formats"
          value="in_person"
          help="[To confirm] — not offered at launch."
          defaultChecked={service?.formats.includes("in_person")}
        />
      </div>
    </fieldset>
  );
}
