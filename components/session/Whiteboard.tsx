"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  COLOURS,
  MAX_TEXT,
  type Colour,
  type Size,
  type Tool,
} from "@/lib/session/board";
import {
  ASPECT,
  TEXT_FONT,
  TEXT_SIZES,
  drawPaper,
  drawStrokes,
} from "@/lib/session/boardCanvas";
import type { Whiteboard as Board } from "@/lib/session/useWhiteboard";

export type Pen = { tool: Tool; colour: Colour; size: Size };

const POINTER = "#ab4347";

const round = (n: number) =>
  Math.round(Math.min(1, Math.max(0, n)) * 1e4) / 1e4;

function at(event: PointerEvent<HTMLCanvasElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  return [
    round((event.clientX - rect.left) / rect.width),
    round((event.clientY - rect.top) / rect.height),
  ];
}

// The 3:4 page, as large as its space allows: the paper and starting
// page, the strokes above it, and Daw Mi's pointer on top. With a `pen` this
// side draws; without one it watches and `onPoint` follows the mouse.
export function Whiteboard({
  wb,
  label,
  pen,
  onPoint,
  textHint,
}: {
  wb: Board;
  label: string;
  pen?: Pen;
  onPoint?: (point: number[] | null) => void;
  textHint?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLCanvasElement>(null);
  const ink = useRef<HTMLCanvasElement>(null);
  const top = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const height = Math.round(width * ASPECT);
  const live = useRef<{ id: string; points: number[]; frame: number } | null>(
    null,
  );
  const { board, pointer, act } = wb;
  const typing = pen?.tool === "text";
  const input = useRef<HTMLInputElement>(null);
  // The words being typed and where they will go, drawn on the top layer
  // until placed.
  const [draft, setDraft] = useState<{ spot: number[]; words: string } | null>(
    null,
  );

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width * devicePixelRatio));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ctx = paper.current?.getContext("2d");
    if (ctx && width) drawPaper(ctx, width, board);
  }, [width, board]);

  useEffect(() => {
    const ctx = ink.current?.getContext("2d");
    if (ctx && width) drawStrokes(ctx, width, board.strokes);
  }, [width, board.strokes]);

  useEffect(() => {
    const ctx = top.current?.getContext("2d");
    if (!ctx || !width) return;
    ctx.clearRect(0, 0, width, height);
    if (draft && pen && typing) {
      const x = draft.spot[0] * width;
      const y = draft.spot[1] * height;
      const size = TEXT_SIZES[pen.size] * width;
      ctx.font = `${size}px ${TEXT_FONT}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = COLOURS[pen.colour];
      ctx.globalAlpha = draft.words ? 1 : 0.45;
      ctx.fillText(draft.words || (textHint ?? ""), x, y);
      ctx.globalAlpha = 1;
      const end = draft.words ? x + ctx.measureText(draft.words).width : x;
      ctx.fillRect(end + size * 0.05, y, Math.max(2, size * 0.06), size);
    }
    if (!pointer) return;
    ctx.strokeStyle = POINTER;
    ctx.lineWidth = width * 0.006;
    ctx.beginPath();
    ctx.arc(
      pointer.x * width,
      pointer.y * height,
      width * 0.02,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }, [width, height, pointer, draft, pen, typing, textHint]);

  // Points are sent once per frame, not once per pointer event.
  const flush = () => {
    const stroke = live.current;
    if (!stroke?.points.length) return;
    act({ t: "points", id: stroke.id, points: stroke.points });
    stroke.points = [];
    stroke.frame = 0;
  };

  const place = () => {
    const words = draft?.words.trim();
    if (pen && draft && words) {
      act({
        t: "begin",
        stroke: {
          id: Math.random().toString(36).slice(2, 10),
          by: wb.role,
          ...pen,
          points: draft.spot,
          text: words,
        },
      });
    }
    setDraft(null);
  };

  const down = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!pen) return;
    if (typing) {
      // Focused here, inside the tap, so phones open the keyboard; the
      // default is stopped so the tap doesn't take the focus back.
      event.preventDefault();
      place();
      setDraft({ spot: at(event), words: "" });
      input.current?.focus();
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const id = Math.random().toString(36).slice(2, 10);
    live.current = { id, points: [], frame: 0 };
    act({ t: "begin", stroke: { id, by: wb.role, ...pen, points: at(event) } });
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!pen) {
      onPoint?.(at(event));
      return;
    }
    const stroke = live.current;
    if (!stroke) return;
    stroke.points.push(...at(event));
    stroke.frame ||= requestAnimationFrame(flush);
  };

  const up = () => {
    if (!live.current) return;
    cancelAnimationFrame(live.current.frame);
    flush();
    live.current = null;
  };

  const layer = "absolute inset-0 size-full";
  return (
    <div className="flex size-full items-center justify-center [container-type:size]">
      <div
        ref={box}
        role="img"
        aria-label={label}
        className="relative aspect-[3/4] w-[min(100cqw,75cqh)] overflow-hidden rounded-inner shadow-lifted"
      >
        <canvas ref={paper} width={width} height={height} className={layer} />
        <canvas ref={ink} width={width} height={height} className={layer} />
        <canvas
          ref={top}
          width={width}
          height={height}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={() => !pen && onPoint?.(null)}
          className={`${layer} touch-none ${pen ? (pen.tool === "eraser" ? "cursor-cell" : typing ? "cursor-text" : "cursor-crosshair") : ""}`}
        />
        {typing && (
          <input
            ref={input}
            aria-label={textHint}
            tabIndex={-1}
            maxLength={MAX_TEXT}
            enterKeyHint="done"
            value={draft?.words ?? ""}
            onChange={(event) =>
              draft && setDraft({ ...draft, words: event.target.value })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") place();
              if (event.key === "Escape") setDraft(null);
            }}
            onBlur={place}
            className="pointer-events-none absolute top-0 left-0 size-px text-base opacity-0"
          />
        )}
      </div>
    </div>
  );
}
