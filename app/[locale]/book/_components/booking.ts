// Shared types and classes for the booking flow.
import type {
  AppointmentRequestReceipt,
  PublicBookableService,
  PublicBookableServiceList,
} from "@/lib/api/types/booking";
import type { Format, Slot } from "@/lib/api/types/shared";

export type { Slot, Format };

export type BookableService = PublicBookableService;
export type ServiceList = PublicBookableServiceList;
export type Receipt = AppointmentRequestReceipt;

// The quiet text button used for Back and Edit.
export const textButton = "cursor-pointer text-[0.9rem] text-muted";

// Underlined: inside a sentence, its colour alone is too close to the text.
export const inlineLink = "text-label underline underline-offset-2";

// Focus moves to a step's title when the step opens; a title is not a
// control, so it shows no ring.
export const stepTitle =
  "mb-2 text-[clamp(1.6rem,3vw,2.2rem)] text-ink outline-none";

export const stepIntro = "mb-8 text-ink/73";
