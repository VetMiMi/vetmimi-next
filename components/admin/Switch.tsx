// An on/off switch: a native checkbox with the switch role, so the label,
// keyboard and screen reader all behave as a checkbox would. The knob's
// position and the "On"/"Off" word carry the state, not colour alone.
export function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3 text-[0.95rem] font-medium">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-7 w-12 shrink-0 rounded-pill bg-input-border transition-colors duration-150 peer-checked:bg-indigo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-coral peer-disabled:opacity-50 after:absolute after:top-1 after:left-1 after:size-5 after:rounded-pill after:bg-white after:transition-transform after:duration-150 peer-checked:after:translate-x-5 motion-reduce:transition-none motion-reduce:after:transition-none"
      />
      <span>
        {label}
        <span className="ml-2 text-[0.82rem] font-semibold text-muted">
          {checked ? "On" : "Off"}
        </span>
      </span>
    </label>
  );
}
