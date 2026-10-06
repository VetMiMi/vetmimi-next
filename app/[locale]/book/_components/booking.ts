// Shared types and styles for the booking flow.
import type { CSSProperties } from "react";
import type { components } from "@/lib/api/schema";
import { C } from "@/lib/tokens";

type Schemas = components["schemas"];
export type BookableService = Schemas["PublicBookableService"];
export type ServiceList = Schemas["PublicBookableServiceList"];
export type Slot = Schemas["Slot"];
export type Format = Schemas["Format"];
export type Receipt = Schemas["AppointmentRequestReceipt"];

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
