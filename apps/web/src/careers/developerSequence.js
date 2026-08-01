export const careersSequence = Object.freeze({
  folderPath: "/images/careers/frames",
  frameCount: 192,
  firstFrameNumber: 1,
  extension: "png",
  filenamePrefix: "ezgif-frame-",
  filenamePadding: 3,
  segmentCount: 7,
  mobileFolderPath: null,
  maxDevicePixelRatio: 2,
  maxCanvasWidth: 3840,
  maxCanvasHeight: 2160,
  preloadRadius: 4,
  maxCachedFrames: 20,
  maxConcurrentLoads: 3,
  interpolateFrames: true,
  minimumPlaybackFps: 24,
  smoothingTimeConstantMs: 72,
  settleThreshold: 0.01,
});

export const developerSequence = careersSequence;

export function wrapSequenceFrame(frameIndex, config = careersSequence) {
  return ((frameIndex % config.frameCount) + config.frameCount) % config.frameCount;
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
