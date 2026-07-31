"use client";

import { useLayoutEffect, useState } from "react";
import { AmbientEnvironment } from "./AmbientEnvironment.jsx";
import { Brand } from "./Brand.jsx";
import { CareersPreviewSection } from "./CareersPreviewSection.jsx";
import { Hero } from "./Hero.jsx";
import { HowWeBuildSection } from "./HowWeBuildSection.jsx";
import { HowWeThinkSection } from "./HowWeThinkSection.jsx";
import { InternetFirstMeaningSection } from "./InternetFirstMeaningSection.jsx";
import { SectionContinuity } from "./SectionContinuity.jsx";
import { SiteFooter } from "./SiteFooter.jsx";
import { SiteHeader } from "./SiteHeader.jsx";
import { WhatWereBuildingSection } from "./WhatWereBuildingSection.jsx";
import { WhyInterFirstSection } from "./WhyInterFirstSection.jsx";

let hasPlayedHomeIntro = false;

const INTRO_TIMINGS = Object.freeze({
  move: 1200,
  reveal: 1980,
  complete: 2180,
});

export function HomePage() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [introPhase, setIntroPhase] = useState(() =>
    hasPlayedHomeIntro ? "ready" : "waiting",
  );
  const contentReady = introPhase === "revealing" || introPhase === "ready";
  const contentBlocked = hasHydrated && !contentReady;
  const introVisible = introPhase !== "ready";

  useLayoutEffect(() => {
    setHasHydrated(true);
    if (hasPlayedHomeIntro) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hasPlayedHomeIntro = true;
      return undefined;
    }

    let cancelled = false;
    const timers = [];
    const frames = [];
    setIntroPhase("waiting");

    const begin = () => {
      const firstFrame = window.requestAnimationFrame(() => {
        const secondFrame = window.requestAnimationFrame(() => {
          if (cancelled) return;
          setIntroPhase("assembling");
          timers.push(
            window.setTimeout(() => setIntroPhase("moving"), INTRO_TIMINGS.move),
            window.setTimeout(() => setIntroPhase("revealing"), INTRO_TIMINGS.reveal),
            window.setTimeout(() => {
              hasPlayedHomeIntro = true;
              setIntroPhase("ready");
            }, INTRO_TIMINGS.complete),
          );
        });
        frames.push(secondFrame);
      });
      frames.push(firstFrame);
    };

    if (document.readyState === "complete") {
      begin();
    } else {
      window.addEventListener("load", begin, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", begin);
      timers.forEach((timer) => window.clearTimeout(timer));
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
    };
  }, []);

  return (
    <div
      className={`home-experience home-experience--${introPhase}`}
      data-home-intro-phase={introPhase}
    >
      <noscript>
        <style>{`
          .brand-loader { display: none !important; }
          .home-experience { height: auto !important; overflow: visible !important; }
          .site-header--intro-pending .brand,
          .site-header--intro-pending .desktop-navigation,
          .site-header--intro-pending .site-header__cta,
          .site-header--intro-pending .menu-button,
          .hero__word,
          .hero__description,
          .hero__actions,
          .scroll-text-reveal__content {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
        `}</style>
      </noscript>
      <AmbientEnvironment />
      {introVisible ? (
        <div
          aria-live="polite"
          className={`brand-loader brand-loader--${introPhase}`}
          role="status"
        >
          <div className="brand-loader__flight">
            <Brand animation="intro" assemble decorative />
          </div>
          <span className="sr-only">InterFirst is loading.</span>
        </div>
      ) : null}
      <div
        aria-hidden={contentBlocked ? true : undefined}
        className="min-h-screen bg-surface"
        id="top"
        inert={contentBlocked ? true : undefined}
      >
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader isReady={contentReady} />
        <div className="site-shell">
          <SectionContinuity />
          <main id="main-content">
            <Hero isReady={contentReady} />
            <InternetFirstMeaningSection />
            <HowWeThinkSection />
            <HowWeBuildSection />
            <WhatWereBuildingSection />
            <WhyInterFirstSection />
            <CareersPreviewSection />
          </main>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
