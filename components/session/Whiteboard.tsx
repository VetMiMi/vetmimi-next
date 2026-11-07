"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Colour, Size, Tool } from "@/lib/session/board";
import { ASPECT, drawPaper, drawStrokes } from "@/lib/session/boardCanvas";
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
}: {
  wb: Board;
  label: string;
  pen?: Pen;
  onPoint?: (point: number[] | null) => void;
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
  }, [width, height, pointer]);

  // Points are sent once per frame, not once per pointer event.
  const flush = () => {
    const stroke = live.current;
    if (!stroke?.points.length) return;
    act({ t: "points", id: stroke.id, points: stroke.points });
    stroke.points = [];
    stroke.frame = 0;
  };

  const down = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!pen) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const id = Math.random().toString(36).slice(2, 10);
    live.current = { id, points: [], frame: 0 };
    act({ t: "begin", stroke: { id, ...pen, points: at(event) } });
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
          className={`${layer} touch-none ${pen ? (pen.tool === "eraser" ? "cursor-cell" : "cursor-crosshair") : ""}`}
        />
      </div>
    </div>
  );
}
