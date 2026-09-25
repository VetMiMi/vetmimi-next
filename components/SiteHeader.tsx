"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { C } from "@/lib/tokens";

const NAV_LINKS = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Art of Wellness", to: "/art-of-wellness" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Stories & Insights", to: "/stories" },
  { label: "Contact", to: "/contact" },
];

// The only interactive part of the layout: scroll border + mobile menu.
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
  <header style={{
    position: "sticky", top: 0, zIndex: 100,
    backgroundColor: C.canvas,
    borderBottom: scrolled ? "1px solid rgba(40,37,45,0.09)" : "1px solid transparent",
    transition: "border-color 0.3s",
  }}>
    <div style={{
      maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: "72px",
    }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", fontWeight: 400, color: C.ink, letterSpacing: "-0.01em" }}>VetMiMi</span>
        <span style={{ fontFamily: "var(--sans)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.rose, marginTop: "2px" }}>Daw Mi · Art Therapist</span>
      </Link>

      <nav aria-label="Main navigation" style={{ alignItems: "center", gap: "1.75rem" }} className="hidden lg:flex">
        {NAV_LINKS.map(({ label, to }) => (
          <Link
  key={to}
  href={to}
  onClick={() => setMenuOpen(false)}
  style={{
            fontFamily: "var(--sans)", fontSize: "0.84rem", fontWeight: 500,
            color: (pathname === to || pathname.startsWith(to + "/")) ? C.coral : C.ink,
            textDecoration: "none",
            opacity: (pathname === to || pathname.startsWith(to + "/")) ? 1 : 0.72,
            transition: "opacity 0.2s, color 0.2s",
          }}>{label}</Link>
          
        ))}
      </nav>

      <div style={{ alignItems: "center", gap: "0.75rem" }} className="flex lg:hidden">
        <Link
  href="/book"
  onClick={() => setMenuOpen(false)}
  style={{
          backgroundColor: C.coral, color: "#fff",
          fontFamily: "var(--sans)", fontWeight: 600, fontSize: "0.78rem",
          padding: "8px 16px", borderRadius: "6px", textDecoration: "none",
        }}>Book</Link>
        <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close menu" : "Open menu"}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", minWidth: 44, minHeight: 44, color: C.ink, lineHeight: 1 }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </div>

    {menuOpen && (
      <div id="mobile-navigation" style={{ backgroundColor: C.canvas, borderTop: "1px solid rgba(40,37,45,0.07)", padding: "1.5rem 1.5rem 2rem", maxHeight: "calc(100dvh - 72px)", overflowY: "auto" }} className="lg:hidden">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link
  key={to}
  href={to}
  onClick={() => setMenuOpen(false)}
  style={{
              fontFamily: "var(--sans)", fontSize: "1rem", fontWeight: 500,
              color: (pathname === to || pathname.startsWith(to + "/")) ? C.coral : C.ink,
              textDecoration: "none",
              padding: "0.85rem 0",
              borderBottom: "1px solid rgba(40,37,45,0.06)",
            }}>{label}</Link>
          ))}
          <Link
  href="/book"
  onClick={() => setMenuOpen(false)}
  style={{
            marginTop: "1.25rem",
            backgroundColor: C.coral, color: "#fff",
            fontFamily: "var(--sans)", fontWeight: 600, fontSize: "0.95rem",
            padding: "13px 24px", borderRadius: "8px", textDecoration: "none",
            textAlign: "center", display: "block",
          }}>Book Appointment</Link>
        </div>
      </div>
    )}
  </header>
  );
}
