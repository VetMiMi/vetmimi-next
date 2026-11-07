import {
  COLOURS,
  PAPERS,
  type Board,
  type PageId,
  type Size,
  type Stroke,
} from "./board";

// Line widths as a share of the page's side, so both screens agree.
const WIDTHS: Record<Size, number> = {
  small: 0.006,
  medium: 0.014,
  large: 0.032,
};

// A body outline's left half in a 100 × 100 page, mirrored for the right.
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

// Starting pages as SVG path data in a 100 × 100 page.
const PAGE_PATHS: Record<PageId, string> = {
  blank: "",
  circle: "M 90 50 A 40 40 0 1 1 10 50 A 40 40 0 1 1 90 50 Z",
  body: `M 58 15 A 8 8 0 1 1 42 15 A 8 8 0 1 1 58 15 Z ${BODY} Z`,
  frame: "M 8 8 H 92 V 92 H 8 Z M 14 14 H 86 V 86 H 14 Z",
};

export function drawPaper(
  ctx: CanvasRenderingContext2D,
  side: number,
  board: Board,
) {
  const paper = PAPERS[board.paper];
  ctx.fillStyle = paper.fill;
  ctx.fillRect(0, 0, side, side);
  const path = PAGE_PATHS[board.page];
  if (!path) return;
  ctx.save();
  ctx.scale(side / 100, side / 100);
  ctx.strokeStyle = paper.line;
  ctx.lineWidth = 0.5;
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D(path));
  ctx.restore();
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  side: number,
  stroke: Stroke,
) {
  const { points } = stroke;
  if (points.length < 2) return;
  const marker = stroke.tool === "marker";
  ctx.globalCompositeOperation =
    stroke.tool === "eraser" ? "destination-out" : "source-over";
  ctx.globalAlpha = marker ? 0.45 : 1;
  ctx.strokeStyle = COLOURS[stroke.colour];
  ctx.fillStyle = COLOURS[stroke.colour];
  const width = WIDTHS[stroke.size] * side * (marker ? 2.2 : 1);
  ctx.lineWidth = width;
  ctx.lineCap = marker ? "square" : "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (points.length === 2) {
    ctx.arc(points[0] * side, points[1] * side, width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.moveTo(points[0] * side, points[1] * side);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i] * side, points[i + 1] * side);
  }
  ctx.stroke();
}

// Strokes go on their own transparent layer, so the eraser uncovers the
// paper and its page instead of painting over them.
export function drawStrokes(
  ctx: CanvasRenderingContext2D,
  side: number,
  strokes: Stroke[],
) {
  ctx.clearRect(0, 0, side, side);
  for (const stroke of strokes) drawStroke(ctx, side, stroke);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

// The finished picture as a PNG, for the client's own copy.
export function boardPng(board: Board, side = 1600): Promise<Blob | null> {
  const strokes = document.createElement("canvas");
  strokes.width = strokes.height = side;
  drawStrokes(strokes.getContext("2d")!, side, board.strokes);
  const out = document.createElement("canvas");
  out.width = out.height = side;
  const ctx = out.getContext("2d")!;
  drawPaper(ctx, side, board);
  ctx.drawImage(strokes, 0, 0);
  return new Promise((resolve) => out.toBlob(resolve, "image/png"));
}
