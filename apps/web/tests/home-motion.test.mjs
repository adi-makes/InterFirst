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
