import type { components } from "@/lib/api/schema";

type Service = components["schemas"]["Service"];

export const bookingActions: Record<Service["bookingAction"], string> = {
  book: "Book",
  request: "Request",
  enquiry_only: "Enquiry only",
  not_bookable: "Not bookable online",
};

export const formatNames: Record<Service["formats"][number], string> = {
  online: "Online",
  in_person: "In person",
};

export const serviceName = (service: Pick<Service, "name" | "slug">) =>
  service.name.en ?? service.slug;
