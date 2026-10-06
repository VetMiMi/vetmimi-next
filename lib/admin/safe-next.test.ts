import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeNext } from "./safe-next.ts";

describe("safeNext", () => {
  it("keeps admin paths with their query and fragment", () => {
    assert.equal(safeNext("/admin"), "/admin");
    assert.equal(safeNext("/admin/"), "/admin/");
    assert.equal(
      safeNext("/admin/appointments?status=pending#top"),
      "/admin/appointments?status=pending#top",
    );
  });

  it("falls back to /admin for anything missing or not a string", () => {
    for (const value of [undefined, null, "", ["/admin/x"], 42]) {
      assert.equal(safeNext(value), "/admin");
    }
  });

  it("refuses other sites, however they are written", () => {
    for (const value of [
      "//example.com",
      "//example.com/admin",
      "/\\example.com",
      "/\\example.com/admin",
      "\\\\example.com",
      "/\t/example.com/admin",
      "https://example.com/admin",
      "javascript:alert(1)",
      "http:/admin",
    ]) {
      assert.equal(safeNext(value), "/admin", value);
    }
  });

  it("refuses paths outside /admin, encoded or not", () => {
    for (const value of [
      "/",
      "/book",
      "/administrator",
      "/admin@example.com",
      "/admin.example.com",
      "/admin/../book",
      "/admin/%2e%2e/book",
      "/admin%2F..%2Fbook",
      "%2F%2Fexample.com",
      "/%2F%2Fexample.com",
      "/%5Cexample.com",
    ]) {
      assert.equal(safeNext(value), "/admin", value);
    }
  });

  it("keeps an encoded slash inside /admin as a path, never a host", () => {
    assert.equal(
      safeNext("/admin/%2F%2Fexample.com"),
      "/admin/%2F%2Fexample.com",
    );
  });
});
