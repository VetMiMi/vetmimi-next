// The honeypot (lib/spam.ts): a field a person never sees or reaches with
// the keyboard, and screen readers skip, but a form-filling bot completes.
// Named "website" because bots fill that eagerly; autocomplete is off so a
// browser never fills it for a real visitor.
export function FormTrap({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden className="sr-only">
      <label>
        {label}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
