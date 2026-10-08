import Image from "next/image";
import { sizeFor, type Media } from "@/lib/admin/media";

// A library image at a web size the API already made, so Next does not
// resize it again (and needs no list of the storage's hosts).
export function MediaThumb({
  media,
  width = 400,
  className = "",
}: {
  media: Media;
  width?: number;
  className?: string;
}) {
  const src = sizeFor(media, width);
  if (!src) return <span className={`shrink-0 bg-paper ${className}`} />;
  return (
    <Image
      src={src}
      alt={media.alt?.en ?? ""}
      width={media.width}
      height={media.height}
      unoptimized
      className={`shrink-0 bg-paper object-cover ${className}`}
    />
  );
}
