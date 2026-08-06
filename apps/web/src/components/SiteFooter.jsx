import Link from "next/link";
import { Brand } from "./Brand.jsx";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Careers", href: "/careers" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand-block">
          <Brand href="/" decorative />
        </div>

        <nav className="site-footer__navigation" aria-label="Footer">
          <p>Explore</p>
          <ul>
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="site-footer__tagline">We build internet-first companies.</p>
        <p className="site-footer__legal">© 2026 InterFirst Technologies LLC</p>
      </div>
    </footer>
  );
}
