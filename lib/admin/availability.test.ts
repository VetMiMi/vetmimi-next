import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alreadyOff,
  calendarDays,
  clearPlan,
  consecutiveRuns,
  hoursErrors,
  noTimesReason,
  rulesFromWeek,
  shortHours,
  weekFromRules,
  weekdaysOf,
  withWeekdays,
  type Week,
} from "./availability.ts";

const SYDNEY = "Australia/Sydney";
const nine = { start: "09:00", end: "12:00" };
const two = { start: "14:00", end: "17:00" };

// Sydney is UTC+11 in November 2026.
const block = (
  id: string,
  startsAt: string,
  endsAt: string,
  allDay = true,
) => ({
  id,
  startsAt,
  endsAt,
  allDay,
  createdAt: "2026-10-01T00:00:00Z",
});
const override = (
  id: string,
  onDate: string,
  kind: "open" | "replace",
  startsAt: string,
  endsAt: string,
) => ({
  id,
  onDate,
  kind,
  startsAt,
  endsAt,
  createdAt: "2026-10-01T00:00:00Z",
});

describe("the week", () => {
  it("reads the API's rules into days, sorted, and back", () => {
    const rules = [
      { weekday: 1, startTime: "14:00", endTime: "17:00" },
      { weekday: 1, startTime: "09:00", endTime: "12:00" },
      { weekday: 7, startTime: "09:00", endTime: "12:00" },
    ];
    const week = weekFromRules(rules);
    assert.deepEqual(week[0], [nine, two]);
    assert.deepEqual(week[6], [nine]);
    assert.deepEqual(week[3], []);
    assert.deepEqual(rulesFromWeek(week), [
      { weekday: 1, startTime: "09:00", endTime: "12:00" },
      { weekday: 1, startTime: "14:00", endTime: "17:00" },
      { weekday: 7, startTime: "09:00", endTime: "12:00" },
    ]);
  });

  it("finds the weekdays of chosen dates, Monday first", () => {
    // Mon 2, Wed 4 and Sun 8 November 2026, and Mon 9 again.
    assert.deepEqual(
      weekdaysOf(["2026-11-08", "2026-11-04", "2026-11-02", "2026-11-09"]),
      [0, 2, 6],
    );
  });

  it("sets chosen weekdays every week and leaves the rest", () => {
    const week = [[nine], [two], [], [], [], [], []];
    const changed = withWeekdays(week, [0, 2], [nine, two]);
    assert.deepEqual(changed, [
      [nine, two],
      [two],
      [nine, two],
      [],
      [],
      [],
      [],
    ]);
    assert.notEqual(changed[2][0], nine, "copies, so later edits stay apart");
    assert.deepEqual(withWeekdays(week, [1], [])[1], [], "no hours stops it");
  });
});

describe("hours in a calendar cell", () => {
  it("drops whole-hour minutes and spaces", () => {
    assert.equal(shortHours({ start: "09:00", end: "12:30" }), "9am–12:30pm");
  });
});

describe("checking a day's hours", () => {
  it("accepts separate and touching ranges", () => {
    assert.deepEqual(hoursErrors([nine, { start: "12:00", end: "13:00" }]), [
      undefined,
      undefined,
    ]);
  });

  it("names the range a later one overlaps", () => {
    assert.deepEqual(hoursErrors([nine, { start: "11:00", end: "15:00" }]), [
      undefined,
      "This overlaps 9:00 am–12:00 pm.",
    ]);
  });

  it("asks for both times and an end after the start", () => {
    assert.deepEqual(
      hoursErrors([
        { start: "", end: "12:00" },
        { start: "15:00", end: "14:00" },
      ]),
      ["Enter a start and an end time.", "End time must be after start time."],
    );
  });
});

describe("consecutive dates", () => {
  it("merges runs across a month end and keeps gaps apart", () => {
    assert.deepEqual(
      consecutiveRuns([
        "2026-11-02",
        "2026-10-31",
        "2026-11-01",
        "2026-11-05",
        "2026-11-01",
      ]),
      [
        { first: "2026-10-31", last: "2026-11-02" },
        { first: "2026-11-05", last: "2026-11-05" },
      ],
    );
  });
});

