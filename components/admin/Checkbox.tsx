import { describedBy, fieldIds } from "@/lib/fieldIds";
import { FieldError, Requirement, type FieldProps } from "./Field";

type CheckboxProps = FieldProps &
  Omit<
    React.ComponentProps<"input">,
    keyof FieldProps | "id" | "className" | "children" | "type"
  >;

// The .contact-privacy pattern: box beside its label, rose when ticked. The
// whole label is the tap target, at least 44px high.
export function Checkbox({
  label,
  name,
  help,
  error,
  required,
  ...rest
}: CheckboxProps) {
  const ids = fieldIds(name);
  return (
    <div>
      <label
        htmlFor={ids.control}
        className="flex min-h-11 cursor-pointer items-start gap-3 py-2.5 text-[0.9rem] has-disabled:cursor-not-allowed has-disabled:text-muted"
      >
        <input
          type="checkbox"
          className="mt-1 size-4 shrink-0 cursor-[inherit] accent-rose"
          {...rest}
          id={ids.control}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { help: !!help, error: !!error })}
        />
        <span>
          {label}
          <Requirement required={required} showOptional={false} />
        </span>
      </label>
      {help && (
        <p
          id={ids.help}
          className="-mt-1 pl-7 text-[0.88rem] leading-[1.6] text-muted"
        >
          {help}
        </p>
      )}
      <FieldError id={ids.error} error={error} className="pl-7" />
    </div>
  );
}
