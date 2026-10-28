"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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
      className={`fixed right-7 bottom-7 z-300 transition-all duration-450 ease-[cubic-bezier(.22,.68,0,1.2)] ${vis ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-[100px] scale-90 opacity-0"}`}
    >
      <Link
        href="/book"
        className="flex items-center gap-2 rounded-[50px] bg-action px-[22px] py-3 font-body text-[0.84rem] font-bold text-white no-underline shadow-[0_8px_28px_rgba(219,95,89,0.38)]"
      >
        ✦ {t("floatingCta")}
      </Link>
    </div>
  );
}
