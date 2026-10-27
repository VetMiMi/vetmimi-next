// Shown beside the calendar until a date is chosen.
export function DayHint() {
  return (
    <section className="self-start rounded-inner border border-divider bg-white p-5 text-[0.92rem] text-muted">
      <h3 className="mb-2 text-[1.05rem] text-ink">Change a day</h3>
      <p>
        Choose a date to set your hours, for that date or that weekday every
        week, or to take it off. To change several at once, use Select days, or
        hold Shift or Ctrl (⌘ on a Mac) while you click.
      </p>
    </section>
  );
}
