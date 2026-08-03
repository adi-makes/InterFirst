import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ActionLink } from "./ActionLink.jsx";
import { Brand } from "./Brand.jsx";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Careers", href: "/careers" },
];

const socialChannels = ["LinkedIn", "GitHub", "X"];

export function SiteFooter() {
  const footerRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || hasEntered) return undefined;

    if (!("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setHasEntered(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -5% 0px",
        threshold: 0.1,
      },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [hasEntered]);

  return (
    <footer
      className={`site-footer ${hasEntered ? "site-footer--entered" : ""}`}
      ref={footerRef}
    >
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <Brand href="/" assemble />

          <nav className="site-footer__navigation" aria-label="Footer">
            <ul>
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <ActionLink
            className="site-footer__cta"
            href="/careers"
          >
            Join Us
          </ActionLink>
        </div>

        <div className="site-footer__bottom">
          <address className="site-footer__legal">
            <span>InterFirst Technologies LLC</span>
            <span>© 2026 InterFirst. All rights reserved.</span>
          </address>

          <ul className="site-footer__socials" aria-label="Social channels">
            {socialChannels.map((channel) => (
              <li key={channel}>
                <span
                  aria-label={`${channel}, destination pending verification`}
                >
                  {channel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
