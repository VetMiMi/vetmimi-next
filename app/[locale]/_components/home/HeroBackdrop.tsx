import Image from "next/image";
import { GoldMark, AlmondEye } from "@/components/art/Shapes";
import { C } from "@/lib/tokens";
import art7 from "@/assets/image-7.webp";

// A fragment, so each layer stays a direct child of the hero section it
// fills and positions against.
export function HeroBackdrop() {
  return (
    <>
      {/* art7 full-bleed background */}
      <Image
        src={art7}
        alt=""
        fill
        preload
        fetchPriority="high"
        quality={60}
        sizes="100vw"
        placeholder="blur"
        style={{
          objectFit: "cover",
          objectPosition: "center 28%",
          pointerEvents: "none",
        }}
        aria-hidden
      />
      {/* Dark gradient overlay — heavy left, fades right */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(18,14,26,0.95) 0%, rgba(18,14,26,0.88) 42%, rgba(18,14,26,0.35) 100%)",
        }}
      />

      {/* Abstract gestures */}
      <GoldMark
        size={56}
        style={{
          position: "absolute",
          top: "14%",
          right: "12%",
          zIndex: 1,
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />
      <GoldMark
        size={36}
        style={{
          position: "absolute",
          bottom: "18%",
          right: "28%",
          zIndex: 1,
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />
      <AlmondEye
        color={C.ochre}
        size={80}
        style={{
          position: "absolute",
          top: "22%",
          left: "48%",
          zIndex: 1,
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
