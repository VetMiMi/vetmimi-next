import { Field, controlClass, type FieldProps } from "./Field";

export type InputProps = FieldProps &
  Omit<
    React.ComponentProps<"input">,
    keyof FieldProps | "id" | "className" | "children"
  >;

export function Input({
  label,
  name,
  help,
  error,
  required,
  type = "text",
  ...rest
}: InputProps) {
  return (
    <Field
      label={label}
      name={name}
      help={help}
      error={error}
      required={required}
    >
      {(control) => (
        <input type={type} className={controlClass} {...rest} {...control} />
      )}
    </Field>
  );
}
