import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../", import.meta.url);
const readSource = (path) => readFile(new URL(path, appRoot), "utf8");

test("renders the current InterFirst content without an opening logo reveal", async () => {
  const home = await readSource("src/components/HomePage.jsx");
  const hero = await readSource("src/components/Hero.jsx");

  assert.match(home, /className="home-experience home-experience--ready"/);
  assert.match(home, /<SiteHeader \/>/);
  assert.doesNotMatch(home, /brand-loader|hasPlayedHomeIntro|introPhase|Brand animation="intro"/);
  assert.match(hero, /We make/);
  assert.match(hero, /internet-first/);
  assert.match(hero, /companies\./);
  assert.match(hero, /<span>We design the product, systems, and company<\/span>/);
  assert.match(hero, /<span>as one connected whole from day one\.<\/span>/);
  assert.match(hero, /See Open Roles/);
  assert.doesNotMatch(hero, /hero__rotator/);
  assert.doesNotMatch(hero, /NextSectionCue/);
});

test("lets every Home section observe its own viewport entry", async () => {
  const home = await readSource("src/components/HomePage.jsx");

  assert.doesNotMatch(home, /chapterStage|HERO_REVEAL_COMPLETE_MS|CHAPTER_REVEAL_COMPLETE_MS|isRevealEnabled=\{chapterStage/);
  assert.match(home, /<InternetFirstMeaningSection \/>/);
  assert.match(home, /<HowWeThinkSection \/>/);
  assert.match(home, /<HowWeBuildSection \/>/);
  assert.match(home, /<WhatWereBuildingSection \/>/);
  assert.match(home, /<CareersPreviewSection \/>/);
});

test("fits the mobile Careers preview and footer into one usable viewport", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience \.careers-preview__inner \{ min-height: calc\(100svh - 68px - 196px\); align-content: center; padding: 64px var\(--layout-gutter\); border-radius: 0; \}/);
  assert.match(css, /@media \(max-width: 360px\) \{[\s\S]*?\.home-experience \.careers-preview__inner \{[\s\S]*?padding: 16px var\(--layout-gutter\);/);
});

test("uses 10px corners for shared cards, panels, and buttons", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /Shared corner rule: cards, panels, boxes, and actionable buttons use one 10px radius/);
  assert.match(css, /\.action-link,[\s\S]*?\.meaning-card,[\s\S]*?\.how-we-build__step,[\s\S]*?\.application-primary-action,[\s\S]*?border-radius: 10px;/);
});

test("keeps the primary navigation and Careers conversion target", async () => {
  const header = await readSource("src/components/SiteHeader.jsx");

  assert.doesNotMatch(header, /Principles|Building|desktop-navigation/);
  assert.match(header, /href="\/careers"/);
  assert.match(header, />\s*View Careers\s*</);
  assert.doesNotMatch(header, /menu-button|mobile-navigation|menuOpen/);
});

