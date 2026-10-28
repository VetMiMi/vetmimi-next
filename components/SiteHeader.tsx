"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
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
      className={`sticky top-0 z-100 border-b bg-canvas transition-[border-color] duration-300 ease-[ease] ${scrolled ? "border-ink/9" : "border-transparent"}`}
    >
      <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between px-6">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-[1.45rem] font-normal tracking-[-0.01em] text-ink">
            VetMiMi
          </span>
          <span className="mt-0.5 text-[0.6rem] tracking-[0.12em] text-label uppercase">
            {t("brand.tagline")}
          </span>
        </Link>

        <nav
          aria-label={t("nav.label")}
          className="hidden items-center gap-7 lg:flex"
        >
          {NAV_LINKS.map(({ key, to }) => (
            <Link
              key={to}
              href={to}
              onClick={() => setMenuOpen(false)}
              className={`text-[0.84rem] font-medium transition-[opacity,color] duration-200 ease-[ease] ${isActive(to) ? "text-action" : "text-ink opacity-72"}`}
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="touch-target rounded-md bg-action px-4 py-2 text-[0.78rem] font-semibold text-white"
          >
            {t("nav.book")}
          </Link>
          <button
            ref={toggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={t(menuOpen ? "nav.closeMenu" : "nav.openMenu")}
            className="min-h-11 min-w-11 cursor-pointer p-1.5 leading-none text-ink"
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
          className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-ink/7 bg-canvas px-6 pt-6 pb-8 lg:hidden"
        >
          <div className="flex flex-col">
            {NAV_LINKS.map(({ key, to }) => (
              <Link
                key={to}
                href={to}
                onClick={() => setMenuOpen(false)}
                className={`border-b border-ink/6 py-[0.85rem] text-[1rem] font-medium ${isActive(to) ? "text-action" : "text-ink"}`}
              >
                {t(`nav.${key}`)}
              </Link>
            ))}
            <div className="pt-4">
              <LanguageSwitcher />
            </div>
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="mt-5 block rounded-lg bg-action px-6 py-[13px] text-center text-[0.95rem] font-semibold text-white"
            >
              {t("nav.bookAppointment")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
