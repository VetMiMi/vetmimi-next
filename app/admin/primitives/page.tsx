import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DataSection } from "./DataSection";
import { FeedbackSection } from "./FeedbackSection";
import { FormSection } from "./FormSection";

export const metadata: Metadata = { title: "Primitives" };

// Every admin primitive in every state, for checking by eye, keyboard and
// screen reader while building. Daw Mi never needs it, so production 404s.
// Each primitives issue adds its own section file beside FormSection.
export default function PrimitivesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-48px))] py-[clamp(44px,6vw,80px)] max-md:w-[calc(100%-40px)]">
      <p className="mb-3 text-[0.7rem] font-bold tracking-[0.12em] text-label uppercase">
        Development only
      </p>
      <h1 className="mb-4 text-[clamp(1.6rem,3vw,2.2rem)]">Admin primitives</h1>
      <p className="mb-12 max-w-[56ch] text-[0.95rem] text-muted">
        Every admin component in every state. Hover, tab through and leave
        fields to see the rest; narrow the window below 768px for the stacked
        cards. In production this address is a 404.
      </p>
      <FormSection />
      <FeedbackSection />
      <DataSection />
    </main>
  );
}
