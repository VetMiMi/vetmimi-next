import { RadioCards } from "@/components/admin/RadioCards";

// New hours apply to the chosen dates only, or to their weekdays every week.
export function RepeatChoice({
  only,
  every,
  everyWeek,
  onChange,
}: {
  only: string;
  every: string;
  everyWeek: boolean;
  onChange: (everyWeek: boolean) => void;
}) {
  return (
    <RadioCards
      label="Which days"
      name="repeat"
      value={everyWeek ? "every" : "once"}
      onChange={(value) => onChange(value === "every")}
      options={[
        {
          value: "once",
          label: only,
          help: "The rest of your week stays as it is.",
        },
        {
          value: "every",
          label: every[0].toUpperCase() + every.slice(1),
          help: "Your hours each week from now on. Dates you changed one by one keep their own hours.",
        },
      ]}
    />
  );
}
