import ServiceDetail from "@/components/ServiceDetail";
import { services } from "@/lib/services";

// One route for every service; URLs are unchanged.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ServiceDetail slug={slug} />;
}
