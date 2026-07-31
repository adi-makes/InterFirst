import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";

const principles = [
  {
    number: "01",
    title: "Designed for the internet.",
    description:
      "The internet is the starting point, not a channel added later.",
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
      "Products improve continuously through use, feedback, and thoughtful iteration.",
  },
];

export function InternetFirstMeaningSection() {
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
        threshold: 0.18,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [hasEntered]);

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
          <h2
            className="internet-first-meaning__title meaning-reveal"
            id="internet-first-meaning-title"
          >
            <span>Internet-first isn&apos;t an industry.</span>
            <span>It&apos;s a way of building.</span>
          </h2>
          <p className="internet-first-meaning__description meaning-reveal">
            We design products, systems, and companies around how people discover,
            use, share, and improve them through the internet.
          </p>
          </header>

          <div className="internet-first-meaning__divider" aria-hidden="true" />

          <ol className="internet-first-meaning__principles">
            {principles.map((principle) => (
              <li className="internet-first-meaning__principle" key={principle.number}>
                <span className="internet-first-meaning__number" aria-hidden="true">
                  {principle.number}
                </span>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <NextSectionCue href="#how-we-think" label="How we think" />
      </div>
    </section>
  );
}
