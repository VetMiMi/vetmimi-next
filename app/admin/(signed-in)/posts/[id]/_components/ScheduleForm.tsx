"use client";

import { useState, useTransition } from "react";
import { CalendarDots } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import type { Outcome } from "@/lib/admin/mutation";
import { PRACTICE_TIMEZONE } from "@/lib/admin/posts";
import { scheduleInstant, scheduleStart } from "@/lib/admin/postWorkflow";
import type { components } from "@/lib/api/schema";
import { zoneLabel } from "@/lib/zonedTime";
import { schedulePost } from "../actions";

type Post = components["schemas"]["Post"];

// When the post goes out, as a date and a time in Sydney whatever the
// browser's own zone (brief §10: times name the zone).
export function ScheduleForm({
  post,
  primary,
  onDone,
}: {
  post: Post;
  primary: boolean;
  onDone: (outcome: Outcome<Post>) => void;
}) {
  const [parts, setParts] = useState(() =>
    scheduleStart(post.scheduledAt, new Date()),
  );
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = scheduleInstant(parts, new Date());
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setError(undefined);
    startTransition(async () => {
      onDone(await schedulePost(post.id, post.version, result.instant));
    });
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-labelledby="schedule-title"
      className="flex w-full flex-col gap-3 rounded-inner bg-paper/70 p-4"
    >
      <p id="schedule-title" className="text-[0.95rem] font-semibold">
        {post.status === "scheduled" ? "Change the time" : "Schedule"}
      </p>
      <div className="flex flex-col gap-3">
        <Input
          label="Date"
          name="schedule.date"
          type="date"
          required
          value={parts.date}
          onChange={(event) => setParts({ ...parts, date: event.target.value })}
          error={error}
        />
        <Input
          label="Time"
          name="schedule.time"
          type="time"
          required
          value={parts.time}
          onChange={(event) => setParts({ ...parts, time: event.target.value })}
        />
      </div>
      <p className="text-[0.82rem] text-muted">
        {zoneLabel(PRACTICE_TIMEZONE)}
      </p>
      <Button
        type="submit"
        variant={primary ? "primary" : "secondary"}
        size={primary ? "page" : "control"}
        className="w-full"
        busy={pending}
        icon={<CalendarDots aria-hidden="true" size={18} />}
      >
        {pending
          ? "Scheduling…"
          : post.status === "scheduled"
            ? "Reschedule"
            : "Schedule post"}
      </Button>
    </form>
  );
}
