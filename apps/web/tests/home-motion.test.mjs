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
  assert.match(css, /--accent: #5b3df5/);
  assert.doesNotMatch(css, /brand-loader|brand-module-intro|brand-name-intro/);
  assert.match(css, /html \{[\s\S]{0,100}scrollbar-gutter: stable;/);
  assert.match(heroNetwork, /<BackgroundBeams className="hero-beams" \/>/);
  assert.match(beams, /from "motion\/react"/);
  assert.match(beams, /export const BackgroundBeams/);
  assert.match(careersPreview, /<Brand decorative className="careers-preview__watermark" \/>/);
  assert.match(careersPreview, /<BackgroundBeams className="careers-preview__beams" \/>/);
  assert.match(careersPreview, /<ActionLink href="\/careers">See Open Roles<\/ActionLink>/);
  assert.match(home, /<div className="home-closing" aria-label="InterFirst closing section">/);
  assert.match(css, /\.home-experience \.hero-beams linearGradient stop:nth-of-type\(2\) \{ stop-color: #5b3df5; \}/);
  assert.match(css, /main > section:not\(.hero\):not\(.mobile-home-hero\):not\(.careers-preview\)/);
  assert.match(css, /\.home-experience \.hero h1 \{[\s\S]{0,300}font-size: clamp\(60px, 6\.15vw, 94px\)/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]{0,1800}\.home-experience \.mobile-home-hero__beams,[\s\S]{0,140}\.home-experience \.careers-preview__beams \{ inset: -12%; width: auto; height: auto; opacity: \.98; \}/);
  assert.match(css, /\.home-experience \.mobile-home-hero__action \{[\s\S]{0,220}width: min\(calc\(100vw - 90px\), 318px\);/);
  assert.match(css, /home-experience--revealing, \.home-experience--ready\) \.hero__line/);
});

test("starts the Hero background beams immediately on load", async () => {
  const beams = await readSource("src/components/ui/background-beams.tsx");

  assert.match(beams, /\.filter\(\(_, index\) => index % 3 === 0\)/);
  assert.match(beams, /d=\{paths\.join\(" "\)\}/);
  assert.match(beams, /strokeOpacity="0\.07"/);
  assert.match(beams, /strokeOpacity="0\.25"/);
  assert.match(beams, /x1: "-20%",[\s\S]{0,80}x2: "20%",[\s\S]{0,80}y1: "-20%",[\s\S]{0,80}y2: "20%"/);
  assert.match(beams, /repeat: Infinity,[\s\S]{0,40}delay: 0,/);
  assert.doesNotMatch(beams, /delay:\s*Math\.random\(\)\s*\*\s*10/);
});

test("keeps the mobile Hero and final CTA beam treatments visible", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience \.hero-beams \{ opacity: \.62; \}/);
  assert.match(css, /\.home-experience \.careers-preview__beams \{ position: absolute;[\s\S]{0,120}opacity: \.64;/);
  assert.match(css, /\.home-experience \.mobile-home-hero__beams,[\s\S]{0,140}\.home-experience \.careers-preview__beams \{ inset: -12%; width: auto; height: auto; opacity: \.98; \}/);
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

  assert.match(css, /\.home-experience \.hero__index \{ min-height: 28px; padding: 5px 12px; border-color: rgb\(30 58 95 \/ 20%\); background: rgb\(255 255 255 \/ 68%\); \}/);
  assert.match(css, /\.home-experience \.hero__index p \{ color: var\(--accent\); font-family: "Geist Mono Variable"/);
  assert.match(css, /\.home-experience \.hero__description \{ max-width: 620px; color: var\(--text-secondary\); font-size: var\(--home-section-support-size\); font-weight: 400; line-height: 1\.5; letter-spacing: -\.01em; \}/);
});

test("adds a desktop-only bottom scroll navigator to every page", async () => {
  const home = await readSource("src/components/HomePage.jsx");
  const careers = await readSource("src/components/CareersPage.jsx");
  const navigator = await readSource("src/components/PageScrollNavigator.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(home, /<PageScrollNavigator href="#internet-first-meaning" label="Scroll to explore" \/>/);
  assert.match(careers, /<PageScrollNavigator href="#application-checkpoint-2" label="Continue application" \/>/);
  assert.match(navigator, /className=\{`page-scroll-navigator/);
  assert.match(css, /\.page-scroll-navigator--idle-stopped \{ opacity: 0; visibility: hidden; pointer-events: none; \}/);
  assert.match(css, /\.page-scroll-navigator \{[\s\S]{0,240}position: fixed;[\s\S]{0,180}bottom: 16px;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]{0,500}\.next-section-cue \{\s*display: none;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]{0,800}\.page-scroll-navigator \{\s*display: none;/);
});

test("gives the final Careers CTA the shared eyebrow badge", async () => {
  const careersPreview = await readSource("src/components/CareersPreviewSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.match(careersPreview, /className="careers-preview__label careers-preview__reveal"/);
  assert.match(careersPreview, />\s*Careers\s*</);
  assert.match(css, /\.home-experience \.careers-preview__label \{ min-height: 28px; padding: 5px 12px; margin: 0; border: 1px solid rgb\(30 58 95 \/ 20%\); border-radius: 999px;/);
});

test("updates only the principle card boxes with the reference treatment", async () => {
  const section = await readSource("src/components/InternetFirstMeaningSection.jsx");
  const css = await readSource("src/app/globals.css");

  assert.doesNotMatch(section, /meaning-card__icon|meaning-card__rule/);
  assert.match(css, /\.meaning-card \{\s*display: flex;\s*min-height: 196px;[\s\S]{0,220}border-radius: 16px;[\s\S]{0,100}box-shadow: none;/);
  assert.match(css, /\.home-experience \.meaning-card,[\s\S]{0,160}\.home-experience \.how-we-think__carousel-card,[\s\S]{0,160}\.home-experience \.how-we-build__step \{[\s\S]{0,160}background: #FCFCFB;/);
  assert.match(css, /\.home-experience \.meaning-card:hover,[\s\S]{0,180}border-color: #5b3df5;[\s\S]{0,120}transform: translateY\(-6px\);/);
});

test("uses an off-white background for Home cards", async () => {
  const css = await readSource("src/app/globals.css");

  assert.match(css, /\.home-experience \.meaning-card,[\s\S]{0,160}\.home-experience \.how-we-think__carousel-card,[\s\S]{0,160}\.home-experience \.how-we-build__step \{[\s\S]{0,160}background: #FCFCFB;/);
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
