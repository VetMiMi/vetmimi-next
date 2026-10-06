"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CaretDown, Funnel } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Checkbox } from "@/components/admin/Checkbox";
import { controlClass, labelClass } from "@/components/admin/Field";
import {
  filterCount,
  formatNames,
  hasFilters,
  listHref,
  statusOptions,
  type ListFilters,
} from "@/lib/admin/appointments";

const DEBOUNCE_MS = 300;

// Every filter lives in the URL (#65), so Back, Forward and a shared link
// all show the same list. Filtering never asks for confirmation (Booking UX
// §30). The filters fold away behind a button so what needs attention stays
// near the top; search is always there. Labels carry no "(optional)": none
// of this is a form to fill in.
export function Filters({
  filters,
  services,
}: {
  filters: ListFilters;
  services: { value: string; label: string }[];
}) {
  const router = useRouter();
  const count = filterCount(filters);
  const [open, setOpen] = useState(count > 0);
  const [q, setQ] = useState(filters.q ?? "");
  // Counts "Clear filters" clicks, to empty the date inputs.
  const [cleared, setCleared] = useState(0);
  const go = (patch: Partial<ListFilters>) =>
    router.push(listHref({ ...filters, ...patch }), { scroll: false });

  // Typing replaces the history entry rather than adding one per letter.
  useEffect(() => {
    const text = q.trim();
    if (text === (filters.q ?? "")) return;
    const timer = setTimeout(
      () =>
        router.replace(listHref({ ...filters, q: text || undefined }), {
          scroll: false,
        }),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [q, filters, router]);

  const toggleStatus = (value: ListFilters["status"][number]) =>
    go({
      status: filters.status.includes(value)
        ? filters.status.filter((s) => s !== value)
        : [...filters.status, value],
    });

  return (
    <div className="mb-10 flex flex-col gap-4">
      <div>
        <label htmlFor="field-q" className={labelClass}>
          Search by name, email or reference
        </label>
        <div className="flex gap-3">
          <input
            id="field-q"
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            autoComplete="off"
            enterKeyHint="search"
            className={`${controlClass} min-w-0`}
          />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="appointment-filters"
            onClick={() => setOpen(!open)}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-control border border-input-border bg-white px-4 text-[0.9rem] font-semibold text-indigo transition-colors duration-150 hover:bg-indigo/12 motion-reduce:transition-none"
          >
            <Funnel aria-hidden="true" size={18} />
            Filters
            {count > 0 && (
              <span className="rounded-pill bg-indigo px-2 py-0.5 text-[0.75rem] text-white">
                {count}
                <span className="sr-only"> set</span>
              </span>
            )}
            <CaretDown
              aria-hidden="true"
              size={16}
              className={open ? "rotate-180" : ""}
            />
          </button>
        </div>
      </div>

      <div
        id="appointment-filters"
        hidden={!open}
        className="rounded-card border border-card-border bg-raised p-5"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Choice
            label="Service"
            name="serviceId"
            value={filters.serviceId ?? ""}
            onChange={(value) => go({ serviceId: value || undefined })}
            options={[{ value: "", label: "All services" }, ...services]}
          />
          <Choice
            label="Format"
            name="format"
            value={filters.format ?? ""}
            onChange={(value) =>
              go({ format: (value || undefined) as ListFilters["format"] })
            }
            options={[
              { value: "", label: "All formats" },
              ...Object.entries(formatNames).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <DateChoice
            key={`from-${cleared}`}
            label="From"
            name="from"
            value={filters.from}
            onChange={(value) => go({ from: value || undefined })}
          />
          <DateChoice
            key={`to-${cleared}`}
            label="To (included)"
            name="to"
            value={filters.to}
            min={filters.from}
            onChange={(value) => go({ to: value || undefined })}
          />
        </div>
        <fieldset className="m-0 mt-5 min-w-0 border-0 p-0">
          <legend className={labelClass}>Status</legend>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {statusOptions.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                name={`status-${option.value}`}
                checked={filters.status.includes(option.value)}
                onChange={() => toggleStatus(option.value)}
              />
            ))}
          </div>
        </fieldset>
      </div>

      {hasFilters(filters) && (
        <div>
          <Button
            variant="quiet"
            onClick={() => {
              setQ("");
              setCleared((n) => n + 1);
              router.push(listHref({ view: filters.view, status: [] }), {
                scroll: false,
              });
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

function Choice({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={`field-${name}`} className={labelClass}>
        {label}
      </label>
      <select
        id={`field-${name}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Uncontrolled, so a half-typed date does not jump the list and focus
// stays put; the parent's key empties it after "Clear filters".
function DateChoice({
  label,
  name,
  value,
  min,
  onChange,
}: {
  label: string;
  name: string;
  value?: string;
  min?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={`field-${name}`} className={labelClass}>
        {label}
      </label>
      <input
        id={`field-${name}`}
        type="date"
        defaultValue={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
      />
    </div>
  );
}
