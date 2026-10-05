// Ids for a form control and the text that describes it, all derived from
// the control's name, so the label, help, error and the error summary's link
// always point at the same element. Names can hold characters an id selector
// or a #fragment would trip on ("periods[0].start"), so those become dashes.

export type FieldIds = { control: string; help: string; error: string };

export function fieldId(name: string): string {
  const slug = name.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return `field-${slug}`;
}

export function fieldIds(name: string): FieldIds {
  const control = fieldId(name);
  return { control, help: `${control}-help`, error: `${control}-error` };
}

// The value for aria-describedby: help first, then the error, so a screen
// reader reads them in the order they appear; undefined when there is neither.
export function describedBy(
  ids: FieldIds,
  { help, error }: { help?: boolean; error?: boolean },
): string | undefined {
  const parts = [help && ids.help, error && ids.error].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}
