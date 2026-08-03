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
  assert.match(header, /data-open=\{menuOpen\}/);
  assert.match(header, /inert=\{!menuOpen\}/);
  assert.match(header, /document\.documentElement\.style\.overflow = "hidden"/);
  assert.match(header, /region\.setAttribute\("inert", ""\)/);
  assert.match(header, /event\.key !== "Tab"/);
  assert.match(header, /window\.matchMedia\("\(min-width: 961px\)"\)/);
  assert.match(css, /\.mobile-navigation \{[\s\S]*inset: 0;[\s\S]*min-height: 100dvh;/);
  assert.match(css, /\.mobile-navigation__inner \{[\s\S]*min-height: 100dvh;/);
  assert.match(css, /\.menu-button \{[\s\S]*width: 48px;[\s\S]*min-height: 48px;/);
  assert.match(css, /\.menu-button\[aria-expanded="true"\][\s\S]*rotate\(45deg\)[\s\S]*rotate\(-45deg\)/);
  assert.match(css, /\.mobile-navigation \{[\s\S]*translate3d\(0, -100%, 0\)[\s\S]*transform 520ms/);
  assert.match(css, /\.mobile-navigation\[data-open="true"\][\s\S]*translate3d\(0, 0, 0\)/);
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
  assert.doesNotMatch(header, /Explore careers/);
  assert.doesNotMatch(
    header,
    /className="site-header__cta"[\s\S]{0,120}showArrow/,
  );
  assert.match(
    hero,
    /We design the product, systems, and company as one connected whole from/,
  );
  assert.doesNotMatch(hero, /InterFirst is a studio/);
  assert.doesNotMatch(hero, /Read our principles/);
  assert.match(hero, /<ActionLink href="\/careers">\s*See Open Roles\s*<\/ActionLink>/);
  assert.doesNotMatch(hero, /<ActionLink href="\/careers" showArrow>/);
  assert.doesNotMatch(hero, /Join Us/);
  assert.match(
    footer,
    /<ActionLink[\s\S]*className="site-footer__cta"[\s\S]*href="\/careers"[\s\S]*>\s*Join Us\s*<\/ActionLink>/,
  );
  assert.doesNotMatch(footer, /className="site-footer__cta"[\s\S]{0,120}showArrow/);
  assert.doesNotMatch(footer, /className="site-footer__cta"[\s\S]{0,120}variant="quiet"/);
  assert.match(css, /\.action-link \{[\s\S]*?border-radius: 8px;/);
  assert.match(css, /--button-border: #232323;/);
  assert.match(css, /--button-hover-text: #fafaf8;/);
  assert.match(
    css,
    /\.action-link \{[\s\S]{0,260}border: 1\.5px solid var\(--button-border\);[\s\S]{0,100}background: transparent;[\s\S]{0,60}color: var\(--button-text\);/,
  );
  assert.match(
    css,
    /\.action-link--primary:hover \{[\s\S]{0,180}background: var\(--button-hover-background\);[\s\S]{0,80}color: var\(--button-hover-text\);/,
  );
  assert.doesNotMatch(sectionCue, /ArrowDown|<svg/);
  assert.match(sectionCue, /next-section-cue__symbol/);
  assert.match(sectionCue, /<span>&gt;<\/span>/);
  assert.match(sectionCue, /window\.addEventListener\("scroll"/);
  assert.doesNotMatch(chapterLabel, /ArrowRight|<svg/);
  assert.doesNotMatch(css, /\.next-section-cue svg/);
  assert.doesNotMatch(css, /\.chapter-label svg/);
});

test("keeps the Home hero background static and decorative", async () => {
  const network = await readSource("src/components/HeroNetwork.jsx");

  assert.match(network, /aria-hidden="true"/);
  assert.match(network, /hero-network__grid/);
  assert.doesNotMatch(network, /hero-network__sequence/);
  assert.doesNotMatch(network, /Product|Systems|Company/);
  assert.doesNotMatch(network, /canvas|requestAnimationFrame|setTimeout/);
});

test("keeps the premium Hero composition restrained and desktop-specific", async () => {
  const hero = await readSource("src/components/Hero.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.hero__transition-plane \{[\s\S]{0,220}--section-transition-offset: -32px;/);
  assert.match(css, /\.hero__index \{[\s\S]{0,100}bottom: calc\(100% \+ 32px\);/);
  assert.match(css, /\.hero__support \{[\s\S]{0,80}top: 0;/);
  assert.match(css, /\.hero-network__grid \{[\s\S]{0,180}rgba\(24, 45, 82, 0\.037\)/);
  assert.match(
    css,
    /@media \(min-width: 769px\) \{[\s\S]*?\.hero__support \{[\s\S]{0,80}left: clamp\(-72px, -5vw, -50px\);[\s\S]*?\.hero__actions \{[\s\S]{0,60}margin-top: 38px;[\s\S]*?\.hero__actions \.action-link:first-child \{[\s\S]{0,100}width: 190px;[\s\S]{0,60}min-height: 56px;[\s\S]*?\.hero \.next-section-cue \{[\s\S]{0,100}color: #565b63;[\s\S]{0,60}font-size: 11px;/,
  );
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.hero__transition-plane \{[\s\S]{0,100}--section-transition-offset: 0px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.next-section-cue \{\s*display: none;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.hero__grid \{[\s\S]{0,140}justify-content: center;[\s\S]{0,100}padding-block: clamp\(40px, 7dvh, 64px\);/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.hero__support \{[\s\S]{0,140}margin-top: 32px;[\s\S]*?\.hero__description \{\s*margin-top: 0;[\s\S]*?\.hero__actions \{\s*margin-top: 24px;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero__word,[\s\S]*?\.hero__actions \{[\s\S]{0,160}animation: none !important;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.next-section-cue__symbol \{[\s\S]{0,100}animation: none !important;/);
  assert.match(hero, /<ActionLink href="\/careers">\s*See Open Roles\s*<\/ActionLink>/);
  assert.doesNotMatch(hero, /showArrow|<Arrow/);
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
    /@media \(min-width: 769px\) and \(max-height: 980px\)[\s\S]*\.what-were-building__inner \{[\s\S]*display: grid;[\s\S]*align-items: center;[\s\S]*height: 100%;[\s\S]*padding-block: 0 64px;/,
  );
  assert.match(
    css,
    /@media \(min-width: 769px\) and \(max-width: 900px\) and \(max-height: 980px\)[\s\S]*\.what-were-building__grid \{[\s\S]*repeat\(5, minmax\(0, 1fr\)\)/,
  );
  assert.match(
    css,
    /@media \(min-width: 769px\) and \(max-height: 980px\)[\s\S]*\.internet-first-meaning__inner \{[\s\S]*padding-block: clamp\(48px, 8vh, 80px\)/,
  );
});

test("gives every mobile Home chapter one composed viewport without clipping growth", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.hero__grid \{[\s\S]*min-height: calc\(100dvh - 64px\);[\s\S]*justify-content: flex-start;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.internet-first-meaning,[\s\S]*\.careers-preview \{[\s\S]*min-height: calc\(100dvh - 64px\);[\s\S]*align-items: center;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.hero__grid \{[\s\S]*min-height: calc\(100dvh - 64px\);[\s\S]*padding-block: 40px;/);
  assert.doesNotMatch(css, /\.hero__grid \{[\s\S]{0,140}padding-block: 40px 88px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.internet-first-meaning__inner \{[\s\S]*padding-block: 80px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.what-were-building__card \{[\s\S]*min-height: 0;/);
});

test("keeps the Internet-first principles concise and always readable", async () => {
  const section = await readSource(
    "src/components/InternetFirstMeaningSection.jsx",
  );
  const css = await readSource("src/app/globals.css");

  assert.match(section, /We build products, systems, and companies around/);
  assert.doesNotMatch(section, /consequence|Product and distribution begin together/);
  assert.match(section, /Explore our principles/);
  assert.match(section, /Internet-first is how we build\./);
  assert.doesNotMatch(section, /tabIndex|aria-describedby/);
  assert.doesNotMatch(css, /\.internet-first-meaning__principle:hover/);
  assert.match(css, /\.internet-first-meaning__principle-description \{[\s\S]*opacity: 1;[\s\S]*transform: none;/);
  assert.match(css, /\.internet-first-meaning__intro \{\s*text-align: center;/);
  assert.match(css, /opacity 500ms ease-out calc\(var\(--principle-index\) \* 100ms/);
  assert.match(
    css,
    /\.internet-first-meaning__transition-plane,[\s\S]*\.how-we-build__transition-plane \{\s*--section-transition-offset: -32px;/,
  );
});

test("uses one responsive heading scale across every non-hero Home section", async () => {
  const css = await readSource("src/app/globals.css");
  const sectionHeadings = [
    "internet-first-meaning__title",
    "how-we-think__title",
    "how-we-build__title",
    "what-were-building__title",
    "careers-preview__title",
  ];

  assert.match(css, /--home-section-heading-size: clamp\(44px, 3vw, 48px\)/);
  assert.match(css, /@media \(min-width: 769px\) and \(max-height: 980px\)[\s\S]*--home-section-heading-size: clamp\(38px, 3vw, 44px\)/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*--home-section-heading-size: clamp\(38px, 10\.5vw, 44px\)/);
  sectionHeadings.forEach((className) => {
    assert.match(
      css,
      new RegExp(`\\.${className} \\{[\\s\\S]{0,260}font-size: var\\(--home-section-heading-size\\);`),
    );
  });
  assert.match(css, /\.hero h1 \{[\s\S]{0,180}font-size: clamp/);
});

test("keeps the How We Think introduction concise and centered", async () => {
  const section = await readSource("src/components/HowWeThinkSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(section, /Good products start with clarity\./);
  assert.doesNotMatch(section, /not bigger teams/);
  assert.match(css, /\.how-we-think__intro \{\s*text-align: center;/);
  assert.match(css, /\.how-we-think__label \{\s*justify-content: center;/);
  assert.match(css, /\.how-we-think__title \{[\s\S]{0,120}max-width: 720px;[\s\S]{0,80}margin: 24px auto 0;/);
});

test("refreshes the How We Build scroll path after the Home intro unlocks", async () => {
  const section = await readSource("src/components/HowWeBuildSection.jsx");

  assert.match(section, /section\.closest\("\.home-experience"\)/);
  assert.match(section, /homeExperience\.dataset\.homeIntroPhase/);
  assert.match(section, /\["revealing", "ready"\]\.includes/);
  assert.match(section, /new MutationObserver/);
  assert.match(section, /attributeFilter: \["data-home-intro-phase"\]/);
  assert.match(section, /ScrollTrigger\.refresh\(\)/);
  assert.match(section, /introObserver\?\.disconnect\(\)/);
  assert.match(section, /window\.cancelAnimationFrame\(refreshFrame\)/);
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

  assert.match(hero, /Explore what internet-first means/);
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
  assert.match(
    css,
    /\.careers-preview__transition-plane \{[\s\S]*grid-template-columns: minmax\(0, 0\.55fr\) minmax\(0, 0\.45fr\);[\s\S]*gap: 48px;/,
  );
});
