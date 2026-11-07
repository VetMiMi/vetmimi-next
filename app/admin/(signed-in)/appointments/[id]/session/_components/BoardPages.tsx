"use client";
import { Circle, FrameCorners, Person, Square } from "@phosphor-icons/react";
import { PAGES, type PageId } from "@/lib/session/board";
import type { Whiteboard } from "@/lib/session/useWhiteboard";

const PAGE_OPTIONS: Record<PageId, { label: string; Icon: typeof Circle }> = {
  blank: { label: "Blank page", Icon: Square },
  circle: { label: "Circle", Icon: Circle },
  body: { label: "Body outline", Icon: Person },
  frame: { label: "Frame", Icon: FrameCorners },
};

// Daw Mi's bar under the client's drawing: the starting page, and a reminder
// that nothing is kept.
export function BoardPages({
  wb,
  visitor,
}: {
  wb: Whiteboard;
  visitor: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-1.5">
      <div
        role="toolbar"
        aria-label="Starting page"
        className="flex items-center gap-2"
      >
        {PAGES.map((page) => {
          const { label, Icon } = PAGE_OPTIONS[page];
          return (
            <button
              key={page}
              type="button"
              aria-label={label}
              aria-pressed={wb.board.page === page}
              title={label}
              onClick={() => wb.act({ t: "page", page })}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-canvas/12 text-canvas hover:bg-canvas/24 aria-pressed:bg-canvas aria-pressed:text-stage"
            >
              <Icon aria-hidden="true" size={20} />
            </button>
          );
        })}
      </div>
      <p className="text-[0.85rem] text-canvas/80">
        Point by moving over the drawing. Nothing is saved; only {visitor} can
        keep a copy.
      </p>
    </div>
  );
}
