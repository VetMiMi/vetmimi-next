"use client";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowCounterClockwise,
  CaretDown,
  DownloadSimple,
  Eraser,
  Highlighter,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import {
  COLOURS,
  PAPERS,
  SIZES,
  TOOLS,
  type Colour,
  type Paper,
} from "@/lib/session/board";
import { boardPng } from "@/lib/session/boardCanvas";
import type { Whiteboard } from "@/lib/session/useWhiteboard";
import type { BoardText } from "./text";
import type { Pen } from "./Whiteboard";

const TOOL_ICONS = { pen: PencilSimple, marker: Highlighter, eraser: Eraser };
const DOTS = { small: "size-1.5", medium: "size-2.5", large: "size-4" };

// Swatch fills come from the board's own palette; Tailwind cannot see
// colours chosen at runtime, so each one is listed here.
const COLOUR_BG: Record<Colour, string> = {
  black: "bg-[#222222]",
  grey: "bg-[#8a8a8a]",
  white: "bg-[#ffffff]",
  brown: "bg-[#7a4a2a]",
  red: "bg-[#d64545]",
  coral: "bg-[#f08060]",
  orange: "bg-[#f2a03d]",
  yellow: "bg-[#f5d547]",
  lime: "bg-[#9ccf6b]",
  green: "bg-[#3f8f5a]",
  teal: "bg-[#3aa7a3]",
  sky: "bg-[#7cc2ef]",
  blue: "bg-[#3460c4]",
  purple: "bg-[#7b55b8]",
  pink: "bg-[#e98bbd]",
  skinLight: "bg-[#f1c9a5]",
  skinMedium: "bg-[#c68e63]",
  skinDeep: "bg-[#8d5524]",
};
const PAPER_BG: Record<Paper, string> = {
  white: "bg-[#ffffff]",
  cream: "bg-[#f7f0e3]",
  grey: "bg-[#e6e4ea]",
  black: "bg-[#1e1e24]",
};

function Tool({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-canvas/12 text-canvas hover:bg-canvas/24 aria-pressed:bg-canvas aria-pressed:text-stage"
    >
      {children}
    </button>
  );
}

function Swatch({
  label,
  fill,
  pressed,
  onClick,
}: {
  label: string;
  fill: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className={`size-8 shrink-0 cursor-pointer rounded-full border border-canvas/40 ${fill} aria-pressed:ring-3 aria-pressed:ring-canvas aria-pressed:ring-offset-2 aria-pressed:ring-offset-stage`}
    />
  );
}

// The drawing tools in one row under the page: pen, marker or eraser, a
// button showing the current colour and size that opens a sheet with all of
// them and the paper, then undo, clear (tapped twice) and, for the client
// only, a copy to keep.
export function BoardTools({
  text,
  wb,
  pen,
  onPen,
  canSave = true,
}: {
  text: BoardText;
  wb: Whiteboard;
  pen: Pen;
  onPen: (pen: Pen) => void;
  canSave?: boolean;
}) {
  const [clearing, setClearing] = useState(false);
  const [sheet, setSheet] = useState(false);
  const { board, act } = wb;

  useEffect(() => {
    if (!clearing) return;
    const timer = setTimeout(() => setClearing(false), 3000);
    return () => clearTimeout(timer);
  }, [clearing]);

  const save = async () => {
    const blob = await boardPng(board);
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${text.fileName}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const divider = <span aria-hidden="true" className="h-6 w-px bg-canvas/24" />;
  return (
    <div className="relative">
      {sheet && (
        <div
          id="board-style"
          className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-3 rounded-inner bg-stage p-3 shadow-lifted ring-1 ring-canvas/24"
        >
          <div
            role="group"
            aria-label={text.sizes.label}
            className="flex gap-2"
          >
            {SIZES.map((size) => (
              <Tool
                key={size}
                label={text.sizes[size]}
                pressed={pen.size === size}
                onClick={() => onPen({ ...pen, size })}
              >
                <span className={`rounded-full bg-current ${DOTS[size]}`} />
              </Tool>
            ))}
          </div>
          <div
            role="group"
            aria-label={text.colours}
            className="flex flex-wrap gap-2"
          >
            {(Object.keys(COLOURS) as Colour[]).map((colour) => (
              <Swatch
                key={colour}
                label={text.colour[colour]}
                fill={COLOUR_BG[colour]}
                pressed={pen.colour === colour && pen.tool !== "eraser"}
                onClick={() => {
                  onPen({
                    ...pen,
                    colour,
                    tool: pen.tool === "eraser" ? "pen" : pen.tool,
                  });
                  setSheet(false);
                }}
              />
            ))}
          </div>
          <div role="group" aria-label={text.paper} className="flex gap-2">
            {(Object.keys(PAPERS) as Paper[]).map((paper) => (
              <Swatch
                key={paper}
                label={text.papers[paper]}
                fill={PAPER_BG[paper]}
                pressed={board.paper === paper}
                onClick={() => act({ t: "paper", paper })}
              />
            ))}
          </div>
        </div>
      )}
      <div
        role="toolbar"
        aria-label={text.tools}
        className="flex items-center justify-center gap-1.5 py-1"
      >
        {TOOLS.map((tool) => {
          const Icon = TOOL_ICONS[tool];
          return (
            <Tool
              key={tool}
              label={text[tool]}
              pressed={pen.tool === tool}
              onClick={() => onPen({ ...pen, tool })}
            >
              <Icon aria-hidden="true" size={20} />
            </Tool>
          );
        })}
        <button
          type="button"
          aria-label={text.style}
          aria-expanded={sheet}
          aria-controls="board-style"
          title={text.style}
          onClick={() => setSheet(!sheet)}
          className="flex h-10 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-canvas/12 px-2.5 text-canvas hover:bg-canvas/24 aria-expanded:bg-canvas aria-expanded:text-stage"
        >
          <span
            className={`flex size-6 items-center justify-center rounded-full border border-canvas/40 ${COLOUR_BG[pen.colour]}`}
          >
            <span
              className={`rounded-full ${DOTS[pen.size]} ${pen.colour === "white" || pen.colour === "yellow" ? "bg-ink" : "bg-canvas"}`}
            />
          </span>
          <CaretDown aria-hidden="true" size={14} />
        </button>
        {divider}
        <Tool label={text.undo} onClick={() => act({ t: "undo", by: wb.role })}>
          <ArrowCounterClockwise aria-hidden="true" size={20} />
        </Tool>
        <Tool
          label={clearing ? text.clearAgain : text.clear}
          pressed={clearing}
          onClick={() => {
            if (clearing) act({ t: "clear" });
            setClearing(!clearing);
          }}
        >
          <Trash aria-hidden="true" size={20} />
        </Tool>
        {canSave && (
          <Tool label={text.save} onClick={() => void save()}>
            <DownloadSimple aria-hidden="true" size={20} />
          </Tool>
        )}
      </div>
    </div>
  );
}