test("applies responsive InterFirst background beams to the hero", async () => {
  const css = await readSource("src/app/globals.css");
  const heroNetwork = await readSource("src/components/HeroNetwork.jsx");
  const beams = await readSource("src/components/ui/background-beams.tsx");
  const careersPreview = await readSource("src/components/CareersPreviewSection.jsx");
  const home = await readSource("src/components/HomePage.jsx");

  assert.match(css, /Home remodel: centered learning-style composition/);
  assert.match(css, /--accent: #163e6b/);
  assert.doesNotMatch(css, /brand-loader|brand-module-intro|brand-name-intro/);
  assert.match(css, /html \{[\s\S]{0,100}scrollbar-gutter: stable;/);
  assert.match(heroNetwork, /<BackgroundBeams className="hero-beams" \/>/);
  assert.match(beams, /from "motion\/react"/);
  assert.match(beams, /export const BackgroundBeams/);
  assert.match(careersPreview, /<Brand decorative className="careers-preview__watermark" \/>/);
  assert.match(careersPreview, /<BackgroundBeams className="careers-preview__beams" \/>/);
  assert.match(careersPreview, /<ActionLink href="\/careers">See Open Roles<\/ActionLink>/);
  assert.match(home, /<div className="home-closing" aria-label="InterFirst closing section">/);
  assert.match(css, /\.home-experience \.hero-beams linearGradient stop:nth-of-type\(2\) \{ stop-color: #163e6b; \}/);
  assert.match(css, /main > section:not\(.hero\):not\(.mobile-home-hero\):not\(.careers-preview\)/);
  assert.match(css, /\.home-experience \.hero h1 \{[\s\S]{0,300}font-size: clamp\(60px, 6\.15vw, 94px\)/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]{0,1800}\.home-experience \.mobile-home-hero__beams,[\s\S]{0,220}\.home-experience \.careers-preview__beams \{[\s\S]{0,180}inset: -12%;[\s\S]{0,100}opacity: \.82;[\s\S]{0,140}will-change: transform;/);
  assert.match(css, /\.home-experience \.mobile-home-hero__action \{[\s\S]{0,220}width: min\(calc\(100vw - 90px\), 318px\);/);
  assert.match(css, /home-experience--revealing, \.home-experience--ready\) \.hero__line/);
});

test("starts the Hero background beams immediately on load", async () => {
  const beams = await readSource("src/components/ui/background-beams.tsx");

  assert.match(beams, /\.filter\(\(_, index\) => index % 3 === 0\)/);
  assert.match(beams, /d=\{paths\.join\(" "\)\}/);
  assert.match(beams, /strokeOpacity="0\.07"/);
  assert.match(beams, /strokeOpacity="0\.25"/);
  assert.match(beams, /initial=\{\{[\s\S]{0,120}x1: "-20%",[\s\S]{0,80}x2: "20%",[\s\S]{0,80}y1: "-20%",[\s\S]{0,80}y2: "20%"/);
  assert.match(beams, /repeat: Infinity,[\s\S]{0,40}delay: 0,/);
  assert.doesNotMatch(beams, /Math\.random/);
});

test("keeps the mobile Hero and final CTA beam treatments visible", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience \.hero-beams \{ opacity: \.62; \}/);
  assert.match(css, /\.home-experience \.careers-preview__beams \{ position: absolute;[\s\S]{0,120}opacity: \.64;/);
  assert.match(css, /\.home-experience \.mobile-home-hero__beams,[\s\S]{0,220}\.home-experience \.careers-preview__beams \{[\s\S]{0,180}inset: -12%;[\s\S]{0,100}opacity: \.82;[\s\S]{0,140}will-change: transform;/);
  assert.match(css, /\.home-experience \.mobile-home-hero__beams svg > path:nth-of-type\(n \+ 3\),[\s\S]{0,180}\.home-experience \.careers-preview__beams svg > path:nth-of-type\(n \+ 3\) \{ stroke-opacity: \.8; \}/);
});

test("uses the shared cube-roll reveal and Hero support animation", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /--motion-hero-word-rotate: -90deg;/);
  assert.match(css, /--motion-section-reveal-duration: 360ms;/);
  assert.match(css, /--motion-section-text-duration: 420ms;/);
  assert.match(css, /\.scroll-text-reveal__content \{[\s\S]{0,500}transform-style: preserve-3d;[\s\S]{0,120}backface-visibility: hidden;/);
  assert.match(css, /\.home-experience \.hero__line \{[\s\S]{0,260}rotateX\(var\(--motion-hero-word-rotate\)\)/);
  assert.match(css, /\.home-experience:is\(\.home-experience--revealing, \.home-experience--ready\) \.hero__line \{ animation: hero-word-rise 840ms/);
  assert.match(css, /hero__support \{ animation: hero-support-rise 620ms[\s\S]{0,120}var\(--motion-hero-support-delay\)/);
  assert.match(css, /--motion-hero-support-delay: 1080ms;/);
  assert.match(css, /\.home-experience:is\(\.home-experience--revealing, \.home-experience--ready\) \.hero__actions \{ animation: hero-support-rise 520ms[\s\S]{0,160}\+ 150ms\)/);
});

test("keeps the Home navigation and content containers on one gutter", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience \.site-header__inner \{ width: min\(calc\(100% - \(var\(--layout-gutter\) \* 2\)\), 1080px\); grid-template-columns: 1fr auto; \}/);
  assert.match(css, /\.action-link\.site-header__mobile-careers \{ display: none; \}/);
  assert.match(css, /\.home-experience \.site-header \{ height: 92px;/);
  assert.match(css, /\.home-experience \.action-link\.site-header__cta \{ width: 164px; min-height: 50px; padding-inline: 24px; border-radius: 10px; font-size: 16px;/);
  assert.match(css, /\.home-experience \.internet-first-meaning__inner,[\s\S]{0,220}\.home-experience \.site-footer__inner \{[\s\S]{0,180}width: min\(calc\(100% - \(var\(--layout-gutter\) \* 2\)\), 1080px\);/);
});

test("keeps the Hero heading on three authored lines", async () => {
  const css = await readSource("src/app/globals.css");
  const hero = await readSource("src/components/Hero.jsx");

  assert.match(hero, /<span className="hero__line">We make<\/span>/);
  assert.match(hero, /<span className="hero__line hero__line--accent">internet-first<\/span>/);
  assert.match(hero, /<span className="hero__line">companies\.<\/span>/);
  assert.match(css, /\.home-experience \.hero__line \{ display: block;/);
  assert.match(css, /\.home-experience \.hero h1 \{[\s\S]{0,180}font-weight: 620;/);
});

test("centers the complete Home Hero group vertically", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience \.hero__grid \{[\s\S]{0,140}display: grid;[\s\S]{0,100}align-items: center;[\s\S]{0,100}padding-block: 0;/);
  assert.match(css, /@media \(min-width: 769px\)[\s\S]{0,180}\.home-experience \.hero__transition-plane \{\s*transform: translateY\(-32px\) !important;/);
});

test("uses a standalone content-sized mobile Home Hero with chapter-style reveals", async () => {
  const hero = await readSource("src/components/Hero.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(hero, /<section className="mobile-home-hero mobile-home-hero--entered" aria-labelledby="mobile-hero-title">/);
  assert.match(hero, /<RevealText as="span" delay=\{70\}>We make<\/RevealText>/);
  assert.match(hero, /<RevealText as="div" className="mobile-home-hero__action-reveal" delay=\{350\}>/);
  assert.match(hero, /<BackgroundBeams className="mobile-home-hero__beams" \/>/);
  assert.match(css, /\.home-experience \.hero--desktop \{ display: none; \}/);
  assert.match(css, /html\[data-scroll-behavior="smooth"\] \{ scroll-behavior: auto; \}/);
  assert.match(css, /\.home-experience \{\s*--motion-section-text-duration: 620ms;\s*--motion-hero-word-easing: cubic-bezier\(\.22, 1, \.36, 1\);/);
  assert.match(css, /\.home-experience \.mobile-home-hero \{[\s\S]{0,260}display: block;[\s\S]{0,200}padding: 88px 0 96px;/);
  assert.match(css, /\.mobile-home-hero--entered \.scroll-text-reveal__content \{[\s\S]{0,180}animation: hero-word-rise var\(--motion-section-text-duration\)/);
  assert.match(css, /\.home-experience \.mobile-home-hero__action-reveal \{[\s\S]{0,180}margin: 33px auto 0;/);
  assert.match(css, /\.home-experience \.mobile-home-hero__action \{[\s\S]{0,220}width: min\(calc\(100vw - 90px\), 318px\);/);
  assert.doesNotMatch(css, /hero-mobile-fade/);
});

test("uses the shared section eyebrow and support paragraph treatment in the Hero", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience \.hero__index \{ min-height: 28px; padding: 5px 12px; border-color: #c9d8ea; background: rgb\(22 62 107 \/ 3%\); \}/);
  assert.match(css, /\.home-experience \.hero__index p \{ color: var\(--accent\); font-family: "Geist Mono Variable"/);
  assert.match(css, /\.home-experience \.hero__description \{ max-width: 620px; color: var\(--text-secondary\); font-size: var\(--home-section-support-size\); font-weight: 400; line-height: 1\.5; letter-spacing: -\.01em; \}/);
});

test("removes every scroll navigation indicator from the shared page and section surfaces", async () => {
  const home = await readSource("src/components/HomePage.jsx");
  const careers = await readSource("src/components/CareersPage.jsx");
  const think = await readSource("src/components/HowWeThinkSection.jsx");
  const build = await readSource("src/components/HowWeBuildSection.jsx");
  const building = await readSource("src/components/WhatWereBuildingSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.doesNotMatch(home, /PageScrollNavigator|Scroll to explore|Explore Our Principles|Explore our principles/);
  assert.doesNotMatch(careers, /PageScrollNavigator|Scroll Down|Scroll to/);
  assert.doesNotMatch(think, /NextSectionCue|See how we build/);
  assert.doesNotMatch(build, /NextSectionCue|See what we're building/);
  assert.doesNotMatch(building, /NextSectionCue|View careers/);
  assert.doesNotMatch(css, /next-section-cue|page-scroll-navigator|next-section-cue-idle/);
});

test("gives the final Careers CTA the shared eyebrow badge", async () => {
  const careersPreview = await readSource("src/components/CareersPreviewSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(careersPreview, /className="careers-preview__label careers-preview__reveal"/);
  assert.match(careersPreview, />\s*Careers\s*</);
  assert.match(css, /\.home-experience \.careers-preview__label \{ min-height: 28px; padding: 5px 12px; margin: 0; border: 1px solid #c9d8ea; border-radius: 999px;/);
});

test("uses the browser-window treatment only for What We're Building", async () => {
  const section = await readSource("src/components/WhatWereBuildingSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(section, /what-were-building__browser/);
  assert.match(section, /what-were-building__browser-header/);
  assert.match(section, /traffic-light--red/);
  assert.match(section, /traffic-light--yellow/);
  assert.match(section, /traffic-light--green/);
  assert.match(section, /what-were-building__browser-search/);
  assert.match(section, /what-were-building__browser-search-label/);
  assert.match(section, /WHAT WE&apos;RE BUILDING/);
  assert.doesNotMatch(section, /what-were-building__label|ChapterLabel/);
  assert.match(css, /\.home-experience main > section\.what-were-building \{[\s\S]{0,320}background-color: #f6f9fc;[\s\S]{0,320}radial-gradient\(circle at center, rgb\(22 62 107 \/ 5%\) 0%, rgb\(22 62 107 \/ 2%\) 35%, #f6f9fc 75%\),[\s\S]{0,160}linear-gradient\(to right/);
  assert.match(css, /\.what-were-building__transition-plane \{[\s\S]{0,320}background-image:[\s\S]{0,260}linear-gradient\(to right/);
  assert.match(css, /\.what-were-building__browser \{[\s\S]{0,260}border: 1px solid #e6ebf2;[\s\S]{0,120}border-radius: 30px;[\s\S]{0,220}background: #ffffff;[\s\S]{0,220}box-shadow:/);
  assert.match(css, /\.what-were-building__browser-header \{[\s\S]{0,220}background: #f7f7f8;[\s\S]{0,140}border-bottom: 1px solid #e6ebf2;/);
  assert.match(css, /\.what-were-building__browser-search \{[\s\S]{0,180}width: clamp\(220px, 30vw, 400px\);[\s\S]{0,160}border-radius: 999px;/);
  assert.match(css, /\.what-were-building__browser-search-label \{[\s\S]{0,220}font-family: "Geist Mono Variable"/);
  assert.match(css, /\.what-were-building__browser-search-label \{[\s\S]{0,300}text-align: center;/);
  assert.match(css, /\.what-were-building__browser-search-icon \{[\s\S]{0,120}position: absolute;[\s\S]{0,80}right: 12px;/);
  assert.match(css, /\.what-were-building__opportunity h3::after \{[\s\S]{0,180}transform: scaleX\(0\);/);
  assert.match(css, /\.what-were-building__opportunity:hover \.what-were-building__opportunity-number,[\s\S]{0,180}text-shadow:/);
  assert.doesNotMatch(css, /\.what-were-building__opportunity \{[\s\S]{0,220}box-shadow:/);
});

test("updates only the principle card boxes with the reference treatment", async () => {
  const section = await readSource("src/components/InternetFirstMeaningSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.doesNotMatch(section, /meaning-card__icon|meaning-card__rule/);
  assert.match(css, /\.meaning-card \{\s*display: flex;\s*min-height: 196px;[\s\S]{0,220}border-radius: 16px;[\s\S]{0,100}box-shadow: none;/);
  assert.match(css, /\.home-experience \.meaning-card,[\s\S]{0,160}\.home-experience \.how-we-think__carousel-card,[\s\S]{0,160}\.home-experience \.how-we-build__step \{[\s\S]{0,160}background: #FFFFFF;/);
  assert.match(css, /\.home-experience \.meaning-card:hover,[\s\S]{0,180}border-color: #163e6b;[\s\S]{0,120}transform: translateY\(-6px\);/);
});

test("drives the Internet-first cards from native vertical scroll within a scoped sticky frame", async () => {
  const section = await readSource("src/components/InternetFirstMeaningSection.jsx");
  const styles = await readSource("src/components/InternetFirstMeaningSection.module.css");

  assert.match(section, /window\.addEventListener\("scroll", requestUpdate, \{ passive: true \}\)/);
  assert.match(section, /new ResizeObserver\(requestUpdate\)/);
  assert.match(section, /prefers-reduced-motion: reduce/);
  assert.match(section, /window\.innerWidth <= 768/);
  assert.match(section, /const desktopCardTimings = \[/);
  assert.match(section, /--meaning-card-entry-x/);
  assert.match(section, /const entryDistance = window\.innerWidth \+ card\.offsetWidth;/);
  assert.match(section, /\$\{\(entryDistance \* \(1 - entryProgress\)\)\.toFixed\(2\)\}px/);
  assert.doesNotMatch(section, /setProperty\(\s*"--meaning-card-blur"/);
  assert.doesNotMatch(section, /Math\.round\(resolvedPosition/);
  assert.doesNotMatch(section, /NextSectionCue/);
  assert.match(styles, /\.section \{ display: block; min-height: 500vh; overflow: clip; \}/);
  assert.match(styles, /\.stickyFrame \{ position: sticky; top: 0; height: 100vh; overflow: hidden; \}/);
  assert.match(styles, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); gap: clamp\(32px, 3vw, 48px\);/);
  assert.match(styles, /min-height: clamp\(220px, 26vh, 260px\);/);
  assert.match(styles, /filter: none !important; transform: translate3d\(var\(--meaning-card-entry-x, 150vw\)/);
  assert.doesNotMatch(styles, /filter: blur/);
  assert.match(styles, /border-color: color-mix\(in srgb, var\(--border-strong\) 82%, var\(--accent\)\); outline: 1px solid color-mix\(in srgb, var\(--border-strong\) 82%, var\(--accent\)\); outline-offset: -1px;/);
  assert.match(styles, /\.card\[data-active\] \{[\s\S]{0,180}outline-color: color-mix/);
  assert.match(styles, /@media \(max-width: 768px\) \{ .section, .scrollSpace \{ min-height: 400vh; height: 400vh; \}/);
  assert.match(styles, /@media \(max-width: 768px\)[\s\S]{0,900}\.track \{ top: clamp\(352px, 43\.15vh, 366px\); display: flex;[\s\S]{0,180}gap: 32px; transform: translate3d\(var\(--meaning-track-x, 150vw\), 0, 0\); \}/);
  assert.match(styles, /width: min\(86vw, 380px\);[\s\S]{0,180}filter: none !important;/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\) \{ .section, .scrollSpace \{ min-height: 0; height: auto; overflow: visible; \}/);
});

test("uses the white background for Home cards", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience \.meaning-card,[\s\S]{0,160}\.home-experience \.how-we-think__carousel-card,[\s\S]{0,160}\.home-experience \.how-we-build__step \{[\s\S]{0,160}background: #FFFFFF;/);
});

test("loops How We Think from the fourth principle back to the first", async () => {
  const section = await readSource("src/components/HowWeThinkSection.jsx");

  assert.match(section, /const carouselPrinciples = \[\s*principles\[principles\.length - 1\],[\s\S]*principles\[0\],\s*\];/);
  assert.match(section, /setActiveIndex\(\(index\) => \(index \+ 1\) % principles\.length\);/);
  assert.match(section, /if \(displayIndex === principles\.length \+ 1\)/);
  assert.match(section, /const firstSlide = slideRefs\.current\[1\];/);
  assert.match(section, /setActiveIndex\(0\);/);
  assert.match(section, /setDisplayIndex\(1\);/);
});

test("uses 10px corners for Home cards and buttons", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience :is\(\.meaning-card, \.how-we-think__carousel-card, \.how-we-build__step, \.action-link\) \{\s*border-radius: 10px;/);
});

test("uses the reference text hierarchy inside Home cards", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience :is\(\.meaning-card, \.how-we-think__carousel-card, \.how-we-build__step, \.what-were-building__opportunity\) :is\([\s\S]{0,300}font-size: 11px;/);
  assert.match(css, /\.home-experience :is\(\.meaning-card, \.how-we-think__carousel-card, \.how-we-build__step, \.what-were-building__opportunity\) h3 \{[\s\S]{0,180}font-size: 21px;[\s\S]{0,100}font-weight: 600;[\s\S]{0,80}line-height: 1\.2;/);
  assert.match(css, /\.home-experience :is\(\.meaning-card, \.how-we-think__carousel-card, \.how-we-build__step, \.what-were-building__opportunity\) p \{[\s\S]{0,140}font-size: 14px;[\s\S]{0,80}line-height: 1\.5;/);
});

test("centers mobile How We Build card content without changing desktop", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /@media \(max-width: 768px\)[\s\S]{0,1800}\.how-we-build__step \{\s*align-items: center;\s*text-align: center;/);
  assert.doesNotMatch(css, /\.how-we-build__step:nth-child\((?:odd|even)\)/);
});

test("lets mobile footer legal copy span the full bottom row", async () => {
  const footer = await readSource("src/components/SiteFooter.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(footer, /<\/nav>\s*<p className="site-footer__tagline">[\s\S]*<\/p>\s*<p className="site-footer__legal">/);
  assert.match(css, /\.home-experience \.site-footer__tagline \{ grid-column: 1 \/ -1; width: 100%; text-align: center; \}/);
  assert.match(css, /\.home-experience \.site-footer__legal \{ width: 100%; justify-self: stretch; margin-top: 0; \}/);
});

test("centers the desktop footer tagline directly above the legal line", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /@media \(min-width: 769px\) \{[\s\S]{0,600}\.home-experience \.site-footer__inner \{ column-gap: clamp\(28px, 7vw, 96px\); row-gap: 12px; padding: 32px 0 16px; \}[\s\S]{0,240}\.home-experience \.site-footer__tagline \{ grid-column: 1 \/ -1; grid-row: 2; width: 100%; margin: 8px 0 0; text-align: center; \}/);
});

test("fits the desktop final CTA and footer within one viewport", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /@media \(min-width: 769px\) \{\s*\.home-experience \.home-closing \{ display: grid; min-height: 100svh; grid-template-rows: minmax\(0, 1fr\) auto; \}\s*\.home-experience \.home-closing \.careers-preview \{ display: grid; min-height: 0; height: auto; \}\s*\.home-experience \.home-closing \.careers-preview__inner \{ min-height: 0; height: 100%; \}/);
});
