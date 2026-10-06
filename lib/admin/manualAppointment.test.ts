import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkAll,
  emptyFields,
  keyAfterEdit,
  keyAfterFailure,
  manualPayload,
  type KeyState,
} from "./manualAppointment.ts";

const SLOT = {
  startsAt: "2026-10-04T23:00:00Z",
  endsAt: "2026-10-05T00:00:00Z",
};
const fields = {
  ...emptyFields,
  serviceId: "6f1c2a7e-3b4d-4c5e-8f90-1a2b3c4d5e6f",
  format: "online",
  name: " Sample Visitor ",
  email: "visitor@example.com",
};

describe("manual appointment payload", () => {
  it("sends the slot's instant unchanged with the defaults", () => {
    assert.deepEqual(manualPayload(fields, SLOT), {
      serviceId: fields.serviceId,
      startsAt: "2026-10-04T23:00:00Z",
      format: "online",
      locale: "en",
      visitor: { name: "Sample Visitor", email: "visitor@example.com" },
      status: "confirmed",
      notifyVisitor: true,
    });
  });

  it("keeps optional details only when given", () => {
    const body = manualPayload(
      { ...fields, phone: "0400 000 000", status: "pending", adminNote: "x" },
      SLOT,
    );
    assert.equal(body.visitor.phone, "0400 000 000");
    assert.equal(body.status, "pending");
    assert.equal(body.adminNote, "x");
  });
});

describe("manual appointment checks", () => {
  it("names every missing required answer in form order", () => {
    assert.deepEqual(Object.keys(checkAll(emptyFields, null)), [
      "serviceId",
      "format",
      "slot",
      "name",
      "email",
    ]);
  });

  it("refuses a malformed phone and a long note", () => {
    const errors = checkAll(
      { ...fields, phone: "call me", note: "x".repeat(501) },
      SLOT,
    );
    assert.deepEqual(Object.keys(errors), ["phone", "note"]);
  });
});

describe("idempotency key", () => {
  let n = 0;
  const newKey = () => `key-${++n}`;
  const start: KeyState = { key: "key-0", answered: false };

  it("keeps the key for a retry after 503 and after an edit", () => {
    const after503 = keyAfterFailure(start, 503);
    assert.equal(after503.key, "key-0");
    assert.equal(keyAfterEdit(after503, newKey).key, "key-0");
  });

  it("replaces the key on the edit after a 409", () => {
    const after409 = keyAfterFailure(start, 409);
    assert.equal(after409.key, "key-0");
    const edited = keyAfterEdit(after409, newKey);
    assert.notEqual(edited.key, "key-0");
    assert.equal(edited.answered, false);
  });
});
