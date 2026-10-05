import { Field, controlClass, type FieldProps } from "./Field";

type SelectProps = FieldProps &
  Omit<
    React.ComponentProps<"select">,
    keyof FieldProps | "id" | "className" | "children"
  > & { options: { value: string; label: string }[] };

// A native <select>, so the phone's own picker opens on touch.
export function Select({
  label,
  name,
  help,
  error,
  required,
  options,
  ...rest
}: SelectProps) {
  return (
    <Field
      label={label}
      name={name}
      help={help}
      error={error}
      required={required}
    >
      {(control) => (
        <select className={controlClass} {...rest} {...control}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
