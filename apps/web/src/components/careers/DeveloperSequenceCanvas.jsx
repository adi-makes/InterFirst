import { useCallback, useEffect, useRef, useState } from "react";
import {
  careersSequence,
  getSequenceFramePath,
  getSequenceSceneFrame,
} from "../../careers/developerSequence.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const releaseImage = (image) => {
  if (image) image.src = "";
};

export function CareersSequenceCanvas({ enabled, scrollContainerRef }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const contextRef = useRef(null);
  const framesRef = useRef(new Map());
  const promisesRef = useRef(new Map());
  const loadQueueRef = useRef([]);
  const activeLoadsRef = useRef(0);
  const loadSessionRef = useRef(0);
  const failedRef = useRef(new Set());
  const targetFrameRef = useRef(0);
  const displayedFrameRef = useRef(0);
  const animationRequestRef = useRef(0);
  const scrollRequestRef = useRef(0);
  const lastAnimationTimeRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const enabledRef = useRef(enabled);
  const loadFrameRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches,
  );
  const [fallbackPath] = useState(() => getSequenceFramePath(0));

  const trimFrameCache = useCallback((centerPosition) => {
    const displayedPosition = displayedFrameRef.current;
    const targetPosition = targetFrameRef.current;
    const protectedIndexes = new Set([
      Math.floor(centerPosition),
      Math.ceil(centerPosition),
      Math.floor(displayedPosition),
      Math.ceil(displayedPosition),
      Math.floor(targetPosition),
      Math.ceil(targetPosition),
    ]);

    while (framesRef.current.size > careersSequence.maxCachedFrames) {
      let candidateIndex = null;
      let candidateDistance = -1;

      framesRef.current.forEach((_, index) => {
        if (protectedIndexes.has(index)) return;
        const distance = Math.min(
          Math.abs(index - displayedPosition),
          Math.abs(index - targetPosition),
        );
        if (distance > candidateDistance) {
          candidateDistance = distance;
          candidateIndex = index;
        }
      });

      if (candidateIndex === null) candidateIndex = framesRef.current.keys().next().value;
      releaseImage(framesRef.current.get(candidateIndex));
      framesRef.current.delete(candidateIndex);
    }

    if (containerRef.current) {
      containerRef.current.dataset.cachedFrames = String(framesRef.current.size);
    }
  }, []);

  const drawFramePosition = useCallback((framePosition) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const lowerIndex = clamp(Math.floor(framePosition), 0, careersSequence.frameCount - 1);
    const upperIndex = clamp(Math.ceil(framePosition), 0, careersSequence.frameCount - 1);
    const lowerImage = framesRef.current.get(lowerIndex);
    const upperImage = framesRef.current.get(upperIndex);
    const blend = framePosition - lowerIndex;
    if (!canvas || !context || !lowerImage?.naturalWidth || !lowerImage?.naturalHeight) {
      return false;
    }
    if (blend > 0 && (!upperImage?.naturalWidth || !upperImage?.naturalHeight)) {
      return false;
    }

    const drawCover = (image) => {
      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      context.drawImage(image, x, y, drawWidth, drawHeight);
    };

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.globalAlpha = 1;
    drawCover(lowerImage);

    if (blend > 0 && upperImage?.naturalWidth && upperImage?.naturalHeight) {
      context.globalAlpha = blend;
      drawCover(upperImage);
      context.globalAlpha = 1;
    }

    containerRef.current.dataset.frameIndex = String(Math.round(framePosition));
    containerRef.current.dataset.framePosition = framePosition.toFixed(3);
    containerRef.current.dataset.ready = "true";
    return true;
  }, []);

  const loadFrame = useCallback((requestedIndex, { priority = false } = {}) => {
    const index = clamp(Math.round(requestedIndex), 0, careersSequence.frameCount - 1);
    if (framesRef.current.has(index)) return Promise.resolve(framesRef.current.get(index));
    if (failedRef.current.has(index)) return Promise.resolve(null);
    if (promisesRef.current.has(index)) {
      if (priority) {
        const queuedIndex = loadQueueRef.current.findIndex((task) => task.index === index);
        if (queuedIndex > 0) {
          const [queuedTask] = loadQueueRef.current.splice(queuedIndex, 1);
          loadQueueRef.current.unshift(queuedTask);
        }
      }
      return promisesRef.current.get(index);
    }

    let task;
    const promise = new Promise((resolve) => {
      task = { index, priority, resolve, session: loadSessionRef.current, promise: null };
      if (priority) loadQueueRef.current.unshift(task);
      else loadQueueRef.current.push(task);

      const startQueuedLoads = () => {
        while (
          activeLoadsRef.current < careersSequence.maxConcurrentLoads
          && loadQueueRef.current.length
        ) {
          const nextTask = loadQueueRef.current.shift();
          if (nextTask.session !== loadSessionRef.current) {
            if (promisesRef.current.get(nextTask.index) === nextTask.promise) {
              promisesRef.current.delete(nextTask.index);
            }
            nextTask.resolve(null);
            continue;
          }

          activeLoadsRef.current += 1;
          const image = new Image();
          let settled = false;
          const finish = (loadedImage) => {
            if (settled) return;
            settled = true;
            activeLoadsRef.current -= 1;

            const isCurrentSession = nextTask.session === loadSessionRef.current;
            if (isCurrentSession && loadedImage?.naturalWidth) {
              framesRef.current.set(nextTask.index, loadedImage);
              trimFrameCache(targetFrameRef.current);
            } else {
              releaseImage(loadedImage);
            }

            if (promisesRef.current.get(nextTask.index) === nextTask.promise) {
              promisesRef.current.delete(nextTask.index);
            }
            nextTask.resolve(isCurrentSession ? loadedImage : null);
            if (containerRef.current) {
              containerRef.current.dataset.activeLoads = String(activeLoadsRef.current);
              containerRef.current.dataset.queuedLoads = String(loadQueueRef.current.length);
            }
            startQueuedLoads();
          };

          image.decoding = "async";
          image.onload = () => {
            image.decode().catch(() => undefined).then(() => finish(image));
          };
          image.onerror = () => {
            failedRef.current.add(nextTask.index);
            finish(null);
          };
          image.src = getSequenceFramePath(nextTask.index);
        }

        if (containerRef.current) {
          containerRef.current.dataset.activeLoads = String(activeLoadsRef.current);
          containerRef.current.dataset.queuedLoads = String(loadQueueRef.current.length);
        }
      };

      startQueuedLoads();
    });

    task.promise = promise;
    promisesRef.current.set(index, promise);
    return promise;
  }, [trimFrameCache]);
  loadFrameRef.current = loadFrame;

  const loadFramePair = useCallback((framePosition, priority = false) => {
    const lowerIndex = Math.floor(framePosition);
    const upperIndex = Math.ceil(framePosition);
    return Promise.all([
      loadFrame(lowerIndex, { priority }),
      loadFrame(upperIndex, { priority }),
    ]);
  }, [loadFrame]);

  const animateTowardTarget = useCallback((timestamp) => {
    const target = targetFrameRef.current;
    const current = displayedFrameRef.current;
    const elapsed = lastAnimationTimeRef.current
      ? Math.min(timestamp - lastAnimationTimeRef.current, careersSequence.maximumAnimationDeltaMs)
      : 1000 / careersSequence.minimumPlaybackFps;
    lastAnimationTimeRef.current = timestamp;

    const distance = target - current;
    const shouldSettleImmediately = reducedMotionRef.current || !enabledRef.current;
    const blendAmount = 1 - Math.exp(-elapsed / careersSequence.smoothingTimeConstantMs);
    const smoothedStep = distance * blendAmount;
    const maximumStep = careersSequence.maxFrameAdvancePerSecond * (elapsed / 1000);
    const boundedStep = clamp(smoothedStep, -maximumStep, maximumStep);
    const nextPosition = shouldSettleImmediately || Math.abs(distance) <= careersSequence.settleThreshold
      ? target
      : current + boundedStep;

    const didDraw = drawFramePosition(nextPosition);
    if (didDraw) displayedFrameRef.current = nextPosition;
    else loadFramePair(nextPosition, true);

    const direction = Math.sign(target - displayedFrameRef.current);
    const displayedIndex = Math.round(displayedFrameRef.current);
    for (let offset = 1; offset <= careersSequence.motionPreloadRadius; offset += 1) {
      loadFrame(displayedIndex + direction * offset);
    }

    if (!didDraw || nextPosition !== target) {
      animationRequestRef.current = window.requestAnimationFrame(animateTowardTarget);
    } else {
      animationRequestRef.current = 0;
      lastAnimationTimeRef.current = 0;
    }
  }, [drawFramePosition, loadFrame, loadFramePair]);

  const requestFrame = useCallback((requestedIndex) => {
    const framePosition = clamp(requestedIndex, 0, careersSequence.frameCount - 1);
    const targetIndex = Math.round(framePosition);
    const displayedIndex = Math.round(displayedFrameRef.current);
    targetFrameRef.current = framePosition;

    loadQueueRef.current = loadQueueRef.current.filter((task) => {
      const keep = (
        Math.abs(task.index - targetIndex) <= careersSequence.preloadRadius + 1
        || Math.abs(task.index - displayedIndex) <= careersSequence.motionPreloadRadius + 1
        || (
          framesRef.current.size < careersSequence.initialPreloadFrames
          && task.index < careersSequence.initialPreloadFrames
        )
      );
      if (!keep) {
        if (promisesRef.current.get(task.index) === task.promise) {
          promisesRef.current.delete(task.index);
        }
        task.resolve(null);
      }
      return keep;
    });

    loadFramePair(framePosition, true);

    for (let offset = 1; offset <= careersSequence.preloadRadius; offset += 1) {
      loadFrame(targetIndex + offset);
      loadFrame(targetIndex - offset);
    }

    if (!animationRequestRef.current) {
      animationRequestRef.current = window.requestAnimationFrame(animateTowardTarget);
    }
  }, [animateTowardTarget, loadFrame, loadFramePair]);

  const updateFromScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    const sequence = containerRef.current;
    if (!container || !sequence) return;

    if (!enabledRef.current || reducedMotionRef.current) {
      sequence.dataset.playbackMode = reducedMotionRef.current ? "reduced" : "idle";
      requestFrame(0);
      return;
    }

    const headerHeight = document.querySelector(".application-header")?.getBoundingClientRect().height || 0;
    const checkpoints = [...container.querySelectorAll("[data-application-checkpoint]")];
    const checkpointTops = checkpoints.map(
      (checkpoint) => checkpoint.getBoundingClientRect().top + window.scrollY,
    );
    const scrollPosition = window.scrollY + headerHeight;
    let sceneIndex = 0;

    for (let index = 1; index < checkpointTops.length; index += 1) {
      if (scrollPosition >= checkpointTops[index]) sceneIndex = index;
      else break;
    }

    const startFrame = getSequenceSceneFrame(sceneIndex);
    const nextTop = checkpointTops[sceneIndex + 1];
    let frameIndex = startFrame;

    if (Number.isFinite(nextTop)) {
      const startTop = checkpointTops[sceneIndex];
      const segmentProgress = clamp(
        (scrollPosition - startTop) / Math.max(nextTop - startTop, 1),
        0,
        1,
      );
      const endFrame = getSequenceSceneFrame(sceneIndex + 1);
      frameIndex = startFrame + (endFrame - startFrame) * segmentProgress;
    }

    const progress = frameIndex / (careersSequence.frameCount - 1);

    sequence.dataset.playbackMode = "scroll";
    sequence.dataset.scrollProgress = progress.toFixed(4);
    requestFrame(frameIndex);
  }, [requestFrame, scrollContainerRef]);

  useEffect(() => {
    enabledRef.current = enabled;
    if (isMobile) return;
    loadFrameRef.current(0, { priority: true });
    for (let index = 1; index < careersSequence.initialPreloadFrames; index += 1) {
      loadFrameRef.current(index);
    }
    updateFromScroll();
  }, [enabled, isMobile, updateFromScroll]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const onMobileChange = (event) => setIsMobile(event.matches);
    setIsMobile(mobileQuery.matches);
    mobileQuery.addEventListener?.("change", onMobileChange);
    return () => mobileQuery.removeEventListener?.("change", onMobileChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    if (isMobile) {
      container.dataset.playbackMode = "mobile-static";
      return undefined;
    }

    contextRef.current = canvas.getContext("2d", { alpha: false, desynchronized: true });
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        careersSequence.maxDevicePixelRatio,
        careersSequence.maxCanvasWidth / Math.max(bounds.width, 1),
        careersSequence.maxCanvasHeight / Math.max(bounds.height, 1),
      );
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      canvas.style.width = `${bounds.width}px`;
      canvas.style.height = `${bounds.height}px`;
      contextRef.current.imageSmoothingEnabled = true;
      contextRef.current.imageSmoothingQuality = "high";
      container.dataset.outputWidth = String(canvas.width);
      container.dataset.outputHeight = String(canvas.height);
      updateFromScroll();
    };

    const resizeObserver = new ResizeObserver(resize);
    const onScroll = () => {
      window.cancelAnimationFrame(scrollRequestRef.current);
      scrollRequestRef.current = window.requestAnimationFrame(updateFromScroll);
    };
    const onMotionPreferenceChange = (event) => {
      reducedMotionRef.current = event.matches;
      updateFromScroll();
    };

    resizeObserver.observe(container);
    window.addEventListener("scroll", onScroll, { passive: true });
    motionQuery.addEventListener?.("change", onMotionPreferenceChange);
    loadFrame(0, { priority: true }).then(() => {
      resize();
      requestFrame(0);
    });

    const decodedFrames = framesRef.current;
    const pendingFrames = promisesRef.current;
    return () => {
      loadSessionRef.current += 1;
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      motionQuery.removeEventListener?.("change", onMotionPreferenceChange);
      window.cancelAnimationFrame(scrollRequestRef.current);
      window.cancelAnimationFrame(animationRequestRef.current);
      scrollRequestRef.current = 0;
      animationRequestRef.current = 0;
      lastAnimationTimeRef.current = 0;
      loadQueueRef.current.splice(0).forEach((task) => task.resolve(null));
      decodedFrames.forEach(releaseImage);
      decodedFrames.clear();
      pendingFrames.clear();
      contextRef.current = null;
    };
  }, [isMobile, loadFrame, requestFrame, updateFromScroll]);

  return (
    <div
      aria-hidden="true"
      className="careers-sequence"
      data-minimum-frame-rate={careersSequence.minimumPlaybackFps}
      ref={containerRef}
      style={{ "--careers-sequence-fallback": `url(${fallbackPath})` }}
    >
      <canvas ref={canvasRef} />
      <div className="careers-sequence__veil" />
    </div>
  );
}

export const DeveloperSequenceCanvas = CareersSequenceCanvas;
