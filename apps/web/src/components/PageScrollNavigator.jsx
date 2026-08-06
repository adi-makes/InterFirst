"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export function PageScrollNavigator({ href, label }) {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (window.scrollY > 0) {
      setHasScrolled(true);
      return undefined;
    }

    const stopIdleMotion = () => setHasScrolled(true);
    window.addEventListener("scroll", stopIdleMotion, { once: true, passive: true });
    return () => window.removeEventListener("scroll", stopIdleMotion);
  }, []);

  return (
    <a
      className={`page-scroll-navigator ${hasScrolled ? "page-scroll-navigator--idle-stopped" : ""}`.trim()}
      href={href}
      aria-label={`Continue to ${label}`}
    >
      <span>{label}</span>
      <span aria-hidden="true" className="page-scroll-navigator__symbol">
        <CaretDown size={18} weight="light" />
      </span>
    </a>
  );
}
