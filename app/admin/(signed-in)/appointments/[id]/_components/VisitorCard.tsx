import { Card } from "@/components/admin/Card";
import type { components } from "@/lib/api/schema";
import { Facts, cardTitle } from "./Facts";

type Detail = components["schemas"]["AppointmentDetail"];

const link =
  "underline underline-offset-4 transition-colors duration-150 hover:text-indigo motion-reduce:transition-none";

// Contact details live here only, never in the list (Booking UX §28). The
// visitor's note is what they wrote; Daw Mi's own note is in the side panel.
export function VisitorCard({ appointment: a }: { appointment: Detail }) {
  const items: [string, React.ReactNode][] = [
    ["Name", a.visitorName],
    [
      "Email",
      <a key="email" href={`mailto:${a.visitorEmail}`} className={link}>
        {a.visitorEmail}
      </a>,
    ],
  ];
  if (a.visitorPhone)
    items.push([
      "Phone",
      <a
        key="phone"
        href={`tel:${a.visitorPhone.replace(/[^0-9+]/g, "")}`}
        className={link}
      >
        {a.visitorPhone}
      </a>,
    ]);

  return (
    <Card as="section">
      <h2 className={cardTitle}>Visitor</h2>
      <Facts items={items} />
      {a.visitorNote && (
        <figure className="mt-6">
          <figcaption className="mb-2 text-[0.75rem] font-semibold tracking-[0.1em] text-muted uppercase">
            Visitor&apos;s note
          </figcaption>
          <blockquote className="rounded-control border-l-4 border-rose bg-paper px-5 py-4 text-[0.95rem] leading-[1.7] whitespace-pre-line">
            {a.visitorNote}
          </blockquote>
        </figure>
      )}
    </Card>
  );
}
