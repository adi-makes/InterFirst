export const careersImageSequence = Object.freeze({
  folderPath: "/images/careers/frames",
  frameCount: 192,
  firstFrameNumber: 1,
  filenamePrefix: "ezgif-frame-",
  filenamePadding: 3,
  extension: "webp",
  preloadConcurrency: 4,
  preloadBatchSize: 8,
  preloadRadius: 3,
  maxDevicePixelRatio: 2,
  maxCanvasWidth: 3840,
  maxCanvasHeight: 2160,
});

export function getCareersFramePath(index, config = careersImageSequence) {
  const safeIndex = Math.min(Math.max(Math.floor(index), 0), config.frameCount - 1);
  const frameNumber = String(config.firstFrameNumber + safeIndex).padStart(
    config.filenamePadding,
    "0",
  );

  return `${config.folderPath}/${config.filenamePrefix}${frameNumber}.${config.extension}`;
}
