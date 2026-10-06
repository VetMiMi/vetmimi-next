"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Dialog } from "@/components/admin/Dialog";
import { ErrorSummary } from "@/components/admin/ErrorSummary";
import { Input } from "@/components/admin/Input";
import { Notice } from "@/components/admin/Notice";
import { Textarea } from "@/components/admin/Textarea";
import { useToast } from "@/components/admin/Toast";
import type { components } from "@/lib/api/schema";
import { slugify } from "@/lib/slug";
import { deleteService, saveService, type ServiceFormState } from "./actions";
import { BookingFields, legendClass } from "./BookingFields";

type Service = components["schemas"]["Service"];

const LIST = "/admin/services";
const initial: ServiceFormState = { attempt: 0, fieldErrors: {} };
const order = [
  "name.en",
  "name.my",
  "description.en",
  "description.my",
  "bookingAction",
  "durationMinutes",
  "bufferBeforeMinutes",
  "bufferAfterMinutes",
  "feeText.en",
  "feeText.my",
  "preparationText.en",
  "preparationText.my",
  "slug",
  "sortOrder",
];
const TIMING = ["durationMinutes", "bufferBeforeMinutes", "bufferAfterMinutes"];

export function ServiceForm({ service }: { service?: Service }) {
  const [state, dispatch, pending] = useActionState(
    saveService.bind(null, service?.id),
    initial,
  );
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!service);
  const [impact, setImpact] = useState<FormData>();
  const router = useRouter();
  const toast = useToast();
  const noticeRef = useRef<HTMLDivElement>(null);
  const { attempt, saved, code, message, fieldErrors: errors } = state;

  useEffect(() => {
    if (saved) {
      toast(service ? "Service saved" : "Service added");
      router.push(LIST);
    } else if (message) noticeRef.current?.focus();
  }, [attempt, saved, message, service, toast, router]);

  const send = (form: FormData) => startTransition(() => dispatch(form));

  // A changed length or buffer moves future available times, so it is
  // confirmed first (Booking UX §25); other edits save straight away.
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const timingChanged =
      service &&
      TIMING.some(
        (key) =>
          String(form.get(key) ?? "") !==
          String(
            service[key as keyof Service] ??
              (key === "durationMinutes" ? "" : 0),
          ),
      );
    if (timingChanged) setImpact(form);
    else send(form);
  }

  const summary = order.flatMap((name) =>
    errors[name] ? [{ name, message: errors[name] }] : [],
  );
  const pair = (
    name: string,
    label: string,
    value?: components["schemas"]["LocalizedText"],
    help?: string,
  ) => (
    <div className="grid gap-[18px] md:grid-cols-2">
      <Input
        label={`${label} in English`}
        name={`${name}.en`}
        defaultValue={value?.en}
        help={help}
        error={errors[`${name}.en`]}
        required={name === "name"}
      />
      <Input
        label={`${label} in Burmese`}
        name={`${name}.my`}
        defaultValue={value?.my}
        help={help}
        error={errors[`${name}.my`]}
        lang="my"
      />
    </div>
  );

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-8">
      {service && (
        <input type="hidden" name="version" value={service.version} />
      )}
      {message && (
        <div key={attempt} className="flex flex-col items-start gap-3">
          <Notice tone="error" ref={noticeRef}>
            {message}
          </Notice>
          {code === "stale_version" && (
            <Button variant="secondary" onClick={() => router.refresh()}>
              Refresh
            </Button>
          )}
        </div>
      )}
      <ErrorSummary
        key={`summary-${attempt}`}
        title="Check the highlighted details."
        errors={summary}
      />

      <fieldset className="m-0 flex min-w-0 flex-col gap-[18px] border-0 p-0">
        <legend className={legendClass}>Name and description</legend>
        <div className="grid gap-[18px] md:grid-cols-2">
          <Input
            label="Name in English"
            name="name.en"
            required
            defaultValue={service?.name.en}
            error={errors["name.en"]}
            onChange={(event) => {
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
          />
          <Input
            label="Name in Burmese"
            name="name.my"
            lang="my"
            defaultValue={service?.name.my}
            error={errors["name.my"]}
          />
        </div>
        {pair(
          "description",
          "Short description",
          service?.description,
          "Shown when visitors choose a service.",
        )}
      </fieldset>

      <BookingFields service={service} errors={errors} />

      <fieldset className="m-0 flex min-w-0 flex-col gap-[18px] border-0 p-0">
        <legend className={legendClass}>Shown in confirmation emails</legend>
        {pair("feeText", "Fee", service?.feeText)}
        <Textarea
          label="Preparation in English"
          name="preparationText.en"
          defaultValue={service?.preparationText?.en}
          error={errors["preparationText.en"]}
        />
        <Textarea
          label="Preparation in Burmese"
          name="preparationText.my"
          lang="my"
          defaultValue={service?.preparationText?.my}
          error={errors["preparationText.my"]}
        />
      </fieldset>

      <fieldset className="m-0 flex min-w-0 flex-col gap-[18px] border-0 p-0">
        <legend className={legendClass}>Address and order</legend>
        <Input
          label="Address"
          name="slug"
          required
          help={`The end of the service's web address, e.g. /services/${slug || "individual-art-therapy"}.`}
          value={slug}
          spellCheck={false}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          error={errors.slug}
        />
        <Input
          label="Order in lists"
          name="sortOrder"
          type="number"
          inputMode="numeric"
          help="Lower numbers come first."
          defaultValue={service?.sortOrder ?? 0}
          error={errors.sortOrder}
        />
      </fieldset>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button type="submit" size="page" busy={pending}>
          {pending ? "Saving…" : service ? "Save changes" : "Add service"}
        </Button>
        <Button href={LIST} variant="quiet">
          Cancel
        </Button>
        {service && (
          <div className="md:ml-auto">
            <ConfirmButton
              label="Delete service"
              variant="quiet"
              title={`Delete ${service.name.en ?? service.slug}?`}
              body="Only a service with no appointments can be deleted. To stop bookings but keep its history, pause it instead."
              confirmLabel="Delete service"
              busyLabel="Deleting…"
              action={() => deleteService(service.id)}
              success="Service deleted"
              then={LIST}
            />
          </div>
        )}
      </div>

      <Dialog
        open={impact !== undefined}
        onClose={() => setImpact(undefined)}
        title="Change the length or buffers?"
        cancelLabel="Keep current"
        confirmLabel="Save changes"
        onConfirm={() => {
          if (impact) send(impact);
          setImpact(undefined);
        }}
      >
        <p>
          Future available times change immediately. Existing appointments keep
          their times.
        </p>
      </Dialog>
    </form>
  );
}
