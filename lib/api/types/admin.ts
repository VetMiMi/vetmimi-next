import type { LocalizedText } from "./shared.ts";
import type { BookingMode } from "./booking.ts";

export type Role = "content_editor" | "booking_admin" | "site_admin";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  roles: Role[];
  isPractitioner: boolean;
  twoStepEnabled: boolean;
};

export type SessionCreated = {
  token: string;
  expiresAt: string;
  user: CurrentUser;
};

export type SettingsPatch = {
  timezone?: string;
  bookingMode?: BookingMode;
  publicBookingEnabled?: boolean;
  pendingHoldHours?: number;
  reminderHours?: number;
  minNoticeHours?: number;
  maxAdvanceDays?: number;
  slotStepMinutes?: number;
  cancellationNoticeHours?: number;
  lateCancellationFeePercent?: number;
  lateCancellationFirstWaived?: boolean;
  noShowFeePercent?: number;
  meetingLinkMode?: "vetmimi_room" | "manual_link";
  paymentMethods?: ("bank_transfer" | "card")[];
  invoiceTiming?: "after_session";
  retentionMonths?: number;
  contactEmail?: string;
  responseTime?: LocalizedText;
};

export type Settings = SettingsPatch & {
  timezone: string;
  retentionMonths: number;
  contactEmail: string;
  responseTime: LocalizedText;
  updatedAt?: string;
};

type MetaPage = { id: string; name: string; instagramUsername?: string };

export type MetaConnection = {
  status: "not_connected" | "choosing_page" | "connected";
  pageId?: string;
  pageName?: string;
  instagramId?: string;
  instagramUsername?: string;
  expiresAt?: string;
  lastError?: string;
  connectedAt?: string;
  pages?: MetaPage[];
};

export type LinkedInConnection = {
  status:
    "not_connected" | "connected" | "expiring_soon" | "reconnect_required";
  memberName?: string;
  expiresAt?: string;
  connectedAt?: string;
};

// Where the browser goes to sign in to Facebook or LinkedIn.
export type Authorization = { authorizeUrl: string };
