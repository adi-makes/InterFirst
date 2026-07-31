export const careersSequence = Object.freeze({
  folderPath: "/images/careers/frames",
  frameCount: 199,
  firstFrameNumber: 2,
  extension: "jpg",
  filenamePrefix: "ezgif-frame-",
  filenamePadding: 3,
  transitionDuration: 960,
  ambientFramesPerSecond: 8,
  boostedFramesPerSecond: 15,
  playbackRateResponse: 8,
  segmentCount: 7,
  mobileFolderPath: null,
  maxDevicePixelRatio: 2,
  maxCanvasWidth: 3840,
  maxCanvasHeight: 2160,
  interpolateFrames: true,
});

export const developerSequence = careersSequence;

export function wrapSequenceFrame(frameIndex, config = careersSequence) {
  return ((frameIndex % config.frameCount) + config.frameCount) % config.frameCount;
}

export function easeSequencePlaybackRate(
  currentRate,
  targetRate,
  elapsedSeconds,
  config = careersSequence,
) {
  const rateBlend =
    1 - Math.exp(-config.playbackRateResponse * Math.max(elapsedSeconds, 0));
  return currentRate + (targetRate - currentRate) * rateBlend;
}

export function getSequenceFrameNumber(frameIndex, config = careersSequence) {
  const clampedIndex = Math.min(Math.max(Math.round(frameIndex), 0), config.frameCount - 1);
  return config.firstFrameNumber + clampedIndex;
}

export function getSequenceFramePath(frameIndex, config = careersSequence, mobile = false) {
  const folder = mobile && config.mobileFolderPath
    ? config.mobileFolderPath
    : config.folderPath;
  const frameNumber = String(getSequenceFrameNumber(frameIndex, config)).padStart(
    config.filenamePadding,
    "0",
  );

  return `${folder}/${config.filenamePrefix}${frameNumber}.${config.extension}`;
}

export function getSequenceSegment(segmentIndex, config = careersSequence) {
  const clampedSegment = Math.min(
    Math.max(Math.round(segmentIndex), 0),
    config.segmentCount - 1,
  );
  const lastFrameIndex = config.frameCount - 1;

  return {
    start: Math.round((clampedSegment / config.segmentCount) * lastFrameIndex),
    end: Math.round(((clampedSegment + 1) / config.segmentCount) * lastFrameIndex),
  };
}

export function getSequenceSceneFrame(sceneIndex, config = careersSequence) {
  const clampedScene = Math.min(
    Math.max(Math.round(sceneIndex), 0),
    config.segmentCount,
  );

  return Math.round((clampedScene / config.segmentCount) * (config.frameCount - 1));
}
