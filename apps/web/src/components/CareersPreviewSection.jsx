import { useEffect, useRef, useState } from "react";
import { ActionLink } from "./ActionLink.jsx";
import { Brand } from "./Brand.jsx";
import { RevealText } from "./RevealText.jsx";
import { BackgroundBeams } from "@/components/ui/background-beams";

export function CareersPreviewSection({
  chapterIndex = 5,
  isRevealEnabled = true,
  onRevealEntered,
}) {
  const sectionRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || hasEntered || !isRevealEnabled) return undefined;

    const enterSection = () => {
      setHasEntered(true);
      onRevealEntered?.(chapterIndex);
    };

    if (!("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(enterSection);
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          enterSection();
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
  }, [chapterIndex, hasEntered, isRevealEnabled, onRevealEntered]);

  return (
    <section
      className={`careers-preview ${
        hasEntered ? "careers-preview--entered" : ""
      }`}
      id="careers"
      ref={sectionRef}
      aria-labelledby="careers-preview-title"
    >
      <Brand decorative className="careers-preview__watermark" />
      <div className="careers-preview__inner">
        <BackgroundBeams className="careers-preview__beams" />
        <div className="careers-preview__transition-plane">
          <header className="careers-preview__intro">
            <RevealText
              as="p"
              className="careers-preview__label careers-preview__reveal"
              delay={0}
            >
              Careers
            </RevealText>
            <RevealText
              as="h2"
              className="careers-preview__title careers-preview__reveal"
              delay={80}
              id="careers-preview-title"
            >
              <span>Care about craft?</span>
              <span>Build with us.</span>
            </RevealText>
            <RevealText
              as="p"
              className="careers-preview__description careers-preview__reveal"
              delay={170}
            >
              We’re looking for thoughtful, curious builders who care about
              doing things well.
            </RevealText>
          </header>

          <div className="careers-preview__action careers-preview__reveal">
            <RevealText
              as="div"
              className="careers-preview__action-link"
              delay={260}
            >
              <ActionLink href="/careers">See Open Roles</ActionLink>
            </RevealText>
          </div>
        </div>
      </div>
    </section>
  );
}
