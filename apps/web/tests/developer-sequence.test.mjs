import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  careersSequence,
  getSequenceFramePath,
  getSequenceSceneFrame,
  getSequenceSegment,
} from "../src/careers/developerSequence.js";

test("addresses all 192 HQ PNG frames without the legacy JPEG set", () => {
  assert.equal(careersSequence.frameCount, 192);
  assert.equal(careersSequence.maxCanvasWidth, 3840);
  assert.equal(careersSequence.maxCanvasHeight, 2160);
  assert.equal(careersSequence.interpolateFrames, true);
  assert.equal(careersSequence.preloadRadius, 4);
  assert.equal(careersSequence.maxCachedFrames, 20);
  assert.equal(careersSequence.maxConcurrentLoads, 3);
  assert.ok(careersSequence.minimumPlaybackFps >= 24);
  assert.ok(careersSequence.smoothingTimeConstantMs > 0);
  assert.equal(getSequenceFramePath(0).endsWith("ezgif-frame-001.png"), true);
  assert.equal(getSequenceFramePath(191).endsWith("ezgif-frame-192.png"), true);
});

test("divides the sequence into seven continuous application transitions", () => {
  const segments = Array.from({ length: 7 }, (_, index) => getSequenceSegment(index));

  assert.deepEqual(segments[0], { start: 0, end: 27 });
  assert.deepEqual(segments[6], { start: 164, end: 191 });
  segments.slice(1).forEach((segment, index) => {
    assert.equal(segment.start, segments[index].end);
  });
  assert.deepEqual(
    Array.from({ length: 8 }, (_, index) => getSequenceSceneFrame(index)),
    [0, 27, 55, 82, 109, 136, 164, 191],
  );
});

test("keeps applicant values outside the decorative animation engine", async () => {
  const source = await readFile(
    new URL("../src/components/careers/DeveloperSequenceCanvas.jsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /aria-hidden="true"/);
  assert.doesNotMatch(source, /values\.|name|email|evidenceUrl|answer/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /window\.matchMedia\("\(max-width: 640px\)"\)/);
  assert.match(source, /dataset\.playbackMode = "mobile-static"/);
  assert.doesNotMatch(source, /onLoadingChange/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /imageSmoothingQuality = "high"/);
  assert.match(source, /careersSequence\.maxCanvasWidth/);
  assert.match(source, /window\.addEventListener\("scroll"/);
  assert.match(source, /dataset\.playbackMode = "scroll"/);
  assert.match(source, /requestFrame\(frameIndex\)/);
  assert.match(source, /window\.requestAnimationFrame\(animateTowardTarget\)/);
  assert.match(source, /context\.globalAlpha = blend/);
  assert.match(source, /Math\.exp\(-elapsed \/ careersSequence\.smoothingTimeConstantMs\)/);
  assert.match(source, /loadQueueRef/);
  assert.match(source, /activeLoadsRef\.current < careersSequence\.maxConcurrentLoads/);
  assert.match(source, /framesRef\.current\.size > careersSequence\.maxCachedFrames/);
  assert.match(source, /releaseImage/);
  assert.match(source, /loadFramePair\(framePosition, true\)/);
  assert.match(source, /dataset\.ready = "true"/);
  assert.doesNotMatch(source, /drawTokenRef/);
  assert.doesNotMatch(source, /setInterval|ambientFramesPerSecond|boostedFramesPerSecond|playSegment/);
});

test("unlocks one freely scrollable question set for every role", async () => {
  const source = await readFile(
    new URL("../src/components/ApplicationExperience.jsx", import.meta.url),
    "utf8",
  );
  const css = await readFile(
    new URL("../src/app/careers-scroll.css", import.meta.url),
    "utf8",
  );
  const validationIndex = source.indexOf("const validationSteps = [1, 2, 3, 4, 6]");

  assert.ok(validationIndex >= 0);
  assert.match(source, /application-scroll-flow/);
  assert.match(source, /application-checkpoint/);
  assert.match(source, /role \? checkpointContents : checkpointContents\.slice\(0, 1\)/);
  assert.equal(source.match(/<CareersSequenceCanvas/g)?.length, 1);
  assert.match(source, /Object\.entries\(roleConfigurations\)/);
  assert.match(source, /addEventListener\("wheel", routeApplicationWheel, \{ capture: true, passive: false \}\)/);
  assert.match(source, /removeEventListener\("wheel", routeApplicationWheel, \{ capture: true \}\)/);
  assert.match(source, /data-scroll-owner="document"/);
  assert.match(source, /const \[progressValue, setProgressValue\] = useState\(1\)/);
  assert.match(source, /value=\{progressValue\}/);
  assert.match(source, /nextProgress \+= segmentFraction/);
  assert.doesNotMatch(source, /value=\{step \+ 1\}/);
  assert.match(source, /const applicationWheelSpeed = 1\.65/);
  assert.match(source, /const mobileApplicationWheelSpeed = 2\.35/);
  assert.match(source, /window\.matchMedia\("\(max-width: 640px\)"\)\.matches/);
  assert.doesNotMatch(source, /application-mobile-statement/);
  assert.doesNotMatch(source, /Preparing image|Saving|Saved on this device|saveStatus|isSequenceLoading/);
  assert.match(source, /const scrollElement = document\.scrollingElement \|\| document\.documentElement/);
  assert.match(source, /scrollElement\.scrollTop \+= verticalDelta \* wheelSpeed/);
  assert.doesNotMatch(source, /addEventListener\("touch(?:start|move|end|cancel)"/);
  assert.doesNotMatch(source, /preventDefault\(\)[\s\S]*touchVelocity/);
  assert.match(source, /event\.ctrlKey/);
  assert.doesNotMatch(source, /ScrollPrompt|CheckpointActions|continueFrom|application-track|application-slide|--slide-offset/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.application-checkpoint \{ min-height: calc\(100dvh - 66px\);/);
  assert.match(css, /\.application-checkpoint:first-child \{ min-height: calc\(100dvh - 66px\); \}/);
  assert.match(css, /\.application-shell \{[\s\S]*touch-action: pan-y pinch-zoom;/);
  assert.match(css, /\.application-scroll-flow form \{[\s\S]*touch-action: pan-y pinch-zoom;/);
  assert.match(css, /\.application-checkpoint \{[\s\S]*touch-action: pan-y pinch-zoom;/);
  assert.match(css, /\.application-checkpoint__card \{[\s\S]*overflow: clip;[\s\S]*touch-action: pan-y pinch-zoom;/);
  assert.doesNotMatch(css, /\.application-checkpoint__card \{[\s\S]*overflow: hidden;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.careers-sequence \{[\s\S]*background-image: var\(--careers-sequence-fallback\);/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.careers-sequence canvas \{\s*display: none;/);
  assert.doesNotMatch(css, /application-mobile-statement/);
  assert.match(css, /\.careers-sequence canvas \{[\s\S]*opacity: 0;/);
  assert.match(css, /\.careers-sequence\[data-ready="true"\] canvas \{\s*opacity: 1;/);
});
