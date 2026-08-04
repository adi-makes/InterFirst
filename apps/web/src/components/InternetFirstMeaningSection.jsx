import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";
import { RevealText } from "./RevealText.jsx";

const principles = [
  {
    number: "01",
    title: "Designed for the internet.",
    description:
      "The internet is the starting point—not a channel added later.",
  },
  {
    number: "02",
    title: "Designed as one system.",
    description:
      "Product, technology, and company decisions are made together from day one.",
  },
  {
    number: "03",
    title: "Built to keep evolving.",
    description:
      "Products improve continuously through real usage, feedback, and iteration.",
  },
];

export function InternetFirstMeaningSection({
  chapterIndex = 1,
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
        threshold: 0.18,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [chapterIndex, hasEntered, isRevealEnabled, onRevealEntered]);

  return (
    <section
      className={`internet-first-meaning ${
        hasEntered ? "internet-first-meaning--entered" : ""
      }`}
      id="internet-first-meaning"
      ref={sectionRef}
      aria-labelledby="internet-first-meaning-title"
    >
      <div className="internet-first-meaning__inner">
        <div className="internet-first-meaning__transition-plane">
          <header className="internet-first-meaning__intro">
            <ChapterLabel className="internet-first-meaning__label">
              What internet-first means
            </ChapterLabel>
            <RevealText
              as="h2"
              className="internet-first-meaning__title meaning-reveal"
              delay={70}
              id="internet-first-meaning-title"
            >
              <span>Internet-first is how we build.</span>
            </RevealText>
            <RevealText
              as="p"
              className="internet-first-meaning__description meaning-reveal"
              delay={150}
            >
              We build products, systems, and companies around how people discover,
              use, and improve them through the internet.
            </RevealText>
          </header>

          <ol className="internet-first-meaning__principles meaning-card-grid">
            {principles.map((principle, index) => (
              <li
                className="internet-first-meaning__principle meaning-card"
                key={principle.number}
                style={{ "--principle-index": index }}
              >
                <span className="internet-first-meaning__number" aria-hidden="true">
                  {principle.number}
                </span>
                <h3>{principle.title}</h3>
                <p
                  className="internet-first-meaning__principle-description"
                >
                  {principle.description}
                </p>
              </li>
            ))}
          </ol>

        </div>

        <NextSectionCue href="#how-we-think" label="Explore our principles" />
      </div>
    </section>
  );
}
