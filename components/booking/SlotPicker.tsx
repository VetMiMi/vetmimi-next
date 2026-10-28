"use client";
import { Fragment, useRef, type KeyboardEvent, type Ref } from "react";

type Slot = { startsAt: string; endsAt: string };

// The free times of one day as a radio group of large buttons. `time`
// gives the visible text ("10:00 am") and `name` the full accessible name
// with the zone ("10:00 am AEDT"); both come from the caller, which formats
// in the practice timezone. Arrow keys move between times.
//
// With `group`, each run of times sharing a group gets a heading above it,
// such as "Morning"; arrow keys still move through every time in order.
//
// With `chosen` it is a multi-select instead (#61): toggle buttons, each
// in the tab order and toggled with Space or Enter, and once `max` are
// chosen the others answer nothing until one is removed.
export function SlotPicker({
  slots,
  selected,
  chosen,
  max = Infinity,
  label,
  time,
  name,
  groupRef,
  group,
  onSelect,
}: {
  slots: readonly Slot[];
  selected?: string;
  chosen?: readonly string[];
  max?: number;
  label: string;
  time: (startsAt: string) => string;
  name: (startsAt: string) => string;
  groupRef?: Ref<HTMLDivElement>;
  group?: (startsAt: string) => string;
  onSelect: (slot: Slot) => void;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = slots.findIndex((s) => s.startsAt === selected);
  const multiple = chosen !== undefined;

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    if (multiple) return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      e.key
    ];
    if (!step) return;
    e.preventDefault();
    const next = (index + step + slots.length) % slots.length;
    buttons.current[next]?.focus();
    onSelect(slots[next]);
  };

  return (
    <div
      ref={groupRef}
      role={multiple ? "group" : "radiogroup"}
      aria-label={label}
      tabIndex={-1}
      className="mb-2 flex flex-wrap gap-[0.6rem] outline-none!"
    >
      {slots.map((slot, i) => {
        const heading = group?.(slot.startsAt);
        const newGroup =
          heading !== undefined &&
          (i === 0 || heading !== group?.(slots[i - 1].startsAt));
        const checked = multiple
          ? chosen.includes(slot.startsAt)
          : slot.startsAt === selected;
        const full = multiple && !checked && chosen.length >= max;
        const tone = checked
          ? "cursor-pointer border-indigo bg-indigo text-white"
          : full
            ? "cursor-not-allowed border-ink/20 bg-white text-ink/40"
            : "cursor-pointer border-ink/20 bg-white text-ink";
        return (
          <Fragment key={slot.startsAt}>
            {newGroup && (
              // Visual only: each time's own name already says when it is.
              <p
                aria-hidden="true"
                className="basis-full text-[0.8rem] font-semibold text-muted not-first:mt-2"
              >
                {heading}
              </p>
            )}
            <button
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role={multiple ? undefined : "radio"}
              aria-checked={multiple ? undefined : checked}
              aria-pressed={multiple ? checked : undefined}
              aria-disabled={full || undefined}
              aria-label={name(slot.startsAt)}
              tabIndex={
                multiple || checked || (checkedIndex < 0 && i === 0) ? 0 : -1
              }
              onClick={() => {
                if (!full) onSelect(slot);
              }}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-11 rounded-cell border px-5 py-[0.6rem] text-[0.9rem] transition-[background-color,color,border-color] ease-[ease] ${tone}`}
            >
              {time(slot.startsAt)}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
