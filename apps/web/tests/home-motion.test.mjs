import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../", import.meta.url);

const readSource = (path) => readFile(new URL(path, appRoot), "utf8");

test("coordinates first-load brand assembly, navbar landing, and Home reveal", async () => {
  const home = await readSource("src/components/HomePage.jsx");
  const hero = await readSource("src/components/Hero.jsx");
  const header = await readSource("src/components/SiteHeader.jsx");

  assert.match(home, /let hasPlayedHomeIntro = false/);
  assert.match(home, /hasPlayedHomeIntro \? "ready" : "waiting"/);
  assert.match(home, /const contentBlocked = hasHydrated && !contentReady/);
  assert.match(home, /setIntroPhase\("assembling"\)/);
  assert.match(home, /setIntroPhase\("moving"\)/);
  assert.match(home, /setIntroPhase\("revealing"\)/);
  assert.match(home, /document\.readyState === "complete"/);
  assert.match(home, /prefers-reduced-motion: reduce/);
  assert.match(home, /<Brand animation="intro" assemble decorative \/>/);
  assert.match(header, /<Brand animation="loop" assemble \/>/);
  assert.match(header, /variant="primary"/);
  assert.match(hero, /hero--intro-ready/);
});

test("reuses collision-safe five-module geometry for every animated brand", async () => {
  const brand = await readSource("src/components/Brand.jsx");

  assert.match(brand, /useId/);
  assert.match(brand, /instanceId/);
  assert.match(brand, /--brand-module-x/);
  assert.match(brand, /--brand-module-y/);
  assert.match(brand, /--brand-module-rotate/);
  assert.equal((brand.match(/id: "/g) || []).length, 5);
});

test("keeps the navbar loop quiet and resolves every entrance under reduced motion", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /brand-module-loop 6s/);
  assert.match(css, /brand-loader__flight/);
  assert.match(css, /transition: transform 760ms/);
  assert.match(css, /hero--intro-ready \.hero__word/);
  assert.match(css, /\.brand-loader \{\s*display: none !important;/);
  assert.match(css, /\.brand--assembly \.brand__module,[\s\S]*animation: none !important;/);
});

test("uses an icon-only full-screen mobile navigation", async () => {
  const header = await readSource("src/components/SiteHeader.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(header, /aria-label=\{menuOpen \? "Close navigation" : "Open navigation"\}/);
  assert.doesNotMatch(header, /<span>Menu<\/span>/);
  assert.match(header, /mobileNavigationRef/);
  assert.match(header, /document\.documentElement\.style\.overflow = "hidden"/);
  assert.match(header, /region\.setAttribute\("inert", ""\)/);
  assert.match(header, /event\.key !== "Tab"/);
  assert.match(header, /window\.matchMedia\("\(min-width: 961px\)"\)/);
  assert.match(css, /\.mobile-navigation \{[\s\S]*inset: 0;[\s\S]*min-height: 100dvh;/);
  assert.match(css, /\.mobile-navigation__inner \{[\s\S]*min-height: 100dvh;/);
  assert.match(css, /\.menu-button \{[\s\S]*width: 48px;[\s\S]*min-height: 48px;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.mobile-navigation \{\s*animation: none;/);
});

test("reveals every Home chapter's text through the hero-style clipped rise", async () => {
  const css = await readSource("src/app/globals.css");
  const reveal = await readSource("src/components/RevealText.jsx");
  const timeline = await readSource("src/components/HowWeBuildSection.jsx");
  const sections = await Promise.all(
    [
      "InternetFirstMeaningSection.jsx",
      "HowWeThinkSection.jsx",
      "HowWeBuildSection.jsx",
      "WhatWereBuildingSection.jsx",
      "WhyInterFirstSection.jsx",
      "CareersPreviewSection.jsx",
    ].map((path) => readSource(`src/components/${path}`)),
  );

  assert.match(reveal, /scroll-text-reveal__clip/);
  assert.match(reveal, /--scroll-text-delay/);
  sections.forEach((source) => assert.match(source, /<RevealText/));
  assert.match(css, /\.scroll-text-reveal__clip \{[\s\S]*overflow: hidden/);
  assert.match(
    css,
    /\.scroll-text-reveal__content \{[\s\S]*var\(--motion-hero-word-rise\)[\s\S]*var\(--motion-hero-word-rotate\)/,
  );
  assert.match(
    css,
    /\.careers-preview--entered[\s\S]*\.scroll-text-reveal__content[\s\S]*animation: hero-word-rise/,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.scroll-text-reveal__content \{[\s\S]*animation: none !important/,
  );
  assert.match(timeline, /\.how-we-build__number \.scroll-text-reveal__content/);
  assert.match(timeline, /rotationX: -25/);
  assert.match(
    css,
    /\.how-we-build--scroll-ready[\s\S]*\.scroll-text-reveal__content \{\s*animation: none;/,
  );
});

test("keeps the concise What We're Building chapter and cue in one viewport", async () => {
  const css = await readSource("src/app/globals.css");
  const section = await readSource(
    "src/components/WhatWereBuildingSection.jsx",
  );

  assert.match(
    section,
    /<span>The internet creates opportunities worth exploring\.<\/span>\s*<\/RevealText>/,
  );
  assert.doesNotMatch(section, /endless opportunities/);
  assert.match(
    css,
    /@media \(min-width: 769px\) and \(max-height: 980px\)[\s\S]*\.what-were-building__inner \{[\s\S]*height: 100%;[\s\S]*padding-block: 24px 64px;/,
  );
});
