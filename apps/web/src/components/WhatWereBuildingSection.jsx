import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";

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

export function WhatWereBuildingSection() {
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
      className={`what-were-building ${
        hasEntered ? "what-were-building--entered" : ""
      }`}
      id="what-were-building"
      ref={sectionRef}
      aria-labelledby="what-were-building-title"
    >
      <div className="what-were-building__inner">
        <div className="what-were-building__transition-plane">
          <header className="what-were-building__intro">
          <ChapterLabel className="what-were-building__label">
            What we&apos;re building
          </ChapterLabel>
          <h2
            className="what-were-building__title what-were-building__reveal"
            id="what-were-building-title"
          >
            <span>The internet creates endless opportunities.</span>
            <span>These are the ones we&apos;re excited to explore.</span>
          </h2>
          <p className="what-were-building__description what-were-building__reveal">
            Not industries to chase. Problems worth solving through thoughtful
            products and companies.
          </p>
          </header>

          <ul className="what-were-building__grid">
            {opportunities.map((opportunity, index) => (
              <li
                className="what-were-building__card"
                key={opportunity.title}
                style={{ "--card-index": index }}
              >
                <span className="what-were-building__card-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{opportunity.title}</h3>
                <p>{opportunity.description}</p>
              </li>
            ))}
          </ul>

          <p className="what-were-building__closing what-were-building__reveal">
            The next great internet-first company may not fit an existing
            category. We&apos;re comfortable with that.
          </p>
        </div>

        <NextSectionCue href="#why-interfirst" label="Why InterFirst" />
      </div>
    </section>
  );
}
