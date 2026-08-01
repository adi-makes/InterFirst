import { useEffect, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { ActionLink } from "./ActionLink.jsx";
import { Brand } from "./Brand.jsx";

const navigation = [
  ["Home", "/"],
  ["Careers", "/careers"],
];

export function SiteHeader({ isReady = true }) {
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
          className="site-header__cta"
          href="/careers"
          showArrow
          variant="primary"
        >
          Join Us
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
          {menuOpen ? (
            <X aria-hidden="true" size={24} weight="regular" />
          ) : (
            <List aria-hidden="true" size={24} weight="regular" />
          )}
        </button>
      </div>

      {menuOpen ? (
        <nav className="mobile-navigation" id="mobile-navigation" aria-label="Mobile" ref={mobileNavigationRef}>
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
            <ActionLink href="/careers" onClick={closeMenu} showArrow>
              Join Us
            </ActionLink>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
