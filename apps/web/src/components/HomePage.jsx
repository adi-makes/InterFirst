"use client";

import { CareersPreviewSection } from "./CareersPreviewSection.jsx";
import { Hero } from "./Hero.jsx";
import { HowWeBuildSection } from "./HowWeBuildSection.jsx";
import { HowWeThinkSection } from "./HowWeThinkSection.jsx";
import { InternetFirstMeaningSection } from "./InternetFirstMeaningSection.jsx";
import { PageScrollNavigator } from "./PageScrollNavigator.jsx";
import { SectionContinuity } from "./SectionContinuity.jsx";
import { SiteFooter } from "./SiteFooter.jsx";
import { SiteHeader } from "./SiteHeader.jsx";
import { WhatWereBuildingSection } from "./WhatWereBuildingSection.jsx";

export function HomePage() {
  return (
    <div className="home-experience home-experience--ready">
      <div className="min-h-screen bg-surface" id="top">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <PageScrollNavigator href="#internet-first-meaning" label="Scroll to explore" />
        <div className="site-shell">
          <SectionContinuity />
          <main id="main-content">
            <Hero />
            <InternetFirstMeaningSection />
            <HowWeThinkSection />
            <HowWeBuildSection />
            <WhatWereBuildingSection />
            <div className="home-closing" aria-label="InterFirst closing section">
              <CareersPreviewSection />
              <SiteFooter />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
