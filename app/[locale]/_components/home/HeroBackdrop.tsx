import Image from "next/image";
import { GoldMark, AlmondEye } from "@/components/art/Shapes";
import art7 from "@/assets/image-7.webp";

// A fragment, so each layer stays a direct child of the hero section it
// fills and positions against.
export function HeroBackdrop() {
  return (
    <>
      <Image
        src={art7}
        alt=""
        fill
        preload
        fetchPriority="high"
        quality={60}
        sizes="100vw"
        placeholder="blur"
        className="pointer-events-none object-cover object-[center_28%]"
        aria-hidden
      />
      {/* Dark gradient overlay — heavy left, fades right */}
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(18,14,26,0.95)_0%,rgba(18,14,26,0.88)_42%,rgba(18,14,26,0.35)_100%)]" />

      {/* Abstract gestures */}
      <div className="pointer-events-none absolute top-[14%] right-[12%] z-1 opacity-60">
        <GoldMark size={56} />
      </div>
      <div className="pointer-events-none absolute right-[28%] bottom-[18%] z-1 opacity-40">
        <GoldMark size={36} />
      </div>
      <div className="pointer-events-none absolute top-[22%] left-[48%] z-1 opacity-35">
        <AlmondEye color="var(--ochre)" size={80} />
      </div>
    </>
  );
}
