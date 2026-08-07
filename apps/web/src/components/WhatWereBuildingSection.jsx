import { useEffect, useRef, useState } from "react";
import { RevealText } from "./RevealText.jsx";

const opportunities = [
  {
    title: "Developer Tools",
    description:
      "Products that help builders create, ship and improve software.",
  },
  {
    title: "AI-native Products",
    description:
      "Practical intelligence designed around real user needs.",
  },
  {
    title: "Modern SaaS",
    description:
      "Software built with clarity, speed and continuous improvement.",
  },
  {
    title: "Consumer Products",
    description:
      "Digital experiences people genuinely enjoy using.",
  },
  {
    title: "Internet Platforms",
    description:
      "Products that connect people, businesses and communities.",
  },
];

export function WhatWereBuildingSection({
  chapterIndex = 4,
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
        threshold: 0.12,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [chapterIndex, hasEntered, isRevealEnabled, onRevealEntered]);

  return (
    <section
      className={`what-were-building ${
        hasEntered ? "what-were-building--entered" : ""
      }`}
      id="what-were-building"
      ref={sectionRef}
      aria-labelledby="what-were-building-title"
    >
      <div className="what-were-building__inner">
        <div className="what-were-building__browser">
          <header className="what-were-building__browser-header" aria-label="What we're building overview">
            <span className="what-were-building__traffic-lights" aria-hidden="true">
              <span className="what-were-building__traffic-light what-were-building__traffic-light--red" />
              <span className="what-were-building__traffic-light what-were-building__traffic-light--yellow" />
              <span className="what-were-building__traffic-light what-were-building__traffic-light--green" />
            </span>
            <span className="what-were-building__browser-search" aria-hidden="true">
              <span className="what-were-building__browser-search-label">
                WHAT WE&apos;RE BUILDING
              </span>
              <span className="what-were-building__browser-search-icon" />
            </span>
            <span className="what-were-building__browser-actions" aria-hidden="true" />
          </header>
          <div className="what-were-building__transition-plane">
          <header className="what-were-building__intro">
            <RevealText
              as="h2"
              className="what-were-building__title what-were-building__reveal"
              delay={70}
              id="what-were-building-title"
            >
              <span>Opportunities</span>
              <span>worth exploring.</span>
            </RevealText>
            <RevealText
              as="p"
              className="what-were-building__description what-were-building__reveal"
              delay={150}
            >
              We follow problems worth solving—not industries or categories.
            </RevealText>
          </header>

          <ol className="what-were-building__opportunities">
            {opportunities.map((opportunity, index) => (
              <li
                className="what-were-building__opportunity"
                key={opportunity.title}
                style={{ "--opportunity-index": index }}
              >
                <RevealText
                  as="span"
                  className="what-were-building__opportunity-number"
                  delay={230 + index * 105}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </RevealText>
                <RevealText as="h3" delay={275 + index * 105}>
                  {opportunity.title}
                </RevealText>
                <RevealText as="p" delay={330 + index * 105}>
                  {opportunity.description}
                </RevealText>
              </li>
            ))}
          </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
