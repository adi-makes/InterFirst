import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";
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
          <RevealText
            as="h2"
            className="what-were-building__title what-were-building__reveal"
            delay={70}
            id="what-were-building-title"
          >
            <span>The internet creates opportunities worth exploring.</span>
          </RevealText>
          <RevealText
            as="p"
            className="what-were-building__description what-were-building__reveal"
            delay={150}
          >
            Not industries to chase. Problems worth solving through thoughtful
            products and companies.
          </RevealText>
          </header>

          <ul className="what-were-building__grid">
            {opportunities.map((opportunity, index) => (
              <li
                className="what-were-building__card"
                key={opportunity.title}
                style={{ "--card-index": index }}
              >
                <RevealText
                  as="span"
                  className="what-were-building__card-number"
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
          </ul>

          <RevealText
            as="p"
            className="what-were-building__closing what-were-building__reveal"
            delay={820}
          >
            The next great internet-first company may not fit an existing
            category. We&apos;re comfortable with that.
          </RevealText>
        </div>

        <NextSectionCue href="#why-interfirst" label="Why InterFirst" />
      </div>
    </section>
  );
}
