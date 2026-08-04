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
        <Brand href="/" />

        <nav className="site-footer__navigation" aria-label="Footer">
          <ul>
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="site-footer__legal">
          © 2026 InterFirst Technologies LLC
        </p>
      </div>
    </footer>
  );
}
