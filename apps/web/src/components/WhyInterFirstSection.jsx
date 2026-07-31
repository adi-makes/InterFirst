import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";
import { RevealText } from "./RevealText.jsx";

const standards = [
  {
    title: "Obsessive about typography",
    description:
      "Every word, space and line should make reading feel natural.",
  },
  {
    title: "Thoughtful interactions",
    description:
      "Motion should guide people, not compete for their attention.",
  },
  {
    title: "Performance matters",
    description: "Fast products respect people's time and attention.",
  },
  {
    title: "Design systems",
    description:
      "Consistency creates confidence and allows products to evolve without losing clarity.",
  },
  {
    title: "Internet-native thinking",
    description:
      "The internet isn't another channel. It's where the product begins.",
  },
];

export function WhyInterFirstSection() {
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
        threshold: 0.12,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [hasEntered]);

  return (
    <section
      className={`why-interfirst ${
        hasEntered ? "why-interfirst--entered" : ""
      }`}
      id="why-interfirst"
      ref={sectionRef}
      aria-labelledby="why-interfirst-title"
    >
      <div className="why-interfirst__inner">
        <div className="why-interfirst__transition-plane">
          <header className="why-interfirst__intro">
          <ChapterLabel className="why-interfirst__label">
            Why InterFirst
          </ChapterLabel>
          <RevealText
            as="h2"
            className="why-interfirst__title why-interfirst__reveal"
            delay={70}
            id="why-interfirst-title"
          >
            <span>We believe good products</span>
            <span>are built with care.</span>
          </RevealText>
          <RevealText
            as="p"
            className="why-interfirst__description why-interfirst__reveal"
            delay={150}
          >
            The details most people overlook are often the ones that make
            products feel effortless.
          </RevealText>
          </header>

          <ul className="why-interfirst__standards">
            {standards.map((standard, index) => (
              <li
                className="why-interfirst__standard"
                key={standard.title}
                style={{ "--standard-index": index }}
              >
                <RevealText as="h3" delay={220 + index * 115}>
                  {standard.title}
                </RevealText>
                <RevealText as="p" delay={280 + index * 115}>
                  {standard.description}
                </RevealText>
              </li>
            ))}
          </ul>
        </div>

        <NextSectionCue href="#careers" label="Careers" />
      </div>
    </section>
  );
}
