import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionLink } from "./ActionLink.jsx";
import { Brand } from "./Brand.jsx";

const navigation = [
  ["Principles", "/#how-we-think"],
  ["Building", "/#how-we-build"],
];

export function SiteHeader({ isReady = true }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mobileNavigationRef = useRef(null);
  const firstMobileLinkRef = useRef(null);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 16);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    firstMobileLinkRef.current?.focus();
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const backgroundRegions = [...document.querySelectorAll("main, footer")].map((region) => ({
      region,
      wasInert: region.hasAttribute("inert"),
    }));
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    backgroundRegions.forEach(({ region }) => region.setAttribute("inert", ""));

    const handleMenuKeydown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;
      const navigationLinks = [...(mobileNavigationRef.current?.querySelectorAll("a[href]") || [])];
      const focusableElements = [menuButtonRef.current, ...navigationLinks].filter(Boolean);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    window.addEventListener("keydown", handleMenuKeydown);
    return () => {
      window.removeEventListener("keydown", handleMenuKeydown);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      backgroundRegions.forEach(({ region, wasInert }) => {
        if (!wasInert) region.removeAttribute("inert");
      });
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 961px)");
    const closeOnDesktop = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    desktopQuery.addEventListener?.("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener?.("change", closeOnDesktop);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`site-header ${isScrolled ? "site-header--scrolled" : ""} ${menuOpen ? "site-header--menu-open" : ""} ${
        isReady ? "site-header--intro-ready" : "site-header--intro-pending"
      }`}
      data-intro-ready={isReady}
    >
      <div className="site-header__inner">
        <Brand animation="loop" assemble />

        <nav className="desktop-navigation" aria-label="Primary">
          {navigation.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>

        <ActionLink
          ariaCurrent={pathname === "/careers" ? "page" : undefined}
          className="site-header__cta"
          href="/careers"
          variant="primary"
        >
          View Careers
        </ActionLink>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          ref={menuButtonRef}
          type="button"
        >
          <span aria-hidden="true" className="menu-button__icon">
            <span />
            <span />
          </span>
        </button>
      </div>

      <nav
        aria-hidden={!menuOpen}
        aria-label="Mobile"
        className="mobile-navigation"
        data-open={menuOpen}
        id="mobile-navigation"
        inert={!menuOpen}
        ref={mobileNavigationRef}
      >
        <div className="mobile-navigation__inner">
          {navigation.map(([label, href], index) => (
            <Link
              href={href}
              key={href}
              onClick={closeMenu}
              ref={index === 0 ? firstMobileLinkRef : undefined}
            >
              {label}
            </Link>
          ))}
          <ActionLink
            ariaCurrent={pathname === "/careers" ? "page" : undefined}
            href="/careers"
            onClick={closeMenu}
          >
            View Careers
          </ActionLink>
        </div>
      </nav>
    </header>
  );
}
