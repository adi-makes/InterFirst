import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";
import { RevealText } from "./RevealText.jsx";

const steps = [
  {
    number: "01",
    title: "Discover",
    description: "Understand the problem.",
  },
  {
    number: "02",
    title: "Define",
    description: "Find the right direction.",
  },
  {
    number: "03",
    title: "Design",
    description: "Shape the experience.",
  },
  {
    number: "04",
    title: "Engineer",
    description: "Build with care.",
  },
  {
    number: "05",
    title: "Launch",
    description: "Ship deliberately.",
  },
  {
    number: "06",
    title: "Improve",
    description: "Keep making it better.",
  },
];

export function HowWeBuildSection({
  chapterIndex = 3,
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
        threshold: 0.16,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [chapterIndex, hasEntered, isRevealEnabled, onRevealEntered]);

  return (
    <section
      className={`how-we-build ${hasEntered ? "how-we-build--entered" : ""}`}
      id="how-we-build"
      ref={sectionRef}
      aria-labelledby="how-we-build-title"
    >
      <div className="how-we-build__inner">
        <div className="how-we-build__transition-plane">
          <header className="how-we-build__intro">
            <ChapterLabel className="how-we-build__label">
              How we build
            </ChapterLabel>
            <RevealText
              as="h2"
              className="how-we-build__title how-we-build__reveal"
              delay={70}
              id="how-we-build-title"
            >
              <span>Clear process.</span>
              <span>No shortcuts.</span>
            </RevealText>
            <RevealText
              as="p"
              className="how-we-build__description how-we-build__reveal"
              delay={150}
            >
              A simple system keeps us focused, deliberate, and improving.
            </RevealText>
          </header>

          <ol
            aria-label="InterFirst build stages"
            className="how-we-build__process how-we-build__reveal"
          >
            {steps.map((step) => (
              <li className="how-we-build__step" key={step.number}>
                <span className="how-we-build__step-meta">
                  Step {step.number}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <NextSectionCue
          href="#what-were-building"
          label="See what we're building"
        />
      </div>
    </section>
  );
}
