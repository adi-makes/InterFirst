import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";
import {
  careersImageSequence,
  getCareersFramePath,
} from "../src/careers/careersImageSequence.js";

test("addresses all 192 optimized WebP delivery frames", () => {
  assert.equal(careersImageSequence.frameCount, 192);
  assert.equal(careersImageSequence.maxCanvasWidth, 3840);
  assert.equal(careersImageSequence.maxCanvasHeight, 2160);
  assert.equal(careersImageSequence.preloadConcurrency, 4);
  assert.equal(careersImageSequence.extension, "webp");
  assert.equal(getCareersFramePath(0).endsWith("ezgif-frame-001.webp"), true);
  assert.equal(getCareersFramePath(191).endsWith("ezgif-frame-192.webp"), true);
  assert.equal(getCareersFramePath(-20), getCareersFramePath(0));
  assert.equal(getCareersFramePath(400), getCareersFramePath(191));
});

test("ships a complete bounded-size WebP delivery sequence", async () => {
  const frameDirectory = new URL("../public/images/careers/frames/", import.meta.url);
  const frameNames = (await readdir(frameDirectory))
    .filter((name) => /^ezgif-frame-\d{3}\.webp$/.test(name))
    .sort();
  const frameSizes = await Promise.all(
    frameNames.map((name) => stat(new URL(name, frameDirectory)).then((file) => file.size)),
  );

  assert.equal(frameNames.length, careersImageSequence.frameCount);
  assert.equal(frameNames[0], "ezgif-frame-001.webp");
  assert.equal(frameNames.at(-1), "ezgif-frame-192.webp");
  assert.ok(frameSizes.every((size) => size > 0));
  assert.ok(frameSizes.reduce((total, size) => total + size, 0) < 16_000_000);
});

