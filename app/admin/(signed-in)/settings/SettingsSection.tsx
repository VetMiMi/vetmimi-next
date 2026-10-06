"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Checkbox } from "@/components/admin/Checkbox";
import { Dialog } from "@/components/admin/Dialog";
import { Input } from "@/components/admin/Input";
import { Notice } from "@/components/admin/Notice";
import { RadioCards } from "@/components/admin/RadioCards";
import { Select } from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toast";
import { updateSettings } from "./actions";
import {
  impactOf,
  numberHelp,
  sections,
  type Field,
  type Impact,
  type SectionId,
  type Settings,
  type SettingsPatch,
} from "./fields";

type Errors = Record<string, string>;

// Reads one field from the form, or names what is wrong with it.
function read(field: Field, form: FormData, errors: Errors): unknown {
  const value = String(form.get(field.key) ?? "").trim();
  switch (field.kind) {
    case "number": {
      const n = Number(value);
      if (
        value === "" ||
        !Number.isInteger(n) ||
        n < field.min ||
        n > field.max
      )
        errors[field.key] =
          `Enter a whole number from ${field.min} to ${field.max}.`;
      return n;
    }
    case "toggle":
      return form.get(field.key) === "on";
    case "methods": {
      const chosen = form.getAll(field.key).map(String);
      if (chosen.length === 0) errors[field.key] = "Choose at least one.";
      return chosen;
    }
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        errors[field.key] = "Enter an email address like name@example.com.";
      return value;
    case "localized": {
      const en = String(form.get(`${field.key}.en`) ?? "").trim();
      const my = String(form.get(`${field.key}.my`) ?? "").trim();
      if (!en) errors[`${field.key}.en`] = "Enter the English wording.";
      return { en, ...(my && { my }) };
    }
    default:
      return value;
  }
}

// One card, one Save, one PATCH with only this section's keys (#76).
export function SettingsSection({
  id,
  values,
  timezones = [],
}: {
  id: SectionId;
  values: Settings;
  timezones?: string[];
}) {
  const { title, note, fields } = sections[id];
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string>();
  const [pendingPatch, setPendingPatch] = useState<{
    patch: SettingsPatch;
    impact: Impact;
  }>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function send(patch: SettingsPatch) {
    setPendingPatch(undefined);
    startTransition(async () => {
      const outcome = await updateSettings(patch);
      if (outcome.ok) {
        setFailure(undefined);
        toast("Settings saved");
      } else {
        setFailure(outcome.message);
        setErrors(outcome.fieldErrors);
      }
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const found: Errors = {};
    const patch = Object.fromEntries(
      fields.map((field) => [field.key, read(field, form, found)]),
    ) as SettingsPatch;
    setErrors(found);
    setFailure(undefined);
    if (Object.keys(found).length > 0) return;
    const impact = fields
      .map((field) =>
        impactOf(
          field.key,
          patch[field.key],
          values[field.key as keyof Settings],
        ),
      )
      .find(Boolean);
    if (impact) setPendingPatch({ patch, impact });
    else send(patch);
  }

  function control(field: Field) {
    const current = values[field.key as keyof Settings];
    const common = {
      label: field.label,
      name: field.key,
      error: errors[field.key],
    };
    switch (field.kind) {
      case "number":
        return (
          <Input
            {...common}
            type="number"
            inputMode="numeric"
            min={field.min}
            max={field.max}
            required
            help={numberHelp(field)}
            defaultValue={String(current)}
          />
        );
      case "choice":
        return (
          <RadioCards
            {...common}
            help={field.help}
            options={field.options}
            defaultValue={String(current)}
          />
        );
      case "select":
        return (
          <Select
            {...common}
            help={field.help}
            options={field.options}
            defaultValue={String(current)}
          />
        );
      case "timezone":
        return (
          <Select
            {...common}
            help={field.help}
            options={timezones.map((zone) => ({
              value: zone,
              label: zone.replaceAll("_", " "),
            }))}
            defaultValue={String(current)}
          />
        );
      case "toggle":
        return (
          <Checkbox
            label={field.label}
            name={field.key}
            defaultChecked={current === true}
          />
        );
      case "email":
        return (
          <Input
            {...common}
            type="email"
            required
            help={field.help}
            defaultValue={String(current)}
          />
        );
      case "methods":
        return (
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-1 text-[0.88rem] font-medium">
              {field.label}
            </legend>
            {field.options.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                name={field.key}
                value={option.value}
                defaultChecked={(current as string[]).includes(option.value)}
                error={
                  option === field.options.at(-1)
                    ? errors[field.key]
                    : undefined
                }
              />
            ))}
          </fieldset>
        );
      case "localized": {
        const text = current as Settings["responseTime"];
        return (
          <div className="grid gap-[18px] md:grid-cols-2">
            <Input
              label={`${field.label} in English`}
              name={`${field.key}.en`}
              required
              help={field.help}
              defaultValue={text.en}
              error={errors[`${field.key}.en`]}
            />
            <Input
              label={`${field.label} in Burmese`}
              name={`${field.key}.my`}
              lang="my"
              help="Shown on the Burmese pages."
              defaultValue={text.my}
              error={errors[`${field.key}.my`]}
            />
          </div>
        );
      }
    }
  }

  return (
    <Card as="section" className="max-w-[660px]">
      <h2 className="mb-2 text-[1.35rem]">{title}</h2>
      {note && <p className="mb-2 text-[0.92rem] text-muted">{note}</p>}
      <form
        noValidate
        onSubmit={submit}
        className="mt-6 flex flex-col gap-[22px]"
      >
        {failure && <Notice tone="error">{failure}</Notice>}
        {fields.map((field) => (
          <div key={field.key}>{control(field)}</div>
        ))}
        <div>
          <Button type="submit" variant="secondary" busy={pending}>
            {pending ? "Saving…" : `Save ${title.toLowerCase()}`}
          </Button>
        </div>
      </form>
      {pendingPatch && (
        <Dialog
          open
          onClose={() => setPendingPatch(undefined)}
          title={pendingPatch.impact.title}
          cancelLabel={pendingPatch.impact.cancel}
          confirmLabel={pendingPatch.impact.confirm}
          onConfirm={() => send(pendingPatch.patch)}
        >
          <p>{pendingPatch.impact.body}</p>
        </Dialog>
      )}
    </Card>
  );
}
