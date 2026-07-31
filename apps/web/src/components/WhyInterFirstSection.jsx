import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";

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
          <h2
            className="why-interfirst__title why-interfirst__reveal"
            id="why-interfirst-title"
          >
            <span>We believe good products</span>
            <span>are built with care.</span>
          </h2>
          <p className="why-interfirst__description why-interfirst__reveal">
            The details most people overlook are often the ones that make
            products feel effortless.
          </p>
          </header>

          <ul className="why-interfirst__standards">
            {standards.map((standard, index) => (
              <li
                className="why-interfirst__standard"
                key={standard.title}
                style={{ "--standard-index": index }}
              >
                <h3>{standard.title}</h3>
                <p>{standard.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <NextSectionCue href="#careers" label="Careers" />
      </div>
    </section>
  );
}
