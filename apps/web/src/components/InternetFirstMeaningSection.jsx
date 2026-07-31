import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";
import { RevealText } from "./RevealText.jsx";

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
          <RevealText
            as="h2"
            className="internet-first-meaning__title meaning-reveal"
            delay={70}
            id="internet-first-meaning-title"
          >
            <span>Internet-first isn&apos;t an industry.</span>
            <span>It&apos;s a way of building.</span>
          </RevealText>
          <RevealText
            as="p"
            className="internet-first-meaning__description meaning-reveal"
            delay={150}
          >
            We design products, systems, and companies around how people discover,
            use, share, and improve them through the internet.
          </RevealText>
          </header>

          <div className="internet-first-meaning__divider" aria-hidden="true" />

          <ol className="internet-first-meaning__principles">
            {principles.map((principle, index) => (
              <li className="internet-first-meaning__principle" key={principle.number}>
                <RevealText
                  as="span"
                  className="internet-first-meaning__number"
                  delay={240 + index * 120}
                  aria-hidden="true"
                >
                  {principle.number}
                </RevealText>
                <RevealText as="h3" delay={290 + index * 120}>
                  {principle.title}
                </RevealText>
                <RevealText as="p" delay={350 + index * 120}>
                  {principle.description}
                </RevealText>
              </li>
            ))}
          </ol>
        </div>

        <NextSectionCue href="#how-we-think" label="How we think" />
      </div>
    </section>
  );
}
