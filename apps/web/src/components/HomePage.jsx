"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

let hasPlayedHomeIntro = false;

const INTRO_TIMINGS = Object.freeze({
  move: 1200,
  reveal: 1980,
  complete: 2180,
});

const HERO_REVEAL_COMPLETE_MS = 2200;
const CHAPTER_REVEAL_COMPLETE_MS = 1700;

export function HomePage() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [chapterStage, setChapterStage] = useState(0);
  const chapterTimersRef = useRef(new Map());
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

  useEffect(() => {
    if (!contentReady) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setChapterStage(6);
      return undefined;
    }

    const timer = window.setTimeout(
      () => setChapterStage((stage) => Math.max(stage, 1)),
      HERO_REVEAL_COMPLETE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [contentReady]);

  useEffect(
    () => () => {
      chapterTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      chapterTimersRef.current.clear();
    },
    [],
  );

  const handleChapterEntered = useCallback((chapterIndex) => {
    if (chapterTimersRef.current.has(chapterIndex)) return;

    const revealImmediately = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(
      () => {
        setChapterStage((stage) => Math.max(stage, chapterIndex + 1));
        chapterTimersRef.current.delete(chapterIndex);
      },
      revealImmediately ? 0 : CHAPTER_REVEAL_COMPLETE_MS,
    );
    chapterTimersRef.current.set(chapterIndex, timer);
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
            <InternetFirstMeaningSection
              chapterIndex={1}
              isRevealEnabled={chapterStage >= 1}
              onRevealEntered={handleChapterEntered}
            />
            <HowWeThinkSection
              chapterIndex={2}
              isRevealEnabled={chapterStage >= 2}
              onRevealEntered={handleChapterEntered}
            />
            <HowWeBuildSection
              chapterIndex={3}
              isRevealEnabled={chapterStage >= 3}
              onRevealEntered={handleChapterEntered}
            />
            <WhatWereBuildingSection
              chapterIndex={4}
              isRevealEnabled={chapterStage >= 4}
              onRevealEntered={handleChapterEntered}
            />
            <CareersPreviewSection
              chapterIndex={5}
              isRevealEnabled={chapterStage >= 5}
              onRevealEntered={handleChapterEntered}
            />
          </main>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
