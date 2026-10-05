"use client";

import { useEffect, useId, useRef } from "react";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { fieldId } from "@/lib/fieldIds";

export type FieldErrorItem = { name: string; message: string };

// The box at the top of a form after a failed submit (brief §7 Forms), in
// the .contact-status--error style with #ab4347 text (4.94:1 on its tint).
// Focus moves to it when errors appear; give it a new `key` on each submit
// to move focus again. It is a client component only for that.
export function ErrorSummary({
  title,
  errors,
}: {
  title: string;
  errors: FieldErrorItem[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const hasErrors = errors.length > 0;

  useEffect(() => {
    if (hasErrors) ref.current?.focus();
  }, [hasErrors]);

  if (!hasErrors) return null;

  // A #fragment only scrolls; this also puts focus in the field, and centres
  // it so its label above stays in view.
  function goTo(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const field = document.getElementById(id);
    if (!field) return;
    event.preventDefault();
    field.scrollIntoView({ block: "center" });
    field.focus({ preventScroll: true });
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby={titleId}
      className="rounded-notice border border-red/27 bg-red/7 px-6 py-5 text-[0.92rem] leading-[1.65] text-action"
    >
      <p id={titleId} className="flex items-center gap-2 font-semibold">
        <WarningCircle aria-hidden="true" size={20} className="shrink-0" />
        {title}
      </p>
      <ul className="mt-1 list-none pl-7">
        {errors.map(({ name, message }) => {
          const id = fieldId(name);
          return (
            <li key={name}>
              <a
                href={`#${id}`}
                onClick={(event) => goTo(event, id)}
                className="inline-block py-2.5 underline underline-offset-[3px] transition-colors duration-150 hover:text-action-hover motion-reduce:transition-none"
              >
                {message}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