test("uses a new sticky Canvas scrub engine with progressive deduplicated loading", async () => {
  const [component, hook, preloader, css] = await Promise.all([
    readFile(new URL("../src/components/careers/CareersImageSequence.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/hooks/useImageSequence.js", import.meta.url), "utf8"),
    readFile(new URL("../src/utils/preloadFrames.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/careers-scroll.css", import.meta.url), "utf8"),
  ]);

  assert.match(component, /aria-hidden="true"/);
  assert.match(component, /<canvas ref=\{canvasRef\}/);
  assert.match(component, /scrollHeight = "100%"/);
  assert.doesNotMatch(component, /values\.|name|email|evidenceUrl|answer/);
  assert.match(hook, /prefers-reduced-motion: reduce/);
  assert.match(hook, /import\("gsap\/ScrollTrigger"\)/);
  assert.match(hook, /scrub: true/);
  assert.match(hook, /onUpdate: \(\{ progress \}\) => renderProgress\(progress\)/);
  assert.match(hook, /Math\.floor\(normalizedProgress \* \(config\.frameCount - 1\)\)/);
  assert.match(hook, /window\.addEventListener\("scroll", onScroll, \{ passive: true \}\)/);
  assert.match(hook, /window\.requestAnimationFrame/);
  assert.match(hook, /frameIndex === previousFrameRef\.current/);
  assert.match(hook, /preloader\.load\(0, \{ priority: true \}\)/);
  assert.match(hook, /imageSmoothingQuality = "high"/);
  assert.match(hook, /const scale = Math\.max/);
  assert.doesNotMatch(hook, /useState|setInterval|autoplay|loop|globalAlpha/);
  assert.match(preloader, /const records = new Map\(\)/);
  assert.match(preloader, /if \(existing\)/);
  assert.match(preloader, /new Image\(\)/);
  assert.match(preloader, /requestIdleCallback/);
  assert.match(css, /\.careers-sequence__sticky \{[\s\S]*position: sticky;[\s\S]*top: 0;[\s\S]*height: 100vh;/);
  assert.match(css, /\.careers-sequence canvas \{[\s\S]*width: 100%;[\s\S]*height: 100%;/);
  assert.match(css, /background-image: url\("\/images\/careers\/frames\/ezgif-frame-001\.webp"\);/);
});

test("unlocks one natively scrollable question set for every role", async () => {
  const source = await readFile(
    new URL("../src/components/ApplicationExperience.jsx", import.meta.url),
    "utf8",
  );
  const css = await readFile(
    new URL("../src/app/careers-scroll.css", import.meta.url),
    "utf8",
  );
  assert.match(
    css,
    /\.application-primary-action \{[\s\S]{0,100}border: 1\.5px solid var\(--button-border\);[\s\S]{0,100}background: var\(--button-background\);[\s\S]{0,60}color: var\(--button-text\);/,
  );
  assert.match(
    css,
    /\.application-secondary-action \{[\s\S]{0,100}border: 1px solid var\(--secondary-button-border\);[\s\S]{0,100}background: var\(--secondary-button-background\);[\s\S]{0,60}color: var\(--secondary-button-text\);/,
  );
  assert.match(
    css,
    /\.application-primary-action:not\(:disabled\):hover \{[\s\S]{0,160}background: var\(--button-hover-background\);[\s\S]{0,80}color: var\(--button-hover-text\);/,
  );
  const validationIndex = source.indexOf("const validationSteps = [1, 2, 3, 4, 6]");

  assert.ok(validationIndex >= 0);
  assert.match(source, /application-scroll-flow/);
  assert.match(source, /application-checkpoint/);
  assert.match(source, /role \? checkpointContents : checkpointContents\.slice\(0, 1\)/);
  assert.match(source, /<CareersImageSequence \/>/);
  assert.doesNotMatch(source, /CareersSequenceCanvas|DeveloperSequenceCanvas/);
  assert.match(source, /Object\.entries\(roleConfigurations\)/);
  assert.match(source, /data-scroll-owner="document"/);
  assert.match(source, /const \[progressValue, setProgressValue\] = useState\(1\)/);
  assert.match(source, /value=\{progressValue\}/);
  assert.match(source, /nextProgress \+= segmentFraction/);
  assert.doesNotMatch(source, /value=\{step \+ 1\}/);
  assert.doesNotMatch(source, /application-mobile-statement/);
  assert.doesNotMatch(source, /Preparing image|Saving|Saved on this device|saveStatus|isSequenceLoading/);
  assert.doesNotMatch(source, /addEventListener\("wheel"|preventDefault\(\)[\s\S]{0,240}scrollTop|addEventListener\("touchmove"/);
  assert.doesNotMatch(source, /applicationWheelSpeed|mobileApplicationWheelSpeed|mobileCardTouchScrollSpeed|touchVelocity|mobileTouchInertia/);
  assert.doesNotMatch(source, /ScrollPrompt|CheckpointActions|continueFrom|application-track|application-slide|--slide-offset/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.application-checkpoint \{ min-height: calc\(100dvh - 66px\);/);
  assert.match(css, /\.application-checkpoint:first-child \{ min-height: calc\(100dvh - 66px\); \}/);
  assert.match(css, /\.application-shell \{[\s\S]*touch-action: pan-y pinch-zoom;/);
  assert.match(css, /\.application-scroll-flow form \{[\s\S]*touch-action: pan-y pinch-zoom;/);
  assert.match(css, /\.application-checkpoint \{[\s\S]*touch-action: pan-y pinch-zoom;/);
  assert.match(css, /\.application-checkpoint__card \{[\s\S]*overflow: clip;[\s\S]*touch-action: pan-y pinch-zoom;/);
  assert.doesNotMatch(css, /\.application-checkpoint__card \{[\s\S]*overflow: hidden;/);
  assert.match(css, /\.application-panel \{[\s\S]*overflow: visible;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.application-field input,[\s\S]*\.application-role-option,[\s\S]*\.application-choice__options span,[\s\S]*\.application-actions button[\s\S]*touch-action: auto;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.application-checkpoint__card \{ overflow: visible; border-radius: 14px; \}/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.application-field textarea \{ resize: none; \}/);
  assert.match(css, /\.careers-sequence__sticky \{[\s\S]*background-image: url\("\/images\/careers\/frames\/ezgif-frame-001\.webp"\);/);
  assert.match(css, /\.application-checkpoint__card \{[\s\S]*border: 1px solid var\(--border-strong\);[\s\S]*background: rgb\(252 252 251 \/ 0\.94\);[\s\S]*box-shadow: none;/);
  assert.match(css, /\.application-main__meta \{[\s\S]*background: rgb\(238 243 248 \/ 0\.72\);/);
  assert.match(css, /\.application-role-option\[aria-pressed="true"\] \{[\s\S]*background: rgb\(238 243 248 \/ 0\.96\);/);
  assert.doesNotMatch(css, /rgb\(17 17 17/);
  assert.doesNotMatch(css, /application-mobile-statement/);
  assert.match(css, /\.careers-sequence\[data-ready="true"\] canvas \{\s*opacity: 1;/);
  assert.doesNotMatch(css, /data-playback-started/);
});
