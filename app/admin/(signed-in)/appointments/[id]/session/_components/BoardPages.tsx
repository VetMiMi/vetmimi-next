"use client";
import {
  Circle,
  FrameCorners,
  HandPointing,
  PencilSimple,
  Person,
  Square,
} from "@phosphor-icons/react";
import { PAGES, type PageId } from "@/lib/session/board";
import type { Whiteboard } from "@/lib/session/useWhiteboard";

const PAGE_OPTIONS: Record<PageId, { label: string; Icon: typeof Circle }> = {
  blank: { label: "Blank page", Icon: Square },
  circle: { label: "Circle", Icon: Circle },
  body: { label: "Body outline", Icon: Person },
  frame: { label: "Frame", Icon: FrameCorners },
};

const BUTTON =
  "flex size-11 cursor-pointer items-center justify-center rounded-full bg-canvas/12 text-canvas hover:bg-canvas/24 aria-pressed:bg-canvas aria-pressed:text-stage";

// Daw Mi's bar under the board: point or draw, the starting page, and a
// reminder that nothing is kept.
export function BoardPages({
  wb,
  visitor,
  drawing,
  onDrawing,
}: {
  wb: Whiteboard;
  visitor: string;
  drawing: boolean;
  onDrawing: (drawing: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-1.5">
      <div role="toolbar" aria-label="Mode" className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Point"
          aria-pressed={!drawing}
          title="Point"
          onClick={() => onDrawing(false)}
          className={BUTTON}
        >
          <HandPointing aria-hidden="true" size={20} />
        </button>
        <button
          type="button"
          aria-label="Draw"
          aria-pressed={drawing}
          title="Draw"
          onClick={() => onDrawing(true)}
          className={BUTTON}
        >
          <PencilSimple aria-hidden="true" size={20} />
        </button>
      </div>
      <span aria-hidden="true" className="h-6 w-px bg-canvas/24" />
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
              className={BUTTON}
            >
              <Icon aria-hidden="true" size={20} />
            </button>
          );
        })}
      </div>
      <p className="text-[0.85rem] text-canvas/80">
        {drawing
          ? "You draw on the same page."
          : "Point by moving over the drawing."}{" "}
        Nothing is saved; only {visitor} can keep a copy.
      </p>
    </div>
  );
}
