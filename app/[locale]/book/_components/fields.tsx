import { WarningCircle } from "@phosphor-icons/react";

// The details form's input, label and error, kept to the original /book look.
export const inputClass =
  "w-full rounded-sm border border-ink/20 bg-white px-4 py-3 text-[1rem] text-ink outline-none";

export const labelClass =
  "mb-[0.3rem] block text-[0.85rem] font-semibold text-ink";

// A field's error under it: icon and words, not colour alone.
export function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p
      id={id}
      className="mt-[0.4rem] flex items-center gap-[0.35rem] text-[0.82rem] text-action"
    >
      <WarningCircle size={16} weight="bold" aria-hidden />
      {children}
    </p>
  );
}
