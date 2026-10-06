"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { Button } from "@/components/admin/Button";
import { ErrorSummary } from "@/components/admin/ErrorSummary";
import { Notice } from "@/components/admin/Notice";
import { RadioCards } from "@/components/admin/RadioCards";
import { Select } from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toast";
import { formatNames, whenLong } from "@/lib/admin/appointments";
import {
  checkAll,
  checkField,
  checkedFields,
  emptyFields,
  keyAfterEdit,
  keyAfterFailure,
  manualPayload,
  type KeyState,
  type ManualFields,
} from "@/lib/admin/manualAppointment";
import type { components } from "@/lib/api/schema";
import { zoneAbbreviation } from "@/lib/zonedTime";
import { createManual } from "../actions";
import { SlotChooser } from "../_components/SlotChooser";
import { DetailsFields } from "./DetailsFields";
import { ManualReviewDialog } from "./ManualReviewDialog";

type Slot = components["schemas"]["Slot"];
type Service = {
  id: string;
  name: string;
  formats: components["schemas"]["Format"][];
  durationMinutes?: number;
  paused: boolean;
};
type Failure = { message: string; retry: boolean; alternatives: Slot[] };

// The API's field pointers ("/visitor/name") → this form's names.
const apiFields: Record<string, keyof ManualFields | "slot"> = {
  "visitor.name": "name",
  "visitor.email": "email",
  "visitor.phone": "phone",
  "visitor.note": "note",
  startsAt: "slot",
};

const newKey = () => crypto.randomUUID();

export function ManualAppointmentForm({
  services,
  timezone,
  today,
}: {
  services: Service[];
  timezone: string;
  today: string;
}) {
  const [fields, setFields] = useState<ManualFields>(emptyFields);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [failure, setFailure] = useState<Failure>();
  const [key, setKey] = useState<KeyState>(() => ({
    key: newKey(),
    answered: false,
  }));
  const [pending, startTransition] = useTransition();
  const sending = useRef(false);
  const failureRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const router = useRouter();
  const service = services.find((s) => s.id === fields.serviceId);

  useEffect(() => {
    if (failure) failureRef.current?.focus();
  }, [failure]);

  // Any edit after the API has answered takes a fresh key (#78).
  function edited() {
    setKey((k) => keyAfterEdit(k, newKey));
  }

  function update<K extends keyof ManualFields>(
    name: K,
    value: ManualFields[K],
  ) {
    const next = { ...fields, [name]: value };
    if (name === "serviceId") {
      const formats = services.find((s) => s.id === value)?.formats ?? [];
      next.format = formats.length === 1 ? formats[0] : "";
      setSlot(null);
    }
    setFields(next);
    edited();
    if (errors[name]) recheck(name, next, slot);
  }

  function choose(next: Slot) {
    setSlot(next);
    edited();
    if (errors.slot) recheck("slot", fields, next);
  }

  function recheck(
    name: keyof ManualFields | "slot",
    values = fields,
    chosen = slot,
  ) {
    const message = checkField(name, values, chosen);
    setErrors((all) => {
      const next = { ...all };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }

  function review() {
    const found = checkAll(fields, slot);
    setErrors(found);
    setAttempt((n) => n + 1);
    if (Object.keys(found).length === 0) setReviewing(true);
  }

  function add() {
    if (!slot || sending.current) return;
    sending.current = true;
    startTransition(async () => {
      const outcome = await createManual(manualPayload(fields, slot), key.key);
      sending.current = false;
      setReviewing(false);
      if (outcome.ok) {
        toast("Appointment added");
        router.push(`/admin/appointments/${outcome.data.id}`);
        return;
      }
      setKey((k) => keyAfterFailure(k, outcome.status));
      const mapped = Object.fromEntries(
        Object.entries(outcome.fieldErrors).map(([f, m]) => [
          apiFields[f] ?? f,
          m,
        ]),
      );
      if (outcome.code === "slot_unavailable") setSlot(null);
      setErrors(mapped);
      setFailure({
        message: outcome.message,
        retry: outcome.status >= 500,
        alternatives: outcome.alternatives,
      });
    });
  }

  const blur = (name: keyof ManualFields) => () => recheck(name);
  const summary = checkedFields
    .filter((name) => errors[name])
    .map((name) => ({ name, message: errors[name] }));

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        review();
      }}
      className="flex flex-col gap-[22px]"
    >
      {failure && (
        <div ref={failureRef} tabIndex={-1} className="flex flex-col gap-3">
          <Notice tone="error">{failure.message}</Notice>
          {failure.retry && (
            <Button
              variant="secondary"
              className="self-start"
              busy={pending}
              onClick={add}
            >
              {pending ? "Adding…" : "Retry"}
            </Button>
          )}
          {failure.alternatives.length > 0 && (
            <div>
              <p className="mb-3 text-[0.9rem] font-semibold">
                Free times nearby
              </p>
              <SlotPicker
                slots={failure.alternatives}
                selected={slot?.startsAt}
                label="Free times nearby"
                time={(s) => whenLong(s, timezone)}
                name={(s) =>
                  `${whenLong(s, timezone)} ${zoneAbbreviation(s, timezone)}`
                }
                onSelect={choose}
              />
            </div>
          )}
        </div>
      )}
      <ErrorSummary
        key={`summary-${attempt}`}
        title="Check the highlighted details."
        errors={summary}
      />

      <Select
        label="Service"
        name="serviceId"
        required
        value={fields.serviceId}
        onChange={(event) => update("serviceId", event.target.value)}
        onBlur={blur("serviceId")}
        error={errors.serviceId}
        options={[
          { value: "", label: "Choose a service" },
          ...services.map((s) => ({
            value: s.id,
            label: s.paused
              ? `${s.name} (paused — resume it in Services first)`
              : s.name,
            disabled: s.paused,
          })),
        ]}
      />
      {service && (
        <>
          <RadioCards
            label="Format"
            name="format"
            value={fields.format}
            onChange={(value) => update("format", value)}
            error={errors.format}
            options={service.formats.map((f) => ({
              value: f,
              label: formatNames[f],
            }))}
          />
          <SlotChooser
            key={service.id}
            serviceId={service.id}
            timezone={timezone}
            today={today}
            selected={slot}
            onSelect={choose}
            error={errors.slot}
          />
          {slot && (
            <p className="-mt-2 rounded-control bg-paper px-5 py-4 text-[0.95rem]">
              Chosen:{" "}
              <strong>
                {whenLong(slot.startsAt, timezone)}{" "}
                {zoneAbbreviation(slot.startsAt, timezone)}
              </strong>
            </p>
          )}
        </>
      )}

      <DetailsFields
        fields={fields}
        errors={errors}
        update={update}
        blur={blur}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button type="submit" size="page">
          Review appointment
        </Button>
        <Button href="/admin/appointments" variant="quiet">
          Cancel
        </Button>
      </div>

      <ManualReviewDialog
        open={reviewing}
        busy={pending}
        fields={fields}
        slot={slot}
        serviceName={service?.name ?? ""}
        duration={service?.durationMinutes}
        timezone={timezone}
        onClose={() => setReviewing(false)}
        onConfirm={add}
      />
    </form>
  );
}
