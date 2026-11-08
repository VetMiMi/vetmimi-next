import {
  COLOURS,
  PAPERS,
  type Board,
  type PageId,
  type Size,
  type Stroke,
} from "./board";

// The page is 3:4 portrait, like a sheet of paper. Widths and points are
// shares of the page, so both screens agree.
export const ASPECT = 4 / 3;

const WIDTHS: Record<Size, number> = {
  small: 0.006,
  medium: 0.014,
  large: 0.032,
};

export const TEXT_SIZES: Record<Size, number> = {
  small: 0.035,
  medium: 0.05,
  large: 0.075,
};
export const TEXT_FONT = "system-ui, sans-serif";

// A body outline's left half in a 100-wide page, mirrored for the right.
const BODY_LEFT = [
  [46, 23],
  [46, 27],
  [33, 30],
  [29, 33],
  [23, 58],
  [25, 62],
  [29, 59],
  [33, 40],
  [34, 62],
  [34, 91],
  [40, 93],
  [44, 91],
  [47, 64],
  [50, 64],
];
const BODY_RIGHT = BODY_LEFT.slice(0, -1).map(([x, y]) => [100 - x, y]);
const BODY = [...BODY_LEFT, ...BODY_RIGHT.reverse()]
  .map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`)
  .join(" ");

// Starting pages as SVG path data in a 100 × 133 page; the circle and the
// body are drawn in a square and moved down to the middle.
const MIDDLE = (100 * ASPECT - 100) / 2;
const PAGE_PATHS: Record<PageId, { path: string; centred: boolean }> = {
  blank: { path: "", centred: false },
  circle: {
    path: "M 90 50 A 40 40 0 1 1 10 50 A 40 40 0 1 1 90 50 Z",
    centred: true,
  },
  body: {
    path: `M 58 15 A 8 8 0 1 1 42 15 A 8 8 0 1 1 58 15 Z ${BODY} Z`,
    centred: true,
  },
  frame: {
    path: "M 8 8 H 92 V 125 H 8 Z M 14 14 H 86 V 119 H 14 Z",
    centred: false,
  },
};

export function drawPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  board: Board,
) {
  const paper = PAPERS[board.paper];
  ctx.fillStyle = paper.fill;
  ctx.fillRect(0, 0, width, width * ASPECT);
  const { path, centred } = PAGE_PATHS[board.page];
  if (!path) return;
  ctx.save();
  ctx.scale(width / 100, width / 100);
  if (centred) ctx.translate(0, MIDDLE);
  ctx.strokeStyle = paper.line;
  ctx.lineWidth = 0.5;
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D(path));
  ctx.restore();
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  width: number,
  stroke: Stroke,
) {
  const height = width * ASPECT;
  const { points } = stroke;
  if (points.length < 2) return;
  if (stroke.tool === "text") {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLOURS[stroke.colour];
    ctx.font = `${TEXT_SIZES[stroke.size] * width}px ${TEXT_FONT}`;
    ctx.textBaseline = "top";
    ctx.fillText(stroke.text ?? "", points[0] * width, points[1] * height);
    return;
  }
  const marker = stroke.tool === "marker";
  ctx.globalCompositeOperation =
    stroke.tool === "eraser" ? "destination-out" : "source-over";
  ctx.globalAlpha = marker ? 0.45 : 1;
  ctx.strokeStyle = COLOURS[stroke.colour];
  ctx.fillStyle = COLOURS[stroke.colour];
  const line = WIDTHS[stroke.size] * width * (marker ? 2.2 : 1);
  ctx.lineWidth = line;
  ctx.lineCap = marker ? "square" : "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (points.length === 2) {
    ctx.arc(points[0] * width, points[1] * height, line / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.moveTo(points[0] * width, points[1] * height);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i] * width, points[i + 1] * height);
  }
  ctx.stroke();
}

// Strokes go on their own transparent layer, so the eraser uncovers the
// paper and its page instead of painting over them.
export function drawStrokes(
  ctx: CanvasRenderingContext2D,
  width: number,
  strokes: Stroke[],
) {
  ctx.clearRect(0, 0, width, width * ASPECT);
  for (const stroke of strokes) drawStroke(ctx, width, stroke);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

// The finished picture as a PNG, for the client's own copy.
export function boardPng(board: Board, width = 1500): Promise<Blob | null> {
  const height = width * ASPECT;
  const strokes = document.createElement("canvas");
  strokes.width = width;
  strokes.height = height;
  drawStrokes(strokes.getContext("2d")!, width, board.strokes);
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d")!;
  drawPaper(ctx, width, board);
  ctx.drawImage(strokes, 0, 0);
  return new Promise((resolve) => out.toBlob(resolve, "image/png"));
}
