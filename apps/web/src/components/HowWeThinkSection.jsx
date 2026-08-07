import { useEffect, useRef, useState } from "react";
import { ChapterLabel } from "./ChapterLabel.jsx";
import { RevealText } from "./RevealText.jsx";

const AUTOPLAY_DELAY_MS = 4000;
const LOOP_RESET_DELAY_MS = 700;

const principles = [
  {
    number: "01",
    title: "Design comes first.",
    description: "Experience shapes every important decision.",
  },
  {
    number: "02",
    title: "Simplicity takes work.",
    description: "We remove complexity until the answer feels obvious.",
  },
  {
    number: "03",
    title: "Build with intent.",
    description: "Every interaction needs a reason to exist.",
  },
  {
    number: "04",
    title: "Improve continuously.",
    description: "Every release should make the product better.",
  },
];

const carouselPrinciples = [
  principles[principles.length - 1],
  ...principles,
  principles[0],
];

export function HowWeThinkSection({
  chapterIndex = 2,
  isRevealEnabled = true,
  onRevealEntered,
}) {
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const slideRefs = useRef([]);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(1);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
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
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.18,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [chapterIndex, hasEntered, isRevealEnabled, onRevealEntered]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(motionQuery.matches);
      if (motionQuery.matches) {
        setActiveIndex(0);
        setDisplayIndex(1);
      }
    };

    updateMotionPreference();
    motionQuery.addEventListener?.("change", updateMotionPreference);
    return () => motionQuery.removeEventListener?.("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (
      !hasEntered ||
      isInteractionPaused ||
      prefersReducedMotion
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % principles.length);
      setDisplayIndex((index) => index + 1);
    }, AUTOPLAY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, hasEntered, isInteractionPaused, prefersReducedMotion]);

  useEffect(() => {
    const carousel = carouselRef.current;
    const slide = slideRefs.current[displayIndex];
    if (!carousel || !slide) return undefined;

    const alignSlide = (target, behavior) => {
      const carouselBounds = carousel.getBoundingClientRect();
      const slideBounds = target.getBoundingClientRect();
      const centeredOffset =
        slideBounds.left -
        carouselBounds.left -
        (carousel.clientWidth - target.clientWidth) / 2;
      carousel.scrollTo({
        behavior,
        left: carousel.scrollLeft + centeredOffset,
      });
    };

    const alignActiveSlide = () =>
      alignSlide(slide, prefersReducedMotion ? "auto" : "smooth");

    alignActiveSlide();
    window.addEventListener("resize", alignActiveSlide);

    let wrapTimer;
    if (displayIndex === principles.length + 1) {
        wrapTimer = window.setTimeout(() => {
          const firstSlide = slideRefs.current[1];
          if (!firstSlide) return;
          alignSlide(firstSlide, "auto");
          setActiveIndex(0);
          setDisplayIndex(1);
        }, prefersReducedMotion ? 0 : LOOP_RESET_DELAY_MS);
    }

    return () => {
      window.removeEventListener("resize", alignActiveSlide);
      if (wrapTimer) window.clearTimeout(wrapTimer);
    };
  }, [displayIndex, prefersReducedMotion]);

  const selectPrinciple = (index) => {
    setActiveIndex(index);
    setDisplayIndex(index + 1);
  };

  const handleCarouselBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsInteractionPaused(false);
    }
  };

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
            <RevealText
              as="h2"
              className="how-we-think__title how-we-think__reveal"
              delay={70}
              id="how-we-think-title"
            >
              Good products start with clarity.
            </RevealText>
          </header>

          <div
            aria-label="How we think principles"
            aria-roledescription="carousel"
            className="how-we-think__carousel"
            onBlurCapture={handleCarouselBlur}
            onFocusCapture={() => setIsInteractionPaused(true)}
            onMouseEnter={() => setIsInteractionPaused(true)}
            onMouseLeave={() => setIsInteractionPaused(false)}
            role="region"
          >
            <div
              aria-live={isInteractionPaused ? "polite" : "off"}
              className="how-we-think__carousel-viewport"
              ref={carouselRef}
            >
              <ol className="how-we-think__carousel-track">
                {carouselPrinciples.map((principle, visualIndex) => {
                  const isClone =
                    visualIndex === 0 ||
                    visualIndex === carouselPrinciples.length - 1;
                  const logicalIndex =
                    (visualIndex - 1 + principles.length) % principles.length;

                  return (
                    <li
                      aria-current={
                        !isClone && logicalIndex === activeIndex
                          ? "true"
                          : undefined
                      }
                      aria-hidden={isClone ? "true" : undefined}
                      aria-label={
                        isClone
                          ? undefined
                          : `${logicalIndex + 1} of ${principles.length}`
                      }
                      aria-roledescription={isClone ? undefined : "slide"}
                      className="how-we-think__principle how-we-think__carousel-card"
                      data-active={
                        visualIndex === displayIndex ? "true" : undefined
                      }
                      key={`${principle.number}-${visualIndex}`}
                      ref={(node) => {
                        slideRefs.current[visualIndex] = node;
                      }}
                      role={isClone ? "presentation" : "group"}
                    >
                      <span className="how-we-think__number" aria-hidden="true">
                        {principle.number}
                      </span>
                      <h3>{principle.title}</h3>
                      <p>{principle.description}</p>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="how-we-think__carousel-controls">
              <div aria-label="Choose a principle" className="how-we-think__carousel-dots" role="group">
                {principles.map((principle, index) => (
                  <button
                    aria-label={`Show ${principle.title}`}
                    aria-pressed={index === activeIndex}
                    className="how-we-think__carousel-dot"
                    key={principle.number}
                    onClick={() => selectPrinciple(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
