import { Field, controlClass, type FieldProps } from "./Field";

type TextareaProps = FieldProps &
  Omit<
    React.ComponentProps<"textarea">,
    keyof FieldProps | "id" | "className" | "children"
  >;

// textarea.contact-input: taller, resizable only downwards, looser lines.
export function Textarea({
  label,
  name,
  help,
  error,
  required,
  ...rest
}: TextareaProps) {
  return (
    <Field
      label={label}
      name={name}
      help={help}
      error={error}
      required={required}
    >
      {(control) => (
        <textarea
          className={`${controlClass} min-h-[168px] resize-y leading-[1.65]`}
          {...rest}
          {...control}
        />
      )}
    </Field>
  );
}
