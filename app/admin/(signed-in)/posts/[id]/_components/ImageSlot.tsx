import { ImageSquare } from "@phosphor-icons/react";

// Where a version's images will be chosen. The media library arrives with
// the next API release (vetmimi-api #119); until then this shows what the
// post already references and is not editable.
export function ImageSlot({
  label,
  ids,
  rule,
}: {
  label: string;
  ids: string[];
  rule: string;
}) {
  const count = ids.length;
  return (
    <div>
      <p className="mb-2 text-[0.88rem] font-medium">{label}</p>
      <div className="flex items-start gap-3 rounded-control border border-dashed border-input-border bg-paper/60 px-4 py-[13px] text-[0.88rem] leading-[1.6] text-muted">
        <ImageSquare aria-hidden="true" size={22} className="mt-px shrink-0" />
        <p>
          <span className="font-semibold text-ink">
            {count === 0
              ? "No images yet."
              : `${count} ${count === 1 ? "image" : "images"} attached.`}
          </span>{" "}
          {rule} Uploading and choosing images comes with the media library.
        </p>
      </div>
    </div>
  );
}
