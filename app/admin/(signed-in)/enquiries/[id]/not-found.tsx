import { EmptyState } from "@/components/admin/EmptyState";

export default function EnquiryNotFound() {
  return (
    <>
      <h1 className="mb-[clamp(28px,4vw,40px)] text-[clamp(1.6rem,3vw,2.2rem)]">
        Enquiry not found
      </h1>
      <EmptyState
        title="This enquiry does not exist or was removed."
        action={{ label: "Back to enquiries", href: "/admin/enquiries" }}
      />
    </>
  );
}
