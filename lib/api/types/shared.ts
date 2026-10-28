// Shapes shared by several areas of the API.

export type Locale = "en" | "my";

export type LocalizedText = { en?: string; my?: string };

export type Format = "online" | "in_person";

export type Slot = { startsAt: string; endsAt: string };

export type SlotDay = { date: string; slots: Slot[] };

// One page of a list; `nextCursor` asks for the next.
export type Page<T> = { items: T[]; nextCursor?: string };
