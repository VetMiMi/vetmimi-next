import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  boardReducer,
  initialBoard,
  parseBoardMessage,
  syncMessages,
  type BoardMessage,
  type BoardState,
  type Stroke,
} from "./board.ts";

const run = (messages: BoardMessage[], from = initialBoard) =>
  messages.reduce<BoardState>(boardReducer, from);

const stroke = (id: string): Stroke => ({
  id,
  tool: "pen",
  colour: "blue",
  size: "medium",
  points: [0.1, 0.1],
});

describe("the session whiteboard", () => {
  it("grows a stroke as its points arrive, without counting them as changes", () => {
    const state = run([
      { t: "begin", stroke: stroke("a") },
      { t: "points", id: "a", points: [0.2, 0.2] },
      { t: "points", id: "a", points: [0.3, 0.3] },
    ]);
    assert.deepEqual(
      state.board.strokes[0].points,
      [0.1, 0.1, 0.2, 0.2, 0.3, 0.3],
    );
    assert.equal(state.board.rev, 1);
  });

  it("undoes the last stroke and clears them all", () => {
    const drawn = run([
      { t: "begin", stroke: stroke("a") },
      { t: "begin", stroke: stroke("b") },
      { t: "undo" },
    ]);
    assert.deepEqual(
      drawn.board.strokes.map((s) => s.id),
      ["a"],
    );
    assert.equal(run([{ t: "clear" }], drawn).board.strokes.length, 0);
  });

  it("keeps the drawing with more changes after a reconnect", () => {
    const client = run([
      { t: "open", open: true },
      { t: "begin", stroke: stroke("a") },
      { t: "begin", stroke: stroke("b") },
    ]);
    const reloaded = run([{ t: "open", open: true }]);
    assert.deepEqual(
      run(syncMessages(client.board), reloaded).board,
      client.board,
    );
    assert.deepEqual(
      run(syncMessages(reloaded.board), client).board,
      client.board,
    );
  });

  it("drops messages it does not understand", () => {
    assert.equal(parseBoardMessage("not json"), null);
    assert.equal(parseBoardMessage(JSON.stringify({ t: "explode" })), null);
    assert.equal(
      parseBoardMessage(
        JSON.stringify({
          t: "begin",
          stroke: { ...stroke("a"), colour: "url(x)" },
        }),
      ),
      null,
    );
    assert.deepEqual(parseBoardMessage(JSON.stringify({ t: "undo" })), {
      t: "undo",
    });
  });
});
