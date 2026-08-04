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
  assert.match(
    css,
    /--brand-loader-gutter: max\(48px, calc\(\(100% - var\(--wide\)\) \/ 2\)\)/,
  );
  assert.match(css, /top: calc\(\(72px - 1px - 44px\) \/ 2\)/);
  assert.doesNotMatch(
    css,
    /--brand-loader-gutter: max\(48px, calc\(\(100vw - var\(--wide\)\) \/ 2\)\)/,
  );
  assert.match(css, /transition: transform 760ms/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*--brand-loader-target-top: calc\(\(64px - 44px\) \/ 2\)/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.brand-loader__flight \{[\s\S]*top: var\(--brand-loader-target-top\);[\s\S]*left: var\(--brand-loader-gutter\);[\s\S]*50dvh - var\(--brand-loader-target-top\) - 50%/);
  assert.match(css, /\.brand-loader--moving \.brand-loader__flight,[\s\S]*transform: translate\(0, 0\) scale\(1\)/);
  assert.doesNotMatch(css, /calc\(-50vh \+ 10px\)/);
  assert.match(css, /hero--intro-ready \.hero__word/);
  assert.match(css, /\.brand-loader \{\s*display: none !important;/);
  assert.match(css, /\.brand--assembly \.brand__module,[\s\S]*animation: none !important;/);
});

