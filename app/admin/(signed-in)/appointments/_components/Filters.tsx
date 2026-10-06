"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Checkbox } from "@/components/admin/Checkbox";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { labelClass } from "@/components/admin/Field";
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
// §30). Below 768px the filters fold away behind a button; search stays.
export function Filters({
  filters,
  services,
}: {
  filters: ListFilters;
  services: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(filters.q ?? "");
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

  const count = filterCount(filters);
  const toggleStatus = (value: ListFilters["status"][number]) =>
    go({
      status: filters.status.includes(value)
        ? filters.status.filter((s) => s !== value)
        : [...filters.status, value],
    });

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="grow">
          <Input
            label="Search"
            name="q"
            type="search"
            help="Visitor name, email or reference, like VM-7K3Q9M."
            value={q}
            onChange={(event) => setQ(event.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="appointment-filters"
          onClick={() => setOpen(!open)}
          className="inline-flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-control border border-input-border bg-white px-4 text-[0.9rem] font-semibold text-indigo transition-colors duration-150 hover:bg-indigo/12 motion-reduce:transition-none md:hidden"
        >
          <span>
            Filters
            {count > 0 && (
              <span className="ml-2 rounded-pill bg-indigo px-2 py-0.5 text-[0.75rem] text-white">
                {count}
                <span className="sr-only"> set</span>
              </span>
            )}
          </span>
          <CaretDown
            aria-hidden="true"
            size={16}
            className={open ? "rotate-180" : ""}
          />
        </button>
      </div>

      <div
        id="appointment-filters"
        className={`${open ? "grid" : "hidden"} gap-5 rounded-card border border-card-border bg-raised p-5 md:grid md:grid-cols-2 lg:grid-cols-4`}
      >
        <Select
          label="Service"
          name="serviceId"
          value={filters.serviceId ?? ""}
          onChange={(event) =>
            go({ serviceId: event.target.value || undefined })
          }
          options={[{ value: "", label: "All services" }, ...services]}
        />
        <Select
          label="Format"
          name="format"
          value={filters.format ?? ""}
          onChange={(event) =>
            go({
              format: (event.target.value ||
                undefined) as ListFilters["format"],
            })
          }
          options={[
            { value: "", label: "All formats" },
            ...Object.entries(formatNames).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <Input
          key={`from-${filters.from}`}
          label="From"
          name="from"
          type="date"
          defaultValue={filters.from}
          onChange={(event) => go({ from: event.target.value || undefined })}
        />
        <Input
          key={`to-${filters.to}`}
          label="To (included)"
          name="to"
          type="date"
          defaultValue={filters.to}
          min={filters.from}
          onChange={(event) => go({ to: event.target.value || undefined })}
        />
        <fieldset className="m-0 min-w-0 border-0 p-0 md:col-span-2 lg:col-span-4">
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
