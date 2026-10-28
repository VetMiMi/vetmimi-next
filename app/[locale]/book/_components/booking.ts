// Shared types and styles for the booking flow.
import type { CSSProperties } from "react";
import type {
  AppointmentRequestReceipt,
  PublicBookableService,
  PublicBookableServiceList,
} from "@/lib/api/types/booking";
import type { Format, Slot } from "@/lib/api/types/shared";
import { C } from "@/lib/tokens";

export type { Slot, Format };

export type BookableService = PublicBookableService;
export type ServiceList = PublicBookableServiceList;
export type Receipt = AppointmentRequestReceipt;

// The quiet text button used for Back and Edit.
export const textButton: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  color: `${C.ink}88`,
  fontSize: "0.9rem",
  padding: 0,
};

export const stepTitle: CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "clamp(1.6rem,3vw,2.2rem)",
  color: C.ink,
  marginBottom: "0.5rem",
};

export const stepIntro: CSSProperties = {
  fontFamily: "var(--sans)",
  color: `${C.ink}BB`,
  marginBottom: "2rem",
};
