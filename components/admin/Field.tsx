import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { describedBy, fieldIds } from "@/lib/fieldIds";

// The props every form control shares (brief §7 Forms). Strings are plain
// English props: admin has no message files (ADR-002).
export type FieldProps = {
  label: string;
  name: string;
  help?: string;
  error?: string;
  required?: boolean;
};

// What a control spreads onto its element so the label, help and error
// reach assistive technology.
export type ControlProps = {
  id: string;
  name: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

// The .contact-input box from styles/contact.css, with the admin border
// #8a8389 (3.69:1 on white) in place of the public 16% ink (1.37:1, §2).
// Focus is the rose border and halo, as there; `outline-none!` because the
// global coral :focus-visible ring in globals.css sits outside any layer and
// would otherwise draw a second ring around the halo.
export const controlClass =
  "block w-full rounded-control border border-input-border bg-white px-4 py-[13px] font-body text-base text-ink outline-none! transition-[border-color,box-shadow] duration-150 ease-in-out hover:border-muted focus:border-rose focus:shadow-focus-input not-focus:aria-[invalid=true]:border-action disabled:cursor-not-allowed disabled:border-input-border disabled:bg-paper disabled:text-muted motion-reduce:transition-none";

export const labelClass = "mb-2 block p-0 text-[0.88rem] font-medium";

const helpClass = "-mt-1 mb-2 text-[0.88rem] leading-[1.6] text-muted";

// `*` in rose for required, "(optional)" in #625d64 otherwise. The `*` is
// hidden from screen readers because the control's `required` says it.
export function Requirement({
  required,
  showOptional = true,
}: {
  required?: boolean;
  showOptional?: boolean;
}) {
  if (required)
    return (
      <span aria-hidden="true" className="text-rose">
        {" *"}
      </span>
    );
  if (!showOptional) return null;
  return <span className="font-normal text-muted"> (optional)</span>;
}

export function FieldHelp({ id, help }: { id: string; help?: string }) {
  if (!help) return null;
  return (
    <p id={id} className={helpClass}>
      {help}
    </p>
  );
}

// The live region stays in the page so an error added on blur is announced;
// one rendered with the page is left to the error summary to announce.
export function FieldError({
  id,
  error,
  className = "",
}: {
  id: string;
  error?: string;
  className?: string;
}) {
  return (
    <div aria-live="polite" className={className}>
      {error && (
        <p
          id={id}
          className="mt-2 flex items-start gap-1.5 text-[0.88rem] leading-[1.6] text-action"
        >
          <WarningCircle
            aria-hidden="true"
            size={18}
            className="mt-[2px] shrink-0"
          />
          {error}
        </p>
      )}
    </div>
  );
}

// Label above, help under the label, the control, then the error under it,
// with every id derived from `name`.
export function Field({
  label,
  name,
  help,
  error,
  required,
  children,
}: FieldProps & { children: (control: ControlProps) => React.ReactNode }) {
  const ids = fieldIds(name);
  const control: ControlProps = {
    id: ids.control,
    name,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy(ids, { help: !!help, error: !!error }),
  };
  return (
    <div>
      <label htmlFor={ids.control} className={labelClass}>
        {label}
        <Requirement required={required} />
      </label>
      <FieldHelp id={ids.help} help={help} />
      {children(control)}
      <FieldError id={ids.error} error={error} />
    </div>
  );
}