test("uses an icon-only full-screen mobile navigation", async () => {
  const header = await readSource("src/components/SiteHeader.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(header, /aria-label=\{menuOpen \? "Close navigation" : "Open navigation"\}/);
  assert.doesNotMatch(header, /<span>Menu<\/span>/);
  assert.doesNotMatch(header, /<List|<X/);
  assert.match(header, /className="menu-button__icon"/);
  assert.match(header, /mobileNavigationRef/);
  assert.doesNotMatch(header, /firstMobileLinkRef/);
  assert.match(header, /data-open=\{menuOpen\}/);
  assert.match(header, /inert=\{!menuOpen\}/);
  assert.match(header, /document\.documentElement\.style\.overflow = "hidden"/);
  assert.match(header, /region\.setAttribute\("inert", ""\)/);
  assert.match(header, /event\.key !== "Tab"/);
  assert.match(header, /window\.matchMedia\("\(min-width: 961px\)"\)/);
  assert.match(css, /\.mobile-navigation \{[\s\S]*inset: 0;[\s\S]*min-height: 100dvh;/);
  assert.match(css, /\.mobile-navigation__inner \{[\s\S]*min-height: 100dvh;/);
  assert.match(css, /\.menu-button \{[\s\S]*width: 44px;[\s\S]*min-height: 44px;[\s\S]*border-radius: 50%;/);
  assert.match(css, /\.menu-button\[aria-expanded="true"\] \{[\s\S]{0,120}background: var\(--accent-soft\);[\s\S]{0,120}border-color: var\(--border-strong\);/);
  assert.match(css, /\.menu-button:active \{[\s\S]{0,80}scale\(0\.98\)/);
  assert.match(css, /\.menu-button\[aria-expanded="true"\][\s\S]*rotate\(45deg\)[\s\S]*rotate\(-45deg\)/);
  assert.match(css, /\.mobile-navigation \{[\s\S]*translate3d\(0, -100%, 0\)[\s\S]*transform 520ms/);
  assert.match(css, /\.mobile-navigation\[data-open="true"\][\s\S]*translate3d\(0, 0, 0\)/);
  assert.match(css, /\.mobile-navigation::before \{[\s\S]*url\("\/brand\/home-mobile-grid\.png"\)[\s\S]*opacity: 0\.55;/);
  assert.match(css, /\.mobile-navigation__inner \{[\s\S]*width: min\(calc\(100% - 48px\), 480px\);/);
  assert.match(css, /\.mobile-navigation__inner > a:not\(\.action-link\):first-child \{[\s\S]*border-top: 1px solid var\(--border\);/);
  assert.match(css, /\.mobile-navigation \.action-link \{[\s\S]*margin-top: 24px;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.mobile-navigation \{\s*transition: none;/);
});

test("gives Home one consistent navigation and conversion language", async () => {
  const header = await readSource("src/components/SiteHeader.jsx");
  const hero = await readSource("src/components/Hero.jsx");
  const footer = await readSource("src/components/SiteFooter.jsx");
  const sectionCue = await readSource("src/components/NextSectionCue.jsx");
  const chapterLabel = await readSource("src/components/ChapterLabel.jsx");
  const css = await readSource("src/app/globals.css");

  assert.doesNotMatch(header, /\["Home", "\/"\]/);
  assert.match(header, /\["Principles", "\/#how-we-think"\]/);
  assert.match(header, /\["Building", "\/#how-we-build"\]/);
  assert.doesNotMatch(header, /\["About",|#why-interfirst/);
  assert.equal((header.match(/>\s*View Careers\s*</g) || []).length, 2);
  assert.match(
    header,
    /className="site-header__cta"[\s\S]{0,120}variant="primary"/,
  );
  assert.doesNotMatch(header, /Explore careers/);
  assert.doesNotMatch(
    header,
    /className="site-header__cta"[\s\S]{0,120}showArrow/,
  );
  assert.match(
    hero,
    /We design the product, systems, and company as one connected whole from/,
  );
  assert.match(hero, /We design products, systems, and companies as one\./);
  assert.doesNotMatch(hero, /InterFirst is a studio/);
  assert.doesNotMatch(hero, /Read our principles/);
  assert.match(hero, /<ActionLink href="\/careers">\s*See Open Roles\s*<\/ActionLink>/);
  assert.doesNotMatch(hero, /<ActionLink href="\/careers" showArrow>/);
  assert.doesNotMatch(hero, /Join Us/);
  assert.match(footer, /<Brand href="\/" \/>/);
  assert.match(footer, /\{ label: "Home", href: "\/" \}/);
  assert.match(footer, /\{ label: "Careers", href: "\/careers" \}/);
  assert.match(footer, /© 2026 InterFirst Technologies LLC/);
  assert.doesNotMatch(footer, /ActionLink|Join Us|socialChannels|LinkedIn|GitHub|>X</);
  assert.match(css, /\.site-footer__inner \{[\s\S]{0,180}grid-template-columns: minmax\(0, 1fr\) auto;[\s\S]{0,100}align-items: center;[\s\S]{0,100}padding: 64px 0 40px;/);
  assert.match(css, /\.site-footer__inner > \.brand \{[\s\S]{0,80}justify-self: start;/);
  assert.match(css, /\.site-footer__navigation \{[\s\S]{0,80}justify-self: end;/);
  assert.match(css, /\.action-link \{[\s\S]*?border-radius: 8px;/);
  assert.match(css, /--background: #fafaf8;/);
  assert.match(css, /--text: #18181b;/);
  assert.match(css, /--text-main: #334155;/);
  assert.match(css, /--text-secondary: #64748b;/);
  assert.match(css, /--button-border: #1e3a5f;/);
  assert.match(css, /--button-background: #1e3a5f;/);
  assert.match(css, /--button-hover-background: #162b47;/);
  assert.match(css, /--button-pressed-background: #112136;/);
  assert.match(css, /--button-hover-text: #ffffff;/);
  assert.match(css, /\.home-experience \{[\s\S]{0,180}background: #fafafa;[\s\S]{0,140}--text: #0a0a0a;[\s\S]{0,100}--text-secondary: #6b7280;/);
  assert.match(css, /\.site-header \{[\s\S]{0,180}height: 72px;[\s\S]{0,100}border-bottom: 1px solid #eeeeee;/);
  assert.match(css, /\.desktop-navigation a \{[\s\S]{0,220}color: #6b7280;[\s\S]{0,80}font-size: 14px;[\s\S]{0,80}font-weight: 500;/);
  assert.match(css, /\.action-link--secondary \{[\s\S]{0,180}background: transparent;[\s\S]{0,80}color: var\(--accent\);/);
  assert.match(
    css,
    /\.action-link \{[\s\S]{0,260}border: 1px solid var\(--button-border\);[\s\S]{0,100}background: var\(--button-background\);[\s\S]{0,60}color: var\(--button-text\);/,
  );
  assert.doesNotMatch(
    css,
    /\.action-link--primary(?:\s*|:hover\s*)\{[^}]*box-shadow:/s,
  );
  assert.match(
    css,
    /\.action-link--primary:hover \{[\s\S]{0,180}background: var\(--button-hover-background\);[\s\S]{0,80}color: var\(--button-hover-text\);/,
  );
  assert.match(sectionCue, /CaretDown/);
  assert.match(sectionCue, /next-section-cue__symbol/);
  assert.match(sectionCue, /<CaretDown size=\{18\} weight="light" \/>/);
  assert.match(sectionCue, /window\.addEventListener\("scroll"/);
  assert.doesNotMatch(chapterLabel, /ArrowRight|<svg/);
  assert.match(css, /\.next-section-cue__symbol > svg/);
  assert.doesNotMatch(css, /\.chapter-label svg/);
});

test("keeps the desktop glow and adds one mobile-only Hero grid texture", async () => {
  const network = await readSource("src/components/HeroNetwork.jsx");
  const home = await readSource("src/components/HomePage.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(network, /aria-hidden="true"/);
  assert.match(network, /hero-network__glow/);
  assert.match(network, /hero-network__grid/);
  assert.match(css, /\.hero-network__glow \{[\s\S]{0,260}radial-gradient\([\s\S]{0,180}ellipse 68% 50%[\s\S]{0,100}rgb\(30 58 95 \/ 0\.07\)/);
  assert.match(css, /\.hero-network__grid \{\s*display: none;/);
  assert.match(
    css,
    /@media \(max-width: 640px\)[\s\S]*?\.hero-network__grid \{[\s\S]{0,180}display: block;[\s\S]{0,180}background-image: url\("\/brand\/home-mobile-grid\.png"\);[\s\S]{0,180}background-size: cover;[\s\S]{0,100}opacity: 0\.6;/,
  );
  assert.doesNotMatch(home, /AmbientEnvironment/);
  assert.doesNotMatch(network, /hero-network__sequence/);
  assert.doesNotMatch(network, /Product|Systems|Company/);
  assert.doesNotMatch(network, /canvas|requestAnimationFrame|setTimeout/);
});

test("keeps the minimal centered Hero composition restrained and desktop-specific", async () => {
  const hero = await readSource("src/components/Hero.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.hero__transition-plane \{[\s\S]{0,220}--section-transition-offset: 0px;/);
  assert.match(css, /\.hero__transition-plane \{[\s\S]{0,120}flex-direction: column;[\s\S]{0,100}align-items: center;/);
  assert.match(css, /\.hero__index \{[\s\S]{0,220}border-radius: 999px;/);
  assert.match(css, /\.hero__grid \{[\s\S]{0,260}width: min\(calc\(100% - 96px\), 900px\);[\s\S]{0,140}padding-block: 120px 100px;/);
  assert.match(css, /\.hero h1 \{[\s\S]{0,260}font-size: clamp\(72px, 5\.69vw, 86px\);[\s\S]{0,100}font-weight: 650;[\s\S]{0,100}line-height: 1\.05;[\s\S]{0,100}letter-spacing: -0\.03em;/);
  assert.match(css, /\.hero__content \{[\s\S]{0,160}margin-top: 16px;/);
  assert.match(css, /\.hero__support \{[\s\S]{0,180}margin-top: 24px;/);
  assert.match(css, /\.hero__description \{[\s\S]{0,220}max-width: 600px;[\s\S]{0,120}font-size: 19px;[\s\S]{0,100}line-height: 1\.5;/);
  assert.match(css, /\.hero__actions \{[\s\S]{0,160}margin-top: 32px;/);
  assert.match(hero, /We make/);
  assert.match(hero, /internet-first/);
  assert.equal((hero.match(/className="hero__line"/g) || []).length, 3);
  assert.match(hero, /className="sr-only">We make internet-first companies\.<\/span>/);
  assert.match(hero, /companies\.[\s\S]*systems\.[\s\S]*products\.[\s\S]*companies\./);
  assert.match(hero, /hero__rotator-sizer">companies\.<\/span>/);
  assert.equal((hero.match(/className="hero__rotator-face"/g) || []).length, 4);
  assert.match(css, /\.hero__rotator-viewport \{[\s\S]{0,220}overflow: clip;[\s\S]{0,80}clip-path: inset\(0\);[\s\S]{0,100}contain: paint;/);
  assert.match(css, /\.hero__rotator-face \{[\s\S]*backface-visibility: hidden;[\s\S]*rotateX\(calc\(var\(--face-index\) \* -90deg\)\) translateZ\(0\.525em\)[\s\S]{0,30}scale\(0\.935\)/);
  assert.match(css, /\.hero--intro-ready \.hero__rotator-cube \{[\s\S]{0,150}animation: hero-word-cube-roll 12s/);
  assert.match(css, /@keyframes hero-word-cube-roll \{[\s\S]*rotateX\(90deg\)[\s\S]*rotateX\(180deg\)[\s\S]*rotateX\(270deg\)/);
  assert.match(css, /\.hero--intro-ready \.hero__rotator-face \{[\s\S]{0,220}animation-duration: 12s;[\s\S]*animation-fill-mode: both;/);
  assert.match(css, /@keyframes hero-cube-face-four \{[\s\S]*95%[\s\S]*opacity: 0;[\s\S]*97%[\s\S]*opacity: 1;/);
  assert.match(
    css,
    /@media \(min-width: 769px\) \{[\s\S]*?\.hero__actions \.action-link:first-child \{[\s\S]{0,100}width: 190px;[\s\S]{0,60}min-height: 52px;[\s\S]*?\.hero \.next-section-cue \{[\s\S]{0,160}position: static;[\s\S]{0,100}margin-top: 80px;[\s\S]{0,160}font-size: 11px;/,
  );
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.hero__transition-plane \{[\s\S]{0,100}--section-transition-offset: 0px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.next-section-cue \{\s*display: none;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.hero__grid \{[\s\S]{0,140}justify-content: center;[\s\S]{0,100}padding-block: 64px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.hero__support \{[\s\S]{0,140}margin-top: 24px;[\s\S]*?\.hero__description \{\s*margin-top: 0;[\s\S]*?\.hero__actions \{[\s\S]{0,220}margin-top: 32px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.hero__actions \{[\s\S]{0,180}grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(
    css,
    /@media \(max-width: 430px\) \{[\s\S]*?\.hero__grid \{[\s\S]{0,180}width: calc\(100% - 48px\);[\s\S]{0,160}min-height: max\(75dvh, min\(520px, calc\(100dvh - 64px\)\)\);[\s\S]{0,100}justify-content: center;[\s\S]{0,100}padding-block: 40px 56px;/,
  );
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.hero__content \{\s*margin-top: 20px;/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.hero h1 \{[\s\S]{0,220}font-size: clamp\(42px, 11\.2vw, 46px\);[\s\S]{0,80}font-weight: 600;[\s\S]{0,80}line-height: 1\.1;[\s\S]{0,80}letter-spacing: -0\.02em;/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.hero__support \{\s*margin-top: 16px;[\s\S]*?\.hero__description \{[\s\S]{0,160}font-size: 16px;[\s\S]{0,80}line-height: 1\.5;[\s\S]*?\.hero__actions \{[\s\S]{0,120}margin-top: 24px;/);
  assert.match(css, /\.hero__description-mobile \{\s*display: none;/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.hero__description-desktop \{\s*display: none;[\s\S]*?\.hero__description-mobile \{\s*display: inline;/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.hero \.next-section-cue \{\s*display: none;\s*\}/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.hero__actions \.action-link:first-child \{[\s\S]{0,220}padding: 14px 24px;[\s\S]{0,100}font-size: 16px;[\s\S]{0,100}font-weight: 550;[\s\S]{0,80}line-height: 1\.2;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero__word,[\s\S]*?\.hero__actions \{[\s\S]{0,160}animation: none !important;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero__rotator-cube \{[\s\S]{0,120}animation: none !important;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero__rotator-face \{[\s\S]{0,80}animation: none !important;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero__rotator-face:not\(:first-child\) \{[\s\S]{0,80}display: none;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.next-section-cue__symbol \{[\s\S]{0,100}animation: none !important;/);
  assert.match(hero, /<ActionLink href="\/careers">\s*See Open Roles\s*<\/ActionLink>/);
  assert.doesNotMatch(hero, /showArrow|<Arrow/);
});

test("reveals every Home chapter's text through the hero-style clipped rise", async () => {
  const css = await readSource("src/app/globals.css");
  const reveal = await readSource("src/components/RevealText.jsx");
  const sections = await Promise.all(
    [
      "InternetFirstMeaningSection.jsx",
      "HowWeThinkSection.jsx",
      "HowWeBuildSection.jsx",
      "WhatWereBuildingSection.jsx",
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
});

test("unlocks Home chapter reveals in document order after the Hero completes", async () => {
  const home = await readSource("src/components/HomePage.jsx");
  const sections = await Promise.all([
    readSource("src/components/InternetFirstMeaningSection.jsx"),
    readSource("src/components/HowWeThinkSection.jsx"),
    readSource("src/components/HowWeBuildSection.jsx"),
    readSource("src/components/WhatWereBuildingSection.jsx"),
    readSource("src/components/CareersPreviewSection.jsx"),
  ]);

  assert.match(home, /const HERO_REVEAL_COMPLETE_MS = 2200;/);
  assert.match(home, /const CHAPTER_REVEAL_COMPLETE_MS = 1700;/);
  assert.match(
    home,
    /setChapterStage\(\(stage\) => Math\.max\(stage, 1\)\)[\s\S]{0,100}HERO_REVEAL_COMPLETE_MS/,
  );
  assert.match(
    home,
    /setChapterStage\(\(stage\) => Math\.max\(stage, chapterIndex \+ 1\)\)/,
  );
  assert.equal((home.match(/isRevealEnabled=\{chapterStage >= [1-5]\}/g) || []).length, 5);
  assert.equal((home.match(/onRevealEntered=\{handleChapterEntered\}/g) || []).length, 5);

  sections.forEach((section) => {
    assert.match(section, /hasEntered \|\| !isRevealEnabled/);
    assert.match(section, /onRevealEntered\?\.\(chapterIndex\)/);
    assert.match(
      section,
      /\[chapterIndex, hasEntered, isRevealEnabled, onRevealEntered\]/,
    );
  });
});

test("keeps What We're Building as a concise text-only exploration", async () => {
  const css = await readSource("src/app/globals.css");
  const section = await readSource(
    "src/components/WhatWereBuildingSection.jsx",
  );

  assert.match(
    section,
    /<span>Opportunities<\/span>\s*<span>worth exploring\.<\/span>/,
  );
  assert.match(section, /We follow problems worth solving—not industries or categories\./);
  assert.match(section, /Developer Tools/);
  assert.match(section, /Internet Platforms/);
  assert.doesNotMatch(section, /what-were-building__card|what-were-building__closing/);
  assert.match(
    css,
    /\.what-were-building__label \{[\s\S]{0,400}min-height: 28px;[\s\S]{0,160}border-radius: 999px;/,
  );
  assert.match(
    css,
    /\.what-were-building__title \{[\s\S]{0,160}max-width: 1000px;[\s\S]{0,80}margin: 24px auto 0;[\s\S]{0,120}font-size: clamp\(56px, 4\.8vw, 68px\);/,
  );
  assert.match(
    css,
    /\.what-were-building__opportunities \{[\s\S]{0,180}repeat\(6, minmax\(0, 1fr\)\);[\s\S]{0,100}column-gap: 24px;[\s\S]{0,100}row-gap: 32px;[\s\S]{0,100}margin: 64px 0 0;/,
  );
  assert.match(css, /\.what-were-building__opportunity \{\s*grid-column: span 2;/);
  assert.match(css, /\.what-were-building__opportunity:nth-child\(4\) \{\s*grid-column: 2 \/ span 2;/);
  assert.match(css, /\.what-were-building__opportunity:nth-child\(5\) \{\s*grid-column: 4 \/ span 2;/);
  assert.doesNotMatch(css, /\.what-were-building__card|\.what-were-building__closing|\.what-were-building__opportunity:hover/);
});

test("gives every mobile Home chapter one composed viewport without clipping growth", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.hero__grid \{[\s\S]*min-height: max\(75dvh, min\(520px, calc\(100dvh - 64px\)\)\);[\s\S]*justify-content: center;[\s\S]*padding-block: 40px 56px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.internet-first-meaning,[\s\S]*\.careers-preview \{[\s\S]*min-height: calc\(100dvh - 64px\);[\s\S]*align-items: center;/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*\.hero__content \{\s*margin-top: 20px;[\s\S]*\.hero__support \{\s*margin-top: 16px;[\s\S]*\.hero__actions \{[\s\S]{0,120}margin-top: 24px;/);
  assert.doesNotMatch(css, /\.hero__grid \{[\s\S]{0,140}padding-block: 40px 88px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.internet-first-meaning__inner \{[\s\S]*padding-block: 64px 32px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.what-were-building \{[\s\S]*display: block;[\s\S]*min-height: 0;/);
});

test("presents the Internet-first principles as a restrained static card grid", async () => {
  const section = await readSource(
    "src/components/InternetFirstMeaningSection.jsx",
  );
  const css = await readSource("src/app/globals.css");
  assert.match(css, /\.home-experience \{[\s\S]{0,180}background: #fafafa;/);
  assert.match(css, /\.hero \{[\s\S]{0,120}background: #fafafa;/);
  assert.match(css, /\.internet-first-meaning \{[\s\S]{0,180}background: #ffffff;/);
  assert.match(css, /\.how-we-think \{[\s\S]{0,180}background: #fafafa;/);
  assert.match(css, /\.how-we-build \{[\s\S]{0,180}background: #ffffff;/);
  assert.match(css, /\.what-were-building \{[\s\S]{0,180}background: #fafafa;/);
  assert.match(css, /\.careers-preview \{[\s\S]{0,120}background: #ffffff;/);
  assert.match(css, /\.site-footer \{[\s\S]{0,120}background: #fafafa;/);

  assert.match(section, /We build products, systems, and companies around/);
  assert.doesNotMatch(section, /consequence|Product and distribution begin together/);
  assert.match(section, /Explore our principles/);
  assert.match(section, /Internet-first is how we build\./);
  assert.match(section, /meaning-card-grid/);
  assert.equal((section.match(/meaning-card"/g) || []).length, 1);
  assert.doesNotMatch(section, /internet-first-meaning__divider/);
  assert.doesNotMatch(section, /tabIndex|aria-describedby/);
  assert.doesNotMatch(css, /\.internet-first-meaning__principle:hover/);
  assert.match(css, /\.internet-first-meaning__principle-description \{[\s\S]*opacity: 1;[\s\S]*transform: none;/);
  assert.match(css, /\.internet-first-meaning__intro \{\s*text-align: center;/);
  assert.match(css, /\.internet-first-meaning__label \{[\s\S]{0,260}min-height: 28px;[\s\S]{0,120}border-radius: 999px;/);
  assert.match(css, /\.internet-first-meaning__title \{[\s\S]{0,220}font-size: clamp\(56px, 4\.8vw, 68px\);[\s\S]{0,100}font-weight: 600;[\s\S]{0,80}line-height: 1\.05;/);
  assert.match(css, /\.internet-first-meaning__principles \{[\s\S]{0,240}repeat\(3, minmax\(0, 1fr\)\);[\s\S]{0,100}column-gap: 48px;[\s\S]{0,100}margin: 64px 0 0;/);
  assert.match(css, /\.meaning-card \{[\s\S]*min-height: 196px;[\s\S]*border: 1px solid var\(--border-strong\);[\s\S]*border-radius: 16px;[\s\S]*box-shadow:/);
  assert.match(css, /opacity 500ms ease-out calc\(var\(--principle-index\) \* 100ms/);
  assert.match(
    css,
    /\.internet-first-meaning__transition-plane \{\s*--section-transition-offset: 0px;[\s\S]*\.how-we-build__transition-plane \{\s*--section-transition-offset: 0px;/,
  );
});

test("uses one non-Hero editorial type hierarchy across every Home chapter", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /--home-section-heading-size: clamp\(56px, 4\.8vw, 68px\)/);
  assert.match(css, /--home-section-support-size: 19px/);
  assert.match(css, /--home-item-heading-size: 21px/);
  assert.match(css, /--home-item-body-size: 15px/);
  assert.match(
    css,
    /\.internet-first-meaning__title,[\s\S]{0,240}\.careers-preview__title[\s\S]{0,180}font-size: var\(--home-section-heading-size\);/,
  );
  assert.match(
    css,
    /\.internet-first-meaning__description,[\s\S]{0,220}\.careers-preview__description[\s\S]{0,180}font-size: var\(--home-section-support-size\);/,
  );
  assert.match(
    css,
    /\.internet-first-meaning__principle h3,[\s\S]{0,240}\.what-were-building__opportunity h3[\s\S]{0,180}font-size: var\(--home-item-heading-size\);/,
  );
  assert.match(
    css,
    /\.internet-first-meaning__principle-description,[\s\S]{0,260}\.what-were-building__opportunity > p[\s\S]{0,180}font-size: var\(--home-item-body-size\);/,
  );
  assert.match(css, /@media \(min-width: 769px\) and \(max-height: 980px\)[\s\S]*--home-section-heading-size: clamp\(52px, 4\.2vw, 60px\)[\s\S]*--home-section-support-size: 17px[\s\S]*--home-item-heading-size: 19px[\s\S]*--home-item-body-size: 14px/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*--home-section-heading-size: clamp\(36px, 10vw, 42px\)[\s\S]*--home-section-support-size: 16px[\s\S]*--home-item-heading-size: 20px[\s\S]*--home-item-body-size: 15px/);
  assert.doesNotMatch(css, /@media \(max-width: 640px\)[\s\S]*\.careers-preview__title \{[\s\S]{0,80}font-size:/);
  assert.match(css, /\.hero h1 \{[\s\S]{0,180}font-size: clamp/);
});

test("gives How We Think a faster circular carousel with centered dots", async () => {
  const section = await readSource("src/components/HowWeThinkSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(section, /Good products start with clarity\./);
  assert.doesNotMatch(section, /not bigger teams/);
  assert.match(section, /Every release should make the product better\./);
  assert.match(section, /const AUTOPLAY_DELAY_MS = 4000;/);
  assert.match(section, /const carouselPrinciples = \[/);
  assert.match(section, /principles\[principles\.length - 1\]/);
  assert.match(section, /\.\.\.principles/);
  assert.match(section, /principles\[0\]/);
  assert.match(section, /const \[displayIndex, setDisplayIndex\] = useState\(1\);/);
  assert.match(section, /setDisplayIndex\(\(index\) => index \+ 1\);/);
  assert.match(section, /displayIndex === principles\.length \+ 1/);
  assert.match(section, /alignSlide\(firstSlide, "auto"\);/);
  assert.match(section, /aria-hidden=\{isClone \? "true" : undefined\}/);
  assert.match(section, /aria-roledescription="carousel"/);
  assert.match(section, /isInteractionPaused \|\|\s*prefersReducedMotion/);
  assert.match(section, /alignSlide\(slide, prefersReducedMotion \? "auto" : "smooth"\);/);
  assert.doesNotMatch(section, /isPaused|setIsPaused|how-we-think__carousel-toggle|>Pause<|>Play</);
  assert.match(section, /className="how-we-think__carousel-dot"/);
  assert.match(css, /\.how-we-think__intro \{\s*text-align: center;/);
  assert.match(css, /\.how-we-think__label \{[\s\S]{0,260}min-height: 28px;[\s\S]{0,120}border-radius: 999px;/);
  assert.match(css, /\.how-we-think__title \{[\s\S]{0,160}max-width: 1000px;[\s\S]{0,80}margin: 24px auto 0;[\s\S]{0,120}font-size: clamp\(56px, 4\.8vw, 68px\);/);
  assert.match(css, /\.how-we-think__carousel-track \{[\s\S]*display: flex;[\s\S]*gap: 24px;[\s\S]*padding: 0 120px;/);
  assert.match(css, /\.how-we-think__carousel-card\[data-active="true"\] \{[\s\S]*border-color: var\(--accent\);[\s\S]*opacity: 1;/);
  assert.match(css, /\.how-we-think__carousel-dot \{[\s\S]*width: 44px;[\s\S]*min-height: 44px;/);
  assert.match(css, /\.how-we-think__carousel-dot\[aria-pressed="true"\]::before \{[\s\S]*width: 22px;[\s\S]*background: var\(--accent\);/);
  assert.doesNotMatch(css, /\.how-we-think__carousel-toggle/);
});

test("gives How We Build a compact responsive 3 by 2 step-card grid", async () => {
  const section = await readSource("src/components/HowWeBuildSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(section, /Clear process\./);
  assert.match(section, /No shortcuts\./);
  assert.match(section, /A simple system keeps us focused, deliberate, and improving\./);
  assert.match(section, /Understand the problem\./);
  assert.match(section, /Keep making it better\./);
  assert.match(section, /className="how-we-build__process how-we-build__reveal"/);
  assert.match(section, /className="how-we-build__step-meta"/);
  assert.match(section, /Step \{step\.number\}/);
  assert.doesNotMatch(section, /how-we-build__number/);
  assert.doesNotMatch(section, /marquee|isMarqueePaused|duplicate|Pause movement/);
  assert.doesNotMatch(section, /gsap|ScrollTrigger|timelinePath|<svg|how-we-build__marker/);
  assert.match(css, /\.how-we-build__label \{[\s\S]{0,260}min-height: 28px;[\s\S]{0,120}border-radius: 999px;/);
  assert.match(css, /\.how-we-build__title \{[\s\S]{0,160}max-width: 1000px;[\s\S]{0,80}margin: 24px auto 0;[\s\S]{0,120}font-size: clamp\(56px, 4\.8vw, 68px\);/);
  assert.match(css, /\.how-we-build__process \{[\s\S]{0,180}grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[\s\S]{0,100}column-gap: 16px;[\s\S]{0,60}row-gap: 8px;[\s\S]{0,80}margin: 16px 0 0;/);
  assert.match(css, /\.how-we-build__step \{[\s\S]{0,220}min-height: 132px;[\s\S]{0,180}padding: 24px;[\s\S]{0,80}border: 1px solid #eeeeee;[\s\S]{0,80}border-left: 4px solid var\(--accent\);[\s\S]{0,80}border-radius: 14px;[\s\S]{0,100}box-shadow: none;/);
  assert.match(css, /\.how-we-build__step-meta \{[\s\S]{0,180}background: var\(--accent-soft\);[\s\S]{0,80}color: var\(--accent\);[\s\S]{0,160}font-size: 11px;/);
  assert.match(css, /\.how-we-build__step h3 \{[\s\S]{0,120}margin: 8px 0 0;[\s\S]{0,120}font-size: 23px;/);
  assert.match(css, /\.how-we-build__step p \{[\s\S]{0,120}margin: 4px 0 0;[\s\S]{0,120}color: #6b7280;[\s\S]{0,80}font-size: 15px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.how-we-build__process \{[\s\S]{0,120}grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.how-we-build__process \{[\s\S]{0,80}grid-template-columns: 1fr;/);
  assert.doesNotMatch(css, /\.how-we-build__path|\.how-we-build__marker|\.how-we-build__step:hover/);
});

test("removes the Why InterFirst chapter and reconnects the Home flow", async () => {
  const home = await readSource("src/components/HomePage.jsx");
  const header = await readSource("src/components/SiteHeader.jsx");
  const continuity = await readSource("src/components/SectionContinuity.jsx");
  const opportunities = await readSource("src/components/WhatWereBuildingSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.doesNotMatch(home, /WhyInterFirstSection|why-interfirst/);
  assert.doesNotMatch(header, /#why-interfirst|>About</);
  assert.doesNotMatch(continuity, /#why-interfirst|why-interfirst__/);
  assert.match(opportunities, /<NextSectionCue href="#careers" label="View careers" \/>/);
  assert.doesNotMatch(css, /\.why-interfirst/);
});

test("gives every major desktop Home section one consistent scroll indicator", async () => {
  const hero = await readSource("src/components/Hero.jsx");
  const meaning = await readSource(
    "src/components/InternetFirstMeaningSection.jsx",
  );
  const thinking = await readSource("src/components/HowWeThinkSection.jsx");
  const building = await readSource("src/components/HowWeBuildSection.jsx");
  const opportunities = await readSource(
    "src/components/WhatWereBuildingSection.jsx",
  );
  const careers = await readSource("src/components/CareersPreviewSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(hero, /Scroll to explore/);
  assert.match(meaning, /Explore our principles/);
  assert.match(thinking, /See how we build/);
  assert.match(building, /See what we're building/);
  assert.match(opportunities, /View careers/);
  assert.doesNotMatch(careers, /NextSectionCue/);
  assert.match(
    careers,
    /<ActionLink href="\/careers">\s*See Open Roles\s*<\/ActionLink>/,
  );
  assert.doesNotMatch(careers, /<ActionLink href="\/careers" showArrow>/);
  assert.match(css, /@keyframes next-section-cue-idle/);
  assert.match(css, /\.next-section-cue:hover \.next-section-cue__symbol \{[\s\S]*translateY\(4px\)/);
  assert.match(css, /\.careers-preview__transition-plane \{\s*text-align: center;/);
  assert.doesNotMatch(css, /\.careers-preview__transition-plane \{[\s\S]{0,180}grid-template-columns:/);
  assert.match(css, /\.careers-preview__transition-plane\.section-transition__plane \{[\s\S]{0,100}clip-path: none;[\s\S]{0,60}transform: none;/);
  assert.match(careers, /Care about craft\?/);
  assert.match(careers, /Build with us\./);
  assert.doesNotMatch(careers, /Open positions|perfect role today/);
});
