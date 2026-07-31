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
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`site-header ${isScrolled ? "site-header--scrolled" : ""} ${
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
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          ref={menuButtonRef}
          type="button"
        >
          <span>Menu</span>
          {menuOpen ? (
            <X aria-hidden="true" size={21} weight="regular" />
          ) : (
            <List aria-hidden="true" size={21} weight="regular" />
          )}
        </button>
      </div>

      {menuOpen ? (
        <nav className="mobile-navigation" id="mobile-navigation" aria-label="Mobile">
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
