// The session whiteboard's state and the messages both browsers send each
// other over the call's data channel. Nothing here is stored or sent to a
// server. Points are x, y pairs from 0 to 1 across the page.

export const TOOLS = ["pen", "marker", "eraser"] as const;
export const SIZES = ["small", "medium", "large"] as const;
export const PAGES = ["blank", "circle", "body", "frame"] as const;
export const ROLES = ["client", "practitioner"] as const;

export const COLOURS = {
  black: "#222222",
  grey: "#8a8a8a",
  white: "#ffffff",
  brown: "#7a4a2a",
  red: "#d64545",
  coral: "#f08060",
  orange: "#f2a03d",
  yellow: "#f5d547",
  lime: "#9ccf6b",
  green: "#3f8f5a",
  teal: "#3aa7a3",
  sky: "#7cc2ef",
  blue: "#3460c4",
  purple: "#7b55b8",
  pink: "#e98bbd",
  skinLight: "#f1c9a5",
  skinMedium: "#c68e63",
  skinDeep: "#8d5524",
} as const;

export const PAPERS = {
  white: { fill: "#ffffff", line: "#d9d4d0" },
  cream: { fill: "#f7f0e3", line: "#d8ccb8" },
  grey: { fill: "#e6e4ea", line: "#c4c0cc" },
  black: { fill: "#1e1e24", line: "#55555f" },
} as const;

export type Tool = (typeof TOOLS)[number];
export type Size = (typeof SIZES)[number];
export type PageId = (typeof PAGES)[number];
export type Colour = keyof typeof COLOURS;
export type Paper = keyof typeof PAPERS;
export type Role = (typeof ROLES)[number];

export type Stroke = {
  id: string;
  by: Role;
  tool: Tool;
  colour: Colour;
  size: Size;
  points: number[];
};

export type Board = {
  open: boolean;
  page: PageId;
  paper: Paper;
  strokes: Stroke[];
  // Counts every change, so after a reconnect the side with more changes wins.
  rev: number;
};

export type BoardMessage =
  | { t: "open"; open: boolean }
  | { t: "page"; page: PageId }
  | { t: "paper"; paper: Paper }
  | { t: "begin"; stroke: Stroke }
  | { t: "points"; id: string; points: number[] }
  | { t: "undo"; by: Role }
  | { t: "clear" }
  | { t: "pointer"; x: number; y: number }
  | { t: "pointer-off" }
  | { t: "sync-begin"; board: Omit<Board, "strokes"> }
  | { t: "sync-stroke"; stroke: Stroke }
  | { t: "sync-end" };

export type BoardState = {
  board: Board;
  incoming: Board | null;
  pointer: { x: number; y: number } | null;
};

export const initialBoard: BoardState = {
  board: { open: false, page: "blank", paper: "white", strokes: [], rev: 0 },
  incoming: null,
  pointer: null,
};

const changed = (board: Board, change: Partial<Board>): Board => ({
  ...board,
  ...change,
  rev: board.rev + 1,
});

function apply(board: Board, message: BoardMessage): Board {
  switch (message.t) {
    case "open":
      return changed(board, { open: message.open });
    case "page":
      return changed(board, { page: message.page });
    case "paper":
      return changed(board, { paper: message.paper });
    case "begin":
      return changed(board, { strokes: [...board.strokes, message.stroke] });
    case "points": {
      const index = board.strokes.findLastIndex((s) => s.id === message.id);
      if (index < 0) return board;
      const strokes = [...board.strokes];
      const stroke = strokes[index];
      strokes[index] = {
        ...stroke,
        points: [...stroke.points, ...message.points],
      };
      return { ...board, strokes };
    }
    case "undo": {
      // Each side undoes only its own strokes.
      const index = board.strokes.findLastIndex((s) => s.by === message.by);
      if (index < 0) return board;
      return changed(board, { strokes: board.strokes.toSpliced(index, 1) });
    }
    case "clear":
      return changed(board, { strokes: [] });
    default:
      return board;
  }
}

export function boardReducer(
  state: BoardState,
  message: BoardMessage,
): BoardState {
  switch (message.t) {
    case "pointer":
      return { ...state, pointer: { x: message.x, y: message.y } };
    case "pointer-off":
      return { ...state, pointer: null };
    case "sync-begin":
      return {
        ...state,
        incoming:
          message.board.rev > state.board.rev
            ? { ...message.board, strokes: [] }
            : null,
      };
    case "sync-stroke":
      if (!state.incoming) return state;
      return {
        ...state,
        incoming: {
          ...state.incoming,
          strokes: [...state.incoming.strokes, message.stroke],
        },
      };
    case "sync-end":
      if (!state.incoming) return state;
      return { ...state, board: state.incoming, incoming: null };
    default:
      return { ...state, board: apply(state.board, message) };
  }
}

// One message per stroke, so no message outgrows the data channel's limit.
export function syncMessages(board: Board): BoardMessage[] {
  const { strokes, ...rest } = board;
  return [
    { t: "sync-begin", board: rest },
    ...strokes.map((stroke): BoardMessage => ({ t: "sync-stroke", stroke })),
    { t: "sync-end" },
  ];
}

const isPoints = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((n) => typeof n === "number");

const isStroke = (value: unknown): value is Stroke => {
  const s = value as Stroke;
  return (
    typeof s?.id === "string" &&
    ROLES.includes(s.by) &&
    TOOLS.includes(s.tool) &&
    s.colour in COLOURS &&
    SIZES.includes(s.size) &&
    isPoints(s.points)
  );
};

// The other browser is trusted to be ours, but a bad message must never
// break the page: anything unexpected is dropped.
export function parseBoardMessage(data: unknown): BoardMessage | null {
  if (typeof data !== "string") return null;
  let m: BoardMessage;
  try {
    m = JSON.parse(data);
  } catch {
    return null;
  }
  switch (m?.t) {
    case "open":
      return typeof m.open === "boolean" ? m : null;
    case "page":
      return PAGES.includes(m.page) ? m : null;
    case "paper":
      return m.paper in PAPERS ? m : null;
    case "begin":
    case "sync-stroke":
      return isStroke(m.stroke) ? m : null;
    case "points":
      return typeof m.id === "string" && isPoints(m.points) ? m : null;
    case "pointer":
      return typeof m.x === "number" && typeof m.y === "number" ? m : null;
    case "sync-begin":
      return PAGES.includes(m.board?.page) &&
        m.board.paper in PAPERS &&
        typeof m.board.open === "boolean" &&
        typeof m.board.rev === "number"
        ? m
        : null;
    case "undo":
      return ROLES.includes(m.by) ? m : null;
    case "clear":
    case "pointer-off":
    case "sync-end":
      return m;
    default:
      return null;
  }
}
