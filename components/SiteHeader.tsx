"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const NAV_LINKS = [
  { key: "about", to: "/about" },
  { key: "services", to: "/services" },
  { key: "artOfWellness", to: "/art-of-wellness" },
  { key: "portfolio", to: "/portfolio" },
  { key: "stories", to: "/stories" },
  { key: "contact", to: "/contact" },
] as const;

// The only interactive part of the layout: scroll border + mobile menu.
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common");
  const isActive = (to: string) =>
    pathname === to || pathname.startsWith(to + "/");

  // Any navigation, including a change of language, closes the menu.
  const [menuPage, setMenuPage] = useState(locale + pathname);
  if (menuPage !== locale + pathname) {
    setMenuPage(locale + pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // UX Flow §2: the open menu takes focus, and Escape gives it back.
  useEffect(() => {
    if (!menuOpen) return;
    panel.current?.querySelector("a")?.focus();
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  // Tab from the last link goes back to the toggle instead of into the
  // page hidden behind the open menu.
  const keepFocusInMenu = (e: ReactKeyboardEvent) => {
    const links = panel.current?.querySelectorAll("a");
    if (e.key !== "Tab" || e.shiftKey || !links?.length) return;
    if (document.activeElement !== links[links.length - 1]) return;
    e.preventDefault();
    toggle.current?.focus();
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: C.canvas,
        borderBottom: scrolled
          ? "1px solid rgba(40,37,45,0.09)"
          : "1px solid transparent",
        transition: "border-color 0.3s",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.45rem",
              fontWeight: 400,
              color: C.ink,
              letterSpacing: "-0.01em",
            }}
          >
            VetMiMi
          </span>
          <span
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: AA.label,
              marginTop: "2px",
            }}
          >
            {t("brand.tagline")}
          </span>
        </Link>

        <nav
          aria-label={t("nav.label")}
          style={{ alignItems: "center", gap: "1.75rem" }}
          className="hidden lg:flex"
        >
          {NAV_LINKS.map(({ key, to }) => (
            <Link
              key={to}
              href={to}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.84rem",
                fontWeight: 500,
                color: isActive(to) ? AA.action : C.ink,
                textDecoration: "none",
                opacity: isActive(to) ? 1 : 0.72,
                transition: "opacity 0.2s, color 0.2s",
              }}
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>

        <div
          style={{ alignItems: "center", gap: "0.75rem" }}
          className="flex lg:hidden"
        >
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="touch-target"
            style={{
              backgroundColor: AA.action,
              color: "#fff",
              fontFamily: "var(--sans)",
              fontWeight: 600,
              fontSize: "0.78rem",
              padding: "8px 16px",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            {t("nav.book")}
          </Link>
          <button
            ref={toggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={t(menuOpen ? "nav.closeMenu" : "nav.openMenu")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              minWidth: 44,
              minHeight: 44,
              color: C.ink,
              lineHeight: 1,
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          ref={panel}
          id="mobile-navigation"
          aria-label={t("nav.label")}
          onKeyDown={keepFocusInMenu}
          style={{
            backgroundColor: C.canvas,
            borderTop: "1px solid rgba(40,37,45,0.07)",
            padding: "1.5rem 1.5rem 2rem",
            maxHeight: "calc(100dvh - 72px)",
            overflowY: "auto",
          }}
          className="lg:hidden"
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NAV_LINKS.map(({ key, to }) => (
              <Link
                key={to}
                href={to}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: isActive(to) ? AA.action : C.ink,
                  textDecoration: "none",
                  padding: "0.85rem 0",
                  borderBottom: "1px solid rgba(40,37,45,0.06)",
                }}
              >
                {t(`nav.${key}`)}
              </Link>
            ))}
            <div style={{ padding: "1rem 0 0" }}>
              <LanguageSwitcher />
            </div>
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              style={{
                marginTop: "1.25rem",
                backgroundColor: AA.action,
                color: "#fff",
                fontFamily: "var(--sans)",
                fontWeight: 600,
                fontSize: "0.95rem",
                padding: "13px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                textAlign: "center",
                display: "block",
              }}
            >
              {t("nav.bookAppointment")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
