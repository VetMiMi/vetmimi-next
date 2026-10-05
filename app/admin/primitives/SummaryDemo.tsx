"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import {
  ErrorSummary,
  type FieldErrorItem,
} from "@/components/admin/ErrorSummary";

// The fields in error further down this card, as a submit would list them.
const errors: FieldErrorItem[] = [
  {
    name: "reply-email",
    message: "Enter an email address like name@example.com.",
  },
  { name: "decline-reason", message: "Write a short reason for declining." },
  { name: "length-missing", message: "Choose a session length." },
  {
    name: "checked-time",
    message: "Tick the box to confirm the date and time.",
  },
  { name: "day-off-past", message: "Choose today or a later day off." },
  {
    name: "tue-pm-end",
    message: "Tuesday afternoon: end time must be after start time.",
  },
];

// Stands in for a failed submit: each press shows the summary again with a
// new key, so focus moves to it every time, as it would after each submit.
export function SummaryDemo() {
  const [attempt, setAttempt] = useState(0);
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-[0.75rem] text-caption">
        ErrorSummary: after a failed submit
      </p>
      <Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
        Show the error summary
      </Button>
      {attempt > 0 && (
        <div className="w-full">
          <ErrorSummary
            key={attempt}
            title="Six details need checking before this can be saved."
            errors={errors}
          />
        </div>
      )}
    </div>
  );
}
