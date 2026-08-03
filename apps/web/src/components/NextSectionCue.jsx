import { useEffect, useState } from "react";

export function NextSectionCue({ href, label }) {
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
      className={`next-section-cue ${
        hasScrolled ? "next-section-cue--idle-stopped" : ""
      }`.trim()}
      href={href}
      aria-label={`Continue to ${label}`}
    >
      <span>{label}</span>
      <span aria-hidden="true" className="next-section-cue__symbol">
        <span>&gt;</span>
      </span>
    </a>
  );
}
