import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError, unwrap } from "./problem.ts";

const problem = (status: number, body: object, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), { status, headers });

describe("ApiError.fromResponse", () => {
  it("keeps the code and field errors, never the detail", () => {
    const error = ApiError.fromResponse(problem(422, {}), {
      type: "urn:vetmimi:problem:invalid_request",
      title: "Invalid request",
      status: 422,
      code: "invalid_request",
      detail: "secret internals",
      errors: [{ field: "/email", message: "must be an email" }],
    });
    assert.equal(error.status, 422);
    assert.equal(error.code, "invalid_request");
    assert.deepEqual(error.fieldErrors, { "/email": "must be an email" });
    assert.ok(!error.message.includes("secret"));
  });

  it("reads Retry-After in seconds and ignores anything else", () => {
    const limited = (value: string) =>
      ApiError.fromResponse(problem(429, {}, { "Retry-After": value }), {
        code: "rate_limited",
      }).retryAfterSeconds;
    assert.equal(limited("120"), 120);
    assert.equal(limited("Wed, 21 Oct 2026 07:28:00 GMT"), undefined);
    assert.equal(limited("-5"), undefined);
  });

  it("names a body that is not a Problem by its status", () => {
    const html = new Response("<html>Bad gateway</html>", { status: 502 });
    assert.equal(ApiError.fromResponse(html, "<html>").code, "unavailable");
    const teapot = new Response("", { status: 418 });
    assert.equal(ApiError.fromResponse(teapot, "").code, "unknown");
  });
});

describe("unwrap", () => {
  it("returns the data of a success, including an empty 204", () => {
    const ok = new Response("{}", { status: 200 });
    assert.deepEqual(unwrap({ data: { status: "ok" }, response: ok }), {
      status: "ok",
    });
    const empty = new Response(null, { status: 204 });
    assert.equal(unwrap({ data: undefined, response: empty }), undefined);
  });

  it("throws the ApiError of a failure", () => {
    const response = problem(401, {});
    assert.throws(
      () => unwrap({ error: { code: "unauthenticated" }, response }),
      (error) =>
        error instanceof ApiError &&
        error.status === 401 &&
        error.code === "unauthenticated",
    );
  });
});
