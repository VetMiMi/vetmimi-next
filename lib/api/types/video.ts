import type { Locale } from "./shared.ts";
import type { PublicServiceRef } from "./booking.ts";

export type PublicSessionState = {
  state: "too_early" | "ready" | "expired" | "ended";
  opensAt: string;
  closesAt: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  service: PublicServiceRef;
  locale: Locale;
};

type IceServer = {
  urls: string[];
  username?: string;
  credential?: string;
};

// A five-minute ticket to open the room's WebSocket (ADR-007).
export type RoomTicket = {
  roomId: string;
  role: "client" | "practitioner";
  ticket: string;
  ticketExpiresAt: string;
  websocketUrl: string;
  iceServers: IceServer[];
};
