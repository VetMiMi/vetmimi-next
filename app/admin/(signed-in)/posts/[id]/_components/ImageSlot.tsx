"use client";

import {
  ArrowDown,
  ArrowUp,
  ImageSquare,
  Plus,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { move, type Media } from "@/lib/admin/media";
import { MediaThumb } from "./MediaThumb";

const iconButton =
  "inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-ink transition-colors duration-150 hover:bg-indigo/12 hover:text-indigo disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent motion-reduce:transition-none";

// A version's images in the order the platform shows them (#151): each
// with its alt text, moved up or down or taken out; "Add image" opens the
// media library. With room for one, adding replaces it.
export function ImageSlot({
  label,
  rule,
  ids,
  media,
  max,
  disabled,
  onChange,
  onAdd,
}: {
  label: string;
  rule: string;
  ids: string[];
  media: Record<string, Media>;
  max: number;
  disabled: boolean;
  onChange: (ids: string[]) => void;
  onAdd: () => void;
}) {
  const ordered = ids.length > 1;
  return (
    <div>
      <p className="mb-1 text-[0.88rem] font-medium">{label}</p>
      <p className="mb-3 text-[0.88rem] leading-[1.6] text-muted">{rule}</p>
      {ids.length === 0 ? (
        <p className="mb-3 flex items-center gap-3 rounded-control border border-dashed border-input-border bg-paper/60 px-4 py-[13px] text-[0.88rem] text-muted">
          <ImageSquare aria-hidden="true" size={22} className="shrink-0" />
          No images yet.
        </p>
      ) : (
        <ol className="mb-3 flex flex-col gap-2">
          {ids.map((id, index) => {
            const item = media[id];
            const name = item?.alt?.en || `Image ${index + 1}`;
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-inner border border-card-border bg-white p-2"
              >
                {item ? (
                  <MediaThumb media={item} className="size-16 rounded-small" />
                ) : (
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-small bg-red/7 text-action">
                    <WarningCircle aria-hidden="true" size={22} />
                  </span>
                )}
                {/* On a phone the buttons sit under the text, so the alt
                    text keeps room to be read. */}
                <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
                  <div className="min-w-0 flex-1 text-[0.88rem] leading-[1.5]">
                    {ordered && (
                      <p className="text-[0.78rem] font-semibold text-muted">
                        {index + 1} of {ids.length}
                      </p>
                    )}
                    <p className="line-clamp-2 break-words">
                      {item
                        ? item.alt?.en || "No alt text"
                        : "Missing from the library. Take it out and choose another."}
                    </p>
                  </div>
                  {!disabled && (
                    <div className="-ml-3 flex shrink-0 items-center sm:ml-0">
                      {ordered && (
                        <>
                          <button
                            type="button"
                            aria-label={`Move ${name} earlier`}
                            disabled={index === 0}
                            onClick={() => onChange(move(ids, index, -1))}
                            className={iconButton}
                          >
                            <ArrowUp aria-hidden="true" size={18} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${name} later`}
                            disabled={index === ids.length - 1}
                            onClick={() => onChange(move(ids, index, 1))}
                            className={iconButton}
                          >
                            <ArrowDown aria-hidden="true" size={18} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        aria-label={`Take ${name} out`}
                        onClick={() => onChange(ids.filter((x) => x !== id))}
                        className={`${iconButton} hover:text-action`}
                      >
                        <Trash aria-hidden="true" size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {!disabled && (ids.length < max || max === 1) && (
        <Button
          variant="secondary"
          icon={<Plus aria-hidden="true" size={18} />}
          onClick={onAdd}
        >
          {max === 1 && ids.length === 1 ? "Replace image" : "Add image"}
        </Button>
      )}
    </div>
  );
}
