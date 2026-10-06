"use client";
import { useRef, type KeyboardEvent, type Ref } from "react";
import { C } from "@/lib/tokens";

type Slot = { startsAt: string; endsAt: string };

// The free times of one day as a radio group of large buttons. `time`
// gives the visible text ("10:00 am") and `name` the full accessible name
// with the zone ("10:00 am AEDT"); both come from the caller, which formats
// in the practice timezone. Arrow keys move between times.
export function SlotPicker({
  slots,
  selected,
  label,
  time,
  name,
  groupRef,
  onSelect,
}: {
  slots: readonly Slot[];
  selected?: string;
  label: string;
  time: (startsAt: string) => string;
  name: (startsAt: string) => string;
  groupRef?: Ref<HTMLDivElement>;
  onSelect: (slot: Slot) => void;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = slots.findIndex((s) => s.startsAt === selected);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
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
      role="radiogroup"
      aria-label={label}
      tabIndex={-1}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.6rem",
        marginBottom: "0.5rem",
        outline: "none",
      }}
    >
      {slots.map((slot, i) => {
        const checked = slot.startsAt === selected;
        return (
          <button
            key={slot.startsAt}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={name(slot.startsAt)}
            tabIndex={checked || (checkedIndex < 0 && i === 0) ? 0 : -1}
            onClick={() => onSelect(slot)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="booking-slot"
            style={{
              padding: "0.6rem 1.25rem",
              minHeight: 44,
              border: `1px solid ${checked ? C.indigo : `${C.ink}33`}`,
              borderRadius: 6,
              cursor: "pointer",
              backgroundColor: checked ? C.indigo : "#fff",
              color: checked ? "#fff" : C.ink,
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
            }}
          >
            {time(slot.startsAt)}
          </button>
        );
      })}
    </div>
  );
}
