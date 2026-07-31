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

const timelinePath =
  "M 40 0 L 16 38 L 40 76 L 64 114 L 40 152 L 16 190 L 40 228 L 64 266 L 40 304 L 16 342 L 40 380 L 64 418 L 40 456";

const pathHeight = 456;
const pathDuration = steps.length;

export function HowWeBuildSection() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const progressPathRef = useRef(null);
  const stepRefs = useRef([]);
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
        threshold: 0.16,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [hasEntered]);

  useEffect(() => {
    const section = sectionRef.current;
    const timeline = timelineRef.current;
    const progressPath = progressPathRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (!section || !timeline || !progressPath) return undefined;

    let disposed = false;
    let setupVersion = 0;
    let gsapContext = null;

    const clearTimeline = () => {
      gsapContext?.revert();
      gsapContext = null;
      section.classList.remove("how-we-build--scroll-ready");
      section.dataset.timelineController = reducedMotion.matches
        ? "static-reduced-motion"
        : "static-fallback";
      section.dataset.timelineProgress = "1.000";
      section.dataset.timelineDirection = "static";
      section.dataset.timelineCompletedSteps = String(steps.length);
    };

    const setupTimeline = async (version) => {
      const [{ gsap }, { ScrollTrigger }, { CustomEase }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/CustomEase.js"),
      ]);

      if (disposed || version !== setupVersion || reducedMotion.matches) return;

      gsap.registerPlugin(ScrollTrigger, CustomEase);
      CustomEase.create(
        "interfirstTextReveal",
        "0.3,1.34,0.38,1",
      );
      const renderedSteps = stepRefs.current.filter(Boolean);
      const pathLength = progressPath.getTotalLength();

      section.classList.add("how-we-build--scroll-ready");
      section.dataset.timelineController = "gsap-scrolltrigger";
      section.dataset.timelineSteps = String(renderedSteps.length);
      section.dataset.timelineProgress = "0.000";
      section.dataset.timelineDirection = "forward";
      section.dataset.timelineCompletedSteps = "0";

      gsapContext = gsap.context(() => {
        gsap.set(progressPath, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        renderedSteps.forEach((step) => {
          gsap.set(step.querySelector(".how-we-build__marker"), {
            backgroundColor: "#fafaf8",
            borderColor: "#b7bcc5",
          });
          gsap.set(step.querySelectorAll(".scroll-text-reveal__content"), {
            opacity: 0,
            rotationX: -25,
            transformOrigin: "center bottom",
            transformPerspective: 500,
            y: "2.5rem",
          });
        });

        const scrollTimeline = gsap.timeline({
          defaults: { overwrite: "auto" },
          scrollTrigger: {
            trigger: timeline,
            start: "top 78%",
            end: "bottom 40%",
            scrub: 0.55,
            invalidateOnRefresh: true,
            onUpdate: (trigger) => {
              const progress = trigger.progress;
              const reachedSteps = steps.filter((_, index) => {
                const markerProgress = (38 + index * 76) / pathHeight;
                return progress >= markerProgress;
              }).length;

              section.dataset.timelineProgress = progress.toFixed(3);
              section.dataset.timelineDirection =
                trigger.direction < 0 ? "reverse" : "forward";
              section.dataset.timelineCompletedSteps = String(reachedSteps);
            },
          },
        });

        scrollTimeline.to(
          progressPath,
          {
            strokeDashoffset: 0,
            duration: pathDuration,
            ease: "none",
          },
          0,
        );

        renderedSteps.forEach((step, index) => {
          const markerTime =
            (((38 + index * 76) / pathHeight) * pathDuration);
          const marker = step.querySelector(".how-we-build__marker");
          const number = step.querySelector(
            ".how-we-build__number .scroll-text-reveal__content",
          );
          const title = step.querySelector(
            "h3 .scroll-text-reveal__content",
          );
          const description = step.querySelector(
            "p .scroll-text-reveal__content",
          );

          scrollTimeline
            .to(
              marker,
              {
                backgroundColor: "#2563eb",
                borderColor: "#2563eb",
                duration: 0.18,
                ease: "power2.out",
              },
              markerTime - 0.09,
            )
            .to(
              number,
              {
                opacity: 1,
                rotationX: 0,
                y: 0,
                duration: 0.28,
                ease: "interfirstTextReveal",
              },
              markerTime - 0.1,
            )
            .to(
              title,
              {
                opacity: 1,
                rotationX: 0,
                y: 0,
                duration: 0.32,
                ease: "interfirstTextReveal",
              },
              markerTime - 0.04,
            )
            .to(
              description,
              {
                opacity: 1,
                rotationX: 0,
                y: 0,
                duration: 0.32,
                ease: "interfirstTextReveal",
              },
              markerTime + 0.08,
            );
        });
      }, section);
    };

    const configureTimeline = () => {
      setupVersion += 1;
      clearTimeline();

      if (!reducedMotion.matches) {
        setupTimeline(setupVersion);
      }
    };

    configureTimeline();
    reducedMotion.addEventListener("change", configureTimeline);

    return () => {
      disposed = true;
      setupVersion += 1;
      reducedMotion.removeEventListener("change", configureTimeline);
      clearTimeline();
    };
  }, []);

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
            <span>A clear process.</span>
            <span>No shortcuts.</span>
          </RevealText>
          <RevealText
            as="p"
            className="how-we-build__description how-we-build__reveal"
            delay={150}
          >
            A simple system helps us stay focused, move deliberately, and
            improve continuously.
          </RevealText>
          </header>

          <div className="how-we-build__timeline" ref={timelineRef}>
            <div className="how-we-build__path" aria-hidden="true">
            <svg
              viewBox="0 0 80 456"
              preserveAspectRatio="none"
              role="presentation"
            >
              <defs>
                <linearGradient
                  id="how-we-build-path-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="456"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#2563eb" />
                  <stop offset="1" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <path
                className="how-we-build__path-base"
                d={timelinePath}
                pathLength="1"
              />
              <path
                className="how-we-build__path-progress"
                d={timelinePath}
                ref={progressPathRef}
              />
            </svg>
            </div>

            <ol className="how-we-build__process">
              {steps.map((step, index) => (
                <li
                  className="how-we-build__step"
                  key={step.number}
                  ref={(node) => {
                    stepRefs.current[index] = node;
                  }}
                  style={{
                    "--marker-position": index % 2 === 0 ? "20%" : "80%",
                    "--step-index": index,
                  }}
                >
                  <span className="how-we-build__marker-slot" aria-hidden="true">
                    <span className="how-we-build__marker" />
                  </span>
                  <div className="how-we-build__step-content">
                    <RevealText
                      as="span"
                      className="how-we-build__number"
                      delay={220 + index * 95}
                      aria-hidden="true"
                    >
                      {step.number}
                    </RevealText>
                    <RevealText as="h3" delay={265 + index * 95}>
                      {step.title}
                    </RevealText>
                    <RevealText as="p" delay={315 + index * 95}>
                      {step.description}
                    </RevealText>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <NextSectionCue
          href="#what-were-building"
          label="What we're building"
        />
      </div>
    </section>
  );
}
