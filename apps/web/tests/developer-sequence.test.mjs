import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  careersSequence,
  easeSequencePlaybackRate,
  getSequenceFramePath,
  getSequenceSceneFrame,
  getSequenceSegment,
  wrapSequenceFrame,
} from "../src/careers/developerSequence.js";

test("excludes the mismatched first image and addresses all remaining frames", () => {
  assert.equal(careersSequence.frameCount, 199);
  assert.equal(careersSequence.maxCanvasWidth, 3840);
  assert.equal(careersSequence.maxCanvasHeight, 2160);
  assert.equal(careersSequence.interpolateFrames, true);
  assert.equal(careersSequence.transitionDuration, 960);
  assert.equal(careersSequence.ambientFramesPerSecond, 8);
  assert.equal(careersSequence.boostedFramesPerSecond, 15);
  assert.equal(careersSequence.playbackRateResponse, 8);
  assert.ok(
    careersSequence.boostedFramesPerSecond > careersSequence.ambientFramesPerSecond,
  );
  assert.equal(getSequenceFramePath(0).endsWith("ezgif-frame-002.jpg"), true);
  assert.equal(getSequenceFramePath(198).endsWith("ezgif-frame-200.jpg"), true);
  assert.equal(getSequenceFramePath(0).includes("frame-001"), false);
});

test("divides the sequence into seven continuous application transitions", () => {
  const segments = Array.from({ length: 7 }, (_, index) => getSequenceSegment(index));

  assert.deepEqual(segments[0], { start: 0, end: 28 });
  assert.deepEqual(segments[6], { start: 170, end: 198 });
  segments.slice(1).forEach((segment, index) => {
    assert.equal(segment.start, segments[index].end);
  });
  assert.deepEqual(
    Array.from({ length: 8 }, (_, index) => getSequenceSceneFrame(index)),
    [0, 28, 57, 85, 113, 141, 170, 198],
  );
});

test("loops continuously and eases between ambient and boosted playback rates", () => {
  assert.equal(wrapSequenceFrame(199), 0);
  assert.equal(wrapSequenceFrame(-1), 198);

  const accelerating = easeSequencePlaybackRate(8, 15, 0.1);
  const settling = easeSequencePlaybackRate(accelerating, 8, 0.1);
  assert.ok(accelerating > 8 && accelerating < 15);
  assert.ok(settling > 8 && settling < accelerating);
});

test("keeps applicant values outside the decorative animation engine", async () => {
  const source = await readFile(
    new URL("../src/components/careers/DeveloperSequenceCanvas.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /aria-hidden="true"/);
  assert.doesNotMatch(source, /values\.|name|email|evidenceUrl|answer/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /imageSmoothingQuality = "high"/);
  assert.match(source, /drawCover\(upperImage, blend\)/);
  assert.match(source, /careersSequence\.maxCanvasWidth/);
  assert.match(source, /dataset\.playbackMode = "ambient"/);
  assert.match(source, /dataset\.playbackMode = "boosted"/);
  assert.match(source, /careersSequence\.ambientFramesPerSecond/);
  assert.match(source, /careersSequence\.boostedFramesPerSecond/);
  assert.match(source, /easeSequencePlaybackRate/);
  assert.match(source, /animationFrameRef\.current = window\.requestAnimationFrame\(tick\)/);
});

test("validates before starting a forward application transition", async () => {
  const source = await readFile(
    new URL("../src/components/ApplicationExperience.jsx", import.meta.url),
    "utf8",
  );
  const validationIndex = source.indexOf("validateStep(step, values)");
  const transitionIndex = source.indexOf("moveToStep(returnToReview");

  assert.ok(validationIndex >= 0);
  assert.ok(transitionIndex > validationIndex);
  assert.match(source, /disabled=\{isTransitioning\}/);
  assert.match(source, /await sequenceRef\.current\?\.playSegment\(segmentIndex, direction\)/);
  assert.equal(source.match(/<CareersSequenceCanvas/g)?.length, 1);
  assert.match(source, /Object\.entries\(roleConfigurations\)/);
});