describe("calendar days", () => {
  const week: Week = [[nine], [], [], [], [], [], []];
  const days = calendarDays("2026-11", {
    timeZone: SYDNEY,
    today: "2026-11-03",
    week,
    overrides: [
      // Tue 10 Nov 10:00–12:00 instead of closed.
      override(
        "o1",
        "2026-11-10",
        "replace",
        "2026-11-09T23:00:00Z",
        "2026-11-10T01:00:00Z",
      ),
    ],
    blocks: [
      // Mon 16 – Tue 17 Nov, whole days.
      block("b1", "2026-11-15T13:00:00Z", "2026-11-17T13:00:00Z"),
      // Mon 23 Nov 13:00–17:00.
      block("b2", "2026-11-23T02:00:00Z", "2026-11-23T06:00:00Z", false),
    ],
    appointments: [
      {
        id: "a1",
        status: "confirmed",
        startsAt: "2026-11-15T23:00:00Z",
      },
      {
        id: "a2",
        status: "cancelled_by_client",
        startsAt: "2026-11-15T23:30:00Z",
      },
    ] as never,
  });
  const day = (date: string) => days.find((d) => d.date === date)!;

  it("has every date of the month and greys the past", () => {
    assert.equal(days.length, 30);
    assert.equal(day("2026-11-02").past, true);
    assert.equal(day("2026-11-03").past, false);
  });

  it("shows weekly hours, closed days and changed hours", () => {
    assert.equal(day("2026-11-09").state, "open");
    assert.deepEqual(day("2026-11-09").hours, [nine]);
    assert.equal(day("2026-11-11").state, "closed");
    assert.equal(day("2026-11-10").state, "changed");
    assert.deepEqual(day("2026-11-10").hours, [
      { start: "10:00", end: "12:00" },
    ]);
  });

  it("marks whole days off, part days off and counts live appointments", () => {
    assert.equal(day("2026-11-16").state, "off");
    assert.equal(day("2026-11-17").state, "off");
    assert.equal(day("2026-11-18").state, "closed");
    assert.equal(day("2026-11-23").state, "open");
    assert.deepEqual(day("2026-11-23").offHours, [
      { start: "13:00", end: "17:00" },
    ]);
    assert.deepEqual(
      day("2026-11-16").appointments.map((a) => a.id),
      ["a1"],
    );
  });
});

describe("back to normal hours", () => {
  const blocks = [
    // Mon 16 – Fri 20 Nov.
    block("week", "2026-11-15T13:00:00Z", "2026-11-20T13:00:00Z"),
    // Wed 25 Nov afternoon.
    block("part", "2026-11-25T02:00:00Z", "2026-11-25T06:00:00Z", false),
  ];
  const overrides = [
    override(
      "o1",
      "2026-11-18",
      "open",
      "2026-11-17T23:00:00Z",
      "2026-11-18T01:00:00Z",
    ),
    override(
      "o2",
      "2026-11-26",
      "open",
      "2026-11-25T23:00:00Z",
      "2026-11-26T01:00:00Z",
    ),
  ];

  it("splits a longer day off around the chosen date", () => {
    const plan = clearPlan(["2026-11-18"], overrides, blocks, SYDNEY);
    assert.deepEqual(plan.deleteOverrides, ["o1"]);
    assert.deepEqual(plan.deleteBlocks, ["week"]);
    assert.deepEqual(plan.reblock, [
      { first: "2026-11-16", last: "2026-11-17", reason: undefined },
      { first: "2026-11-19", last: "2026-11-20", reason: undefined },
    ]);
  });

  it("deletes a part-day block and leaves untouched dates alone", () => {
    const plan = clearPlan(["2026-11-25"], overrides, blocks, SYDNEY);
    assert.deepEqual(plan, {
      deleteOverrides: [],
      deleteBlocks: ["part"],
      reblock: [],
    });
  });

  it("knows which dates are already off", () => {
    assert.deepEqual(
      alreadyOff(["2026-11-15", "2026-11-16", "2026-11-25"], blocks, SYDNEY),
      ["2026-11-16"],
    );
  });
});

describe("why there are no times", () => {
  const base = {
    date: "2026-11-10",
    today: "2026-11-03",
    settings: {
      publicBookingEnabled: true,
      maxAdvanceDays: 60,
      minNoticeHours: 24,
    },
    servicePaused: false,
  };

  it("puts booking switched off first", () => {
    assert.match(
      noTimesReason({
        ...base,
        settings: { ...base.settings, publicBookingEnabled: false },
      }),
      /switched off/,
    );
  });

  it("names a day off, a closed day and the booking window", () => {
    assert.match(noTimesReason({ ...base, day: { state: "off" } }), /day off/);
    assert.match(
      noTimesReason({ ...base, day: { state: "closed" } }),
      /not working/,
    );
    assert.match(
      noTimesReason({ ...base, date: "2027-02-01" }),
      /60 days ahead/,
    );
    assert.match(
      noTimesReason({ ...base, date: "2026-11-04" }),
      /24 hours' notice/,
    );
  });
});
