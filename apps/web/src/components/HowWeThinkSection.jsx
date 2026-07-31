import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";

const principles = [
  {
    number: "01",
    title: "Design comes first.",
    description: "Experience shapes every important decision.",
  },
  {
    number: "02",
    title: "Simplicity takes work.",
    description: "We remove complexity until what's left feels obvious.",
  },
  {
    number: "03",
    title: "Build with intent.",
    description: "Every interaction should have a reason to exist.",
  },
  {
    number: "04",
    title: "Improve continuously.",
    description:
      "Every release is another opportunity to make the product better.",
  },
];

export function HowWeThinkSection() {
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
      className={`how-we-think ${hasEntered ? "how-we-think--entered" : ""}`}
      id="how-we-think"
      ref={sectionRef}
      aria-labelledby="how-we-think-title"
    >
      <div className="how-we-think__inner">
        <div className="how-we-think__transition-plane">
          <header className="how-we-think__intro">
          <ChapterLabel className="how-we-think__label">
            How we think
          </ChapterLabel>
          <h2
            className="how-we-think__title how-we-think__reveal"
            id="how-we-think-title"
          >
            <span>Good products are built with</span>
            <span>clear thinking, not bigger teams.</span>
          </h2>
          </header>

          <ol className="how-we-think__principles">
            {principles.map((principle) => (
              <li className="how-we-think__principle" key={principle.number}>
                <span className="how-we-think__number" aria-hidden="true">
                  {principle.number}
                </span>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <NextSectionCue href="#how-we-build" label="How we build" />
      </div>
    </section>
  );
}
