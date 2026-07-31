import { useEffect, useRef, useState } from "react";
import { ActionLink } from "./ActionLink.jsx";
import { ChapterLabel } from "./ChapterLabel.jsx";

export function CareersPreviewSection() {
  const sectionRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || hasEntered) return undefined;

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
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.15,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [hasEntered]);

  return (
    <section
      className={`careers-preview ${
        hasEntered ? "careers-preview--entered" : ""
      }`}
      id="careers"
      ref={sectionRef}
      aria-labelledby="careers-preview-title"
    >
      <div className="careers-preview__inner">
        <div className="careers-preview__transition-plane">
          <header className="careers-preview__intro">
          <ChapterLabel className="careers-preview__label">
            Careers
          </ChapterLabel>
          <h2
            className="careers-preview__title careers-preview__reveal"
            id="careers-preview-title"
          >
            <span>We’re looking for people</span>
            <span>who care about craft</span>
            <span>as much as code.</span>
          </h2>
          <p className="careers-preview__description careers-preview__reveal">
            If you’re thoughtful, curious and obsessed with building things
            well, we’d love to hear from you.
          </p>
          </header>

          <div className="careers-preview__action careers-preview__reveal">
            <p className="careers-preview__action-label">Open positions</p>
            <ActionLink href="/careers" showArrow>
              See Open Roles
            </ActionLink>
            <p className="careers-preview__note">
              Even if there isn’t a perfect role today, we’re always interested
              in meeting exceptional builders.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
