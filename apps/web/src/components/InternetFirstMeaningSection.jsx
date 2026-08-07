import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { RevealText } from "./RevealText.jsx";
import styles from "./InternetFirstMeaningSection.module.css";

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
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const [hasEntered, setHasEntered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
      window.innerWidth <= 768
        ? { rootMargin: "0px 0px 20% 0px", threshold: 0.01 }
        : { rootMargin: "0px 0px -10% 0px", threshold: 0.18 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [chapterIndex, hasEntered, isRevealEnabled, onRevealEntered]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion) return undefined;

    const clamp = (value, minimum, maximum) =>
      Math.min(Math.max(value, minimum), maximum);
    const mobileTimeline = [
      [0, -1.1],
      [0.18, 0],
      [0.32, 0.12],
      [0.48, 1],
      [0.62, 1.12],
      [0.78, 2],
      [1, 2],
    ];
    const desktopCardTimings = [
      [0.1, 0.3],
      [0.36, 0.56],
      [0.62, 0.82],
    ];
    let frame = 0;

    const resolvePosition = (progress) => {
      const nextIndex = mobileTimeline.findIndex(([stop]) => progress <= stop);
      if (nextIndex <= 0) return mobileTimeline[0][1];
      const [previousStop, previousPosition] = mobileTimeline[nextIndex - 1];
      const [nextStop, nextPosition] = mobileTimeline[nextIndex];
      const localProgress = (progress - previousStop) / (nextStop - previousStop);
      return previousPosition + (nextPosition - previousPosition) * localProgress;
    };

    const update = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-bounds.top / travel, 0, 1);
      const firstCard = cardRefs.current[0];
      if (!firstCard) return;
      const isMobile = window.innerWidth <= 768;
      let activePosition = 0;

      if (isMobile) {
        activePosition = resolvePosition(progress);
        const cardWidth = firstCard.offsetWidth;
        const gap = Number.parseFloat(window.getComputedStyle(track).gap) || 0;
        const stride = cardWidth + gap;
        const centeredTrackX = window.innerWidth / 2 - cardWidth / 2;
        const trackX = centeredTrackX - activePosition * stride;
        track.style.setProperty("--meaning-track-x", `${trackX.toFixed(2)}px`);
      } else {
        track.style.removeProperty("--meaning-track-x");
      }

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        if (!isMobile) {
          const [start, end] = desktopCardTimings[index];
          const entryProgress = clamp((progress - start) / (end - start), 0, 1);
          const entryDistance = window.innerWidth + card.offsetWidth;
          card.style.setProperty(
            "--meaning-card-entry-x",
            `${(entryDistance * (1 - entryProgress)).toFixed(2)}px`,
          );
          card.style.setProperty("--meaning-card-opacity", "1");
          card.style.setProperty("--meaning-card-scale", "1");
          card.toggleAttribute("data-active", entryProgress > 0.98);
          return;
        }

        const distance = Math.abs(index - activePosition);
        card.style.setProperty(
          "--meaning-card-opacity",
          (1 - Math.min(distance * 0.6, 0.6)).toFixed(3),
        );
        card.style.setProperty(
          "--meaning-card-scale",
          (1 - Math.min(distance * 0.04, 0.04)).toFixed(3),
        );
        card.style.removeProperty("--meaning-card-blur");
        card.toggleAttribute("data-active", distance < 0.42);
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(section);
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [prefersReducedMotion]);

  return (
    <section
      className={`internet-first-meaning ${styles.section} ${
        hasEntered ? "internet-first-meaning--entered" : ""
      } ${hasEntered ? styles.entered : ""} ${
        prefersReducedMotion ? styles.reducedMotion : ""
      }`}
      id="internet-first-meaning"
      ref={sectionRef}
      aria-labelledby="internet-first-meaning-title"
    >
      <div className={styles.scrollSpace}>
        <div className={styles.stickyFrame}>
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
            </div>

            <ol
              className={`internet-first-meaning__principles meaning-card-grid ${styles.track}`}
              ref={trackRef}
            >
            {principles.map((principle, index) => (
              <li
                className={`internet-first-meaning__principle meaning-card ${styles.card}`}
                key={principle.number}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
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
        </div>
      </div>
    </section>
  );
}
