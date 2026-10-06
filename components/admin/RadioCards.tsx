import { describedBy, fieldIds } from "@/lib/fieldIds";
import { FieldError, FieldHelp, labelClass } from "./Field";

export type RadioOption = { value: string; label: string; help?: string };

// Choices that change what happens next, as .contact-choice cards with
// radio semantics: the whole card is the target, the chosen one gets the
// indigo border and tint as well as the filled radio, never colour alone.
export function RadioCards({
  label,
  name,
  options,
  value,
  defaultValue,
  onChange,
  help,
  error,
  columns = 2,
}: {
  label: string;
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  help?: string;
  error?: string;
  columns?: 2 | 3;
}) {
  const ids = fieldIds(name);
  const grid = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <fieldset
      className="m-0 min-w-0 border-0 p-0"
      aria-describedby={describedBy(ids, { help: !!help, error: !!error })}
    >
      <legend className={labelClass}>{label}</legend>
      <FieldHelp id={ids.help} help={help} />
      <div className={`grid grid-cols-1 gap-3 ${grid}`}>
        {options.map((option, i) => (
          <label
            key={option.value}
            className="flex min-h-11 cursor-pointer items-start gap-3 rounded-choice border border-card-border bg-raised px-5 py-4 transition-colors duration-150 hover:border-rose has-checked:border-indigo has-checked:bg-indigo/7 has-focus-visible:border-rose motion-reduce:transition-none"
          >
            <input
              type="radio"
              id={i === 0 ? ids.control : undefined}
              name={name}
              value={option.value}
              checked={value === undefined ? undefined : value === option.value}
              defaultChecked={
                defaultValue === undefined
                  ? undefined
                  : defaultValue === option.value
              }
              onChange={() => onChange?.(option.value)}
              className="mt-1 size-4 shrink-0 accent-indigo"
            />
            <span className="flex flex-col gap-1">
              <span className="text-[0.95rem] font-semibold">
                {option.label}
              </span>
              {option.help && (
                <span className="text-[0.88rem] leading-[1.6] text-muted">
                  {option.help}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
      <FieldError id={ids.error} error={error} />
    </fieldset>
  );
}
