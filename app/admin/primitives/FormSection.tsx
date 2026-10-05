import { ArrowSquareOut, Plus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/admin/Button";
import { Checkbox } from "@/components/admin/Checkbox";
import { DateField } from "@/components/admin/DateField";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { Textarea } from "@/components/admin/Textarea";
import { TimeRangeField } from "@/components/admin/TimeRangeField";
import { SummaryDemo } from "./SummaryDemo";

const buttonRows = [
  { variant: "primary", label: "Confirm appointment", busy: "Confirming…" },
  { variant: "secondary", label: "Keep it", busy: "Saving…" },
  { variant: "quiet", label: "View upcoming appointments", busy: "Loading…" },
  { variant: "danger", label: "Decline request", busy: "Declining…" },
] as const;

const lengths = [
  { value: "", label: "Choose a length" },
  { value: "50", label: "50 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
];

function Group({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-16 first-of-type:mt-0">
      <h2 id={id} className="mb-6 text-[1.35rem]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function State({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[0.75rem] text-caption">{name}</p>
      {children}
    </div>
  );
}

const card =
  "flex max-w-[660px] flex-col gap-[22px] rounded-card border border-card-border bg-raised p-[clamp(24px,4vw,44px)]";

export function FormSection() {
  return (
    <>
      <Group id="buttons" title="Buttons">
        <div className="flex flex-col gap-6">
          {buttonRows.map((row) => (
            <State
              key={row.variant}
              name={`${row.variant}: default, disabled, busy`}
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button variant={row.variant}>{row.label}</Button>
                <Button variant={row.variant} disabled>
                  {row.label}
                </Button>
                <Button variant={row.variant} busy>
                  {row.busy}
                </Button>
              </div>
            </State>
          ))}
          <State name='size="page", icon, admin link, outside link'>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button size="page" type="submit">
                Save availability
              </Button>
              <Button
                variant="secondary"
                icon={<Plus aria-hidden="true" size={18} />}
              >
                Add weekly hours
              </Button>
              <Button href="/admin/appointments" variant="secondary">
                Open appointments
              </Button>
              <Button
                href="https://vetmimi-next.vercel.app"
                variant="quiet"
                icon={<ArrowSquareOut aria-hidden="true" size={18} />}
              >
                View the public site
              </Button>
            </div>
          </State>
        </div>
      </Group>

      <Group id="fields" title="Form fields">
        <div className={card}>
          <SummaryDemo />

          <State name="Input: required, empty">
            <Input
              label="Notification email"
              name="notify-email"
              type="email"
              autoComplete="off"
              help="New booking requests are sent here."
              required
            />
          </State>
          <State name="Input: optional, filled">
            <Input
              label="Display name"
              name="display-name"
              defaultValue="Daw Mi"
            />
          </State>
          <State name="Input: error">
            <Input
              label="Reply-to email"
              name="reply-email"
              type="email"
              defaultValue="hello@"
              help="Visitors' replies to booking emails come here."
              error="Enter an email address like name@example.com."
              required
            />
          </State>
          <State name="Input: disabled">
            <Input
              label="Time zone"
              name="time-zone"
              defaultValue="Australia/Sydney"
              help="Set for the practice; it cannot be changed here."
              disabled
            />
          </State>

          <State name="Textarea: optional, with help">
            <Textarea
              label="Note to the visitor"
              name="visitor-note"
              help="Sent with the confirmation email."
            />
          </State>
          <State name="Textarea: error">
            <Textarea
              label="Reason for declining"
              name="decline-reason"
              error="Write a short reason so the visitor knows what happens next."
              required
            />
          </State>

          <State name="Select: required, filled">
            <Select
              label="Session length"
              name="length"
              options={lengths}
              defaultValue="60"
              required
            />
          </State>
          <State name="Select: error">
            <Select
              label="Session length"
              name="length-missing"
              options={lengths}
              defaultValue=""
              error="Choose a session length."
              required
            />
          </State>

          <State name="Checkbox: checked, with help">
            <Checkbox
              label="Email the visitor about this change"
              name="notify-visitor"
              help="They get the new date and time and a link to cancel."
              defaultChecked
            />
          </State>
          <State name="Checkbox: required, error">
            <Checkbox
              label="I have checked the date and time"
              name="checked-time"
              error="Tick this box to confirm."
              required
            />
          </State>
          <State name="Checkbox: disabled">
            <Checkbox
              label="Pause public booking"
              name="pause-booking"
              disabled
            />
          </State>

          <State name="DateField: filled, with min and max">
            <DateField
              label="Day off"
              name="day-off"
              value="2026-10-06"
              min="2026-10-05"
              max="2027-04-05"
              help="A date in Sydney time."
              required
            />
          </State>
          <State name="DateField: error">
            <DateField
              label="Day off"
              name="day-off-past"
              value="2026-10-01"
              min="2026-10-05"
              error="Choose today or a later date."
              required
            />
          </State>

          <State name="TimeRangeField: filled">
            <TimeRangeField
              label="Tuesday morning"
              name="tue-am"
              start="10:00"
              end="13:00"
              required
            />
          </State>
          <State name="TimeRangeField: 14:00 to 13:00, checked when you leave a time">
            <TimeRangeField
              label="Tuesday afternoon"
              name="tue-pm"
              start="14:00"
              end="13:00"
              help="Tab into a time and out again to check it."
              required
            />
          </State>
          <State name="TimeRangeField: error from the server">
            <TimeRangeField
              label="Wednesday"
              name="wed"
              start="09:00"
              end="12:00"
              error="These hours overlap Wednesday 11:00 to 15:00."
            />
          </State>
          <State name="TimeRangeField: disabled">
            <TimeRangeField
              label="Saturday"
              name="sat"
              start="10:00"
              end="12:00"
              disabled
            />
          </State>
        </div>
      </Group>
    </>
  );
}
