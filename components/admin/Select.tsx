import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { Field, controlClass, type FieldProps } from "./Field";

type Option = { value: string; label: string; disabled?: boolean };

type SelectProps = FieldProps &
  Omit<
    React.ComponentProps<"select">,
    keyof FieldProps | "id" | "className" | "children"
  > & { options: Option[] };

// A native <select>, so the phone's own picker opens on touch. Its own arrow
// is hidden: browsers draw it against the edge, ignoring the padding.
export function SelectControl({
  options,
  ...props
}: Omit<React.ComponentProps<"select">, "className" | "children"> & {
  options: Option[];
}) {
  return (
    <div className="relative">
      <select className={`${controlClass} appearance-none pr-12`} {...props}>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <CaretDown
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

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
      {(control) => <SelectControl options={options} {...rest} {...control} />}
    </Field>
  );
}
