import { useCallback, useEffect, useRef, useState } from "react";
import {
  careersSequence,
  getSequenceFramePath,
  getSequenceSceneFrame,
} from "../../careers/developerSequence.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function CareersSequenceCanvas({ enabled, onLoadingChange, scrollContainerRef }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const contextRef = useRef(null);
  const framesRef = useRef(new Map());
  const promisesRef = useRef(new Map());
  const failedRef = useRef(new Set());
  const targetFrameRef = useRef(0);
  const displayedFrameRef = useRef(0);
  const renderedFrameRef = useRef(0);
  const animationRequestRef = useRef(0);
  const scrollRequestRef = useRef(0);
  const lastAnimationTimeRef = useRef(0);
  const drawTokenRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const enabledRef = useRef(enabled);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches,
  );
  const [fallbackPath] = useState(() => getSequenceFramePath(0));

  const drawFramePosition = useCallback((framePosition) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const lowerIndex = clamp(Math.floor(framePosition), 0, careersSequence.frameCount - 1);
    const upperIndex = clamp(Math.ceil(framePosition), 0, careersSequence.frameCount - 1);
    const lowerImage = framesRef.current.get(lowerIndex);
    const upperImage = framesRef.current.get(upperIndex);
    if (!canvas || !context || !lowerImage?.naturalWidth || !lowerImage?.naturalHeight) {
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
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCover(lowerImage);

    const blend = framePosition - lowerIndex;
    if (blend > 0 && upperImage?.naturalWidth && upperImage?.naturalHeight) {
      context.globalAlpha = blend;
      drawCover(upperImage);
      context.globalAlpha = 1;
    }

    renderedFrameRef.current = Math.round(framePosition);
    containerRef.current.dataset.frameIndex = String(Math.round(framePosition));
    containerRef.current.dataset.framePosition = framePosition.toFixed(3);
    return true;
  }, []);

  const loadFrame = useCallback((requestedIndex) => {
    const index = clamp(Math.round(requestedIndex), 0, careersSequence.frameCount - 1);
    if (framesRef.current.has(index)) return Promise.resolve(framesRef.current.get(index));
    if (failedRef.current.has(index)) return Promise.resolve(null);
    if (promisesRef.current.has(index)) return promisesRef.current.get(index);

    const promise = new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = async () => {
        try {
          await image.decode();
        } catch {
          // The loaded PNG remains drawable when decode() is unavailable.
        }
        framesRef.current.set(index, image);
        while (framesRef.current.size > 64) {
          const oldestIndex = framesRef.current.keys().next().value;
          if (Math.abs(oldestIndex - renderedFrameRef.current) <= 1) break;
          framesRef.current.delete(oldestIndex);
        }
        promisesRef.current.delete(index);
        resolve(image);
      };
      image.onerror = () => {
        failedRef.current.add(index);
        promisesRef.current.delete(index);
        resolve(null);
      };
      image.src = getSequenceFramePath(index);
    });

    promisesRef.current.set(index, promise);
    return promise;
  }, []);

  const loadFramePair = useCallback((framePosition) => {
    const lowerIndex = Math.floor(framePosition);
    const upperIndex = Math.ceil(framePosition);
    return Promise.all([loadFrame(lowerIndex), loadFrame(upperIndex)]);
  }, [loadFrame]);

  const animateTowardTarget = useCallback((timestamp) => {
    const target = targetFrameRef.current;
    const current = displayedFrameRef.current;
    const elapsed = lastAnimationTimeRef.current
      ? Math.min(timestamp - lastAnimationTimeRef.current, 64)
      : 1000 / careersSequence.minimumPlaybackFps;
    lastAnimationTimeRef.current = timestamp;

    const distance = target - current;
    const shouldSettleImmediately = reducedMotionRef.current || !enabledRef.current;
    const blendAmount = 1 - Math.exp(-elapsed / careersSequence.smoothingTimeConstantMs);
    const nextPosition = shouldSettleImmediately || Math.abs(distance) <= careersSequence.settleThreshold
      ? target
      : current + distance * blendAmount;

    displayedFrameRef.current = nextPosition;
    const drawToken = ++drawTokenRef.current;
    loadFramePair(nextPosition).then(() => {
      if (drawTokenRef.current === drawToken) drawFramePosition(nextPosition);
    });

    if (nextPosition !== target) {
      animationRequestRef.current = window.requestAnimationFrame(animateTowardTarget);
    } else {
      animationRequestRef.current = 0;
      lastAnimationTimeRef.current = 0;
    }
  }, [drawFramePosition, loadFramePair]);

  const requestFrame = useCallback((requestedIndex) => {
    const framePosition = clamp(requestedIndex, 0, careersSequence.frameCount - 1);
    const targetIndex = Math.round(framePosition);
    targetFrameRef.current = framePosition;

    const targetReady = framesRef.current.has(Math.floor(framePosition))
      && framesRef.current.has(Math.ceil(framePosition));
    onLoadingChange?.(!targetReady);
    loadFramePair(framePosition).then(() => onLoadingChange?.(false));

    for (let offset = 1; offset <= careersSequence.preloadRadius; offset += 1) {
      loadFrame(targetIndex + offset);
      loadFrame(targetIndex - offset);
    }

    if (!animationRequestRef.current) {
      animationRequestRef.current = window.requestAnimationFrame(animateTowardTarget);
    }
  }, [animateTowardTarget, loadFrame, loadFramePair, onLoadingChange]);

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
    if (isMobile) {
      onLoadingChange?.(false);
      return;
    }
    updateFromScroll();
  }, [enabled, isMobile, onLoadingChange, updateFromScroll]);

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
      onLoadingChange?.(false);
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
    loadFrame(0).then(() => {
      resize();
      requestFrame(0);
    });

    const decodedFrames = framesRef.current;
    const pendingFrames = promisesRef.current;
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      motionQuery.removeEventListener?.("change", onMotionPreferenceChange);
      window.cancelAnimationFrame(scrollRequestRef.current);
      window.cancelAnimationFrame(animationRequestRef.current);
      decodedFrames.clear();
      pendingFrames.clear();
      contextRef.current = null;
    };
  }, [isMobile, loadFrame, onLoadingChange, requestFrame, updateFromScroll]);

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
