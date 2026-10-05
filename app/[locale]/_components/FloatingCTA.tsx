"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AA } from "@/lib/tokens";

/** Book button that slides in once the visitor scrolls past the hero. */
export function FloatingCTA() {
  const [vis, setVis] = useState(false);
  const t = useTranslations("home");
  useEffect(() => {
    const fn = () => setVis(window.scrollY > 600);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.75rem",
        right: "1.75rem",
        zIndex: 300,
        transform: vis
          ? "translateY(0) scale(1)"
          : "translateY(100px) scale(0.9)",
        opacity: vis ? 1 : 0,
        transition: "all 0.45s cubic-bezier(.22,.68,0,1.2)",
        pointerEvents: vis ? "auto" : "none",
      }}
    >
      <Link
        href="/book"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          backgroundColor: AA.action,
          color: "#fff",
          fontFamily: "var(--sans)",
          fontWeight: 700,
          fontSize: "0.84rem",
          padding: "12px 22px",
          borderRadius: "50px",
          textDecoration: "none",
          boxShadow: "0 8px 28px rgba(219,95,89,0.38)",
        }}
      >
        ✦ {t("floatingCta")}
      </Link>
    </div>
  );
}
