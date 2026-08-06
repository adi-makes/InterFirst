import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ActionLink } from "./ActionLink.jsx";
import { Brand } from "./Brand.jsx";

export function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 16);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header
      className={`site-header ${isScrolled ? "site-header--scrolled" : ""}`}
    >
      <div className="site-header__inner">
        <Brand />

        <ActionLink
          ariaCurrent={pathname === "/careers" ? "page" : undefined}
          className="site-header__cta"
          href="/careers"
          variant="primary"
        >
          View Careers
        </ActionLink>

        <ActionLink
          ariaCurrent={pathname === "/careers" ? "page" : undefined}
          className="site-header__mobile-careers"
          href="/careers"
          variant="primary"
        >
          Careers
        </ActionLink>
      </div>
    </header>
  );
}
