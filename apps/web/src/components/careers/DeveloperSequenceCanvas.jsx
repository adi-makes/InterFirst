import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  careersSequence,
  easeSequencePlaybackRate,
  getSequenceFramePath,
  getSequenceSceneFrame,
  getSequenceSegment,
  wrapSequenceFrame,
} from "../../careers/developerSequence.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function createFrameIndexes(start, end) {
  const first = Math.min(start, end);
  const last = Math.max(start, end);
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

export const CareersSequenceCanvas = forwardRef(function CareersSequenceCanvas(
  { currentScene, onLoadingChange },
  ref,
) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const contextRef = useRef(null);
  const framesRef = useRef(new Map());
  const promisesRef = useRef(new Map());
  const failedRef = useRef(new Set());
  const animationFrameRef = useRef(0);
  const drawRequestRef = useRef(0);
  const idleHandleRef = useRef(null);
  const idleTimerRef = useRef(null);
  const transitionRef = useRef(null);
  const boostUntilRef = useRef(0);
  const boostDirectionRef = useRef(1);
  const playbackRateRef = useRef(careersSequence.ambientFramesPerSecond);
  const lastPlaybackTimeRef = useRef(null);
  const currentFrameRef = useRef(getSequenceSceneFrame(currentScene));
  const currentSceneRef = useRef(currentScene);
  const mountedRef = useRef(false);
  const visibleRef = useRef(typeof document === "undefined" || !document.hidden);
  const reducedMotionRef = useRef(false);
  const [fallbackPath, setFallbackPath] = useState(() =>
    getSequenceFramePath(getSequenceSceneFrame(currentScene)),
  );

  const drawFrame = useCallback((requestedIndex) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return false;

    const framePosition = wrapSequenceFrame(requestedIndex);
    const lowerIndex = Math.floor(framePosition);
    const upperIndex = (lowerIndex + 1) % careersSequence.frameCount;
    const blend = framePosition - lowerIndex;
    let lowerImage = framesRef.current.get(lowerIndex);
    let upperImage = framesRef.current.get(upperIndex);

    if (!lowerImage && !upperImage) {
      for (let offset = 1; offset < careersSequence.frameCount; offset += 1) {
        lowerImage =
          framesRef.current.get(lowerIndex - offset) ||
          framesRef.current.get(upperIndex + offset);
        if (lowerImage) break;
      }
    }

    lowerImage ||= upperImage;
    upperImage ||= lowerImage;
    if (!lowerImage?.naturalWidth || !lowerImage?.naturalHeight) return false;

    const drawCover = (image, alpha) => {
      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      context.globalAlpha = alpha;
      context.drawImage(image, x, y, drawWidth, drawHeight);
    };

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCover(lowerImage, 1);
    if (
      careersSequence.interpolateFrames &&
      upperImage !== lowerImage &&
      blend > 0
    ) {
      drawCover(upperImage, blend);
    }
    context.globalAlpha = 1;
    currentFrameRef.current = framePosition;
    containerRef.current.dataset.frameIndex = String(Math.round(framePosition));
    containerRef.current.dataset.framePosition = framePosition.toFixed(3);
    return true;
  }, []);

  const scheduleDraw = useCallback((frameIndex) => {
    window.cancelAnimationFrame(drawRequestRef.current);
    drawRequestRef.current = window.requestAnimationFrame(() => drawFrame(frameIndex));
  }, [drawFrame]);

  const loadFrame = useCallback((frameIndex) => {
    const index = clamp(Math.round(frameIndex), 0, careersSequence.frameCount - 1);
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
          // A loaded image is still drawable when decode() is unavailable or rejects.
        }
        if (mountedRef.current) {
          framesRef.current.set(index, image);
          while (framesRef.current.size > 72) {
            const oldestIndex = framesRef.current.keys().next().value;
            framesRef.current.delete(oldestIndex);
          }
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

  const loadRange = useCallback(async (start, end) => {
    const indexes = createFrameIndexes(start, end);
    const images = await Promise.all(indexes.map(loadFrame));
    return images.some(Boolean);
  }, [loadFrame]);

  const prepareSegment = useCallback(async (segmentIndex) => {
    if (segmentIndex < 0 || segmentIndex >= careersSequence.segmentCount) return true;
    const { start, end } = getSequenceSegment(segmentIndex);
    onLoadingChange?.(true);
    const hasFrame = await loadRange(start, end);
    onLoadingChange?.(false);
    return hasFrame;
  }, [loadRange, onLoadingChange]);

  useImperativeHandle(ref, () => ({
    prepareSegment,
    async playSegment(segmentIndex, direction) {
      const { start, end } = getSequenceSegment(segmentIndex);
      const to = direction === "backward" ? start : end;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      containerRef.current.dataset.segment = String(segmentIndex);
      containerRef.current.dataset.direction = direction;

      if (reducedMotion || !contextRef.current) {
        await loadFrame(to);
        setFallbackPath(getSequenceFramePath(to));
        scheduleDraw(to);
        delete containerRef.current.dataset.segment;
        delete containerRef.current.dataset.direction;
        return;
      }

      prepareSegment(segmentIndex);
      boostDirectionRef.current = direction === "backward" ? -1 : 1;
      boostUntilRef.current = performance.now() + careersSequence.transitionDuration;
      containerRef.current.dataset.playbackMode = "boosted";

      return new Promise((resolve) => {
        const timer = window.setTimeout(() => {
          if (transitionRef.current?.timer !== timer) return;
          transitionRef.current = null;
          containerRef.current.dataset.playbackMode = "ambient";
          delete containerRef.current.dataset.segment;
          delete containerRef.current.dataset.direction;
          resolve();
        }, careersSequence.transitionDuration);
        transitionRef.current = { timer, resolve };
      });
    },
    showScene(sceneIndex) {
      const frameIndex = getSequenceSceneFrame(sceneIndex);
      setFallbackPath(getSequenceFramePath(frameIndex));
      loadFrame(frameIndex).then(() => {
        if (reducedMotionRef.current) {
          currentFrameRef.current = frameIndex;
          scheduleDraw(frameIndex);
        }
      });
    },
  }), [loadFrame, prepareSegment, scheduleDraw]);

  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    contextRef.current = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });

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
      scheduleDraw(currentFrameRef.current);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const initialFrame = getSequenceSceneFrame(currentSceneRef.current);
    loadFrame(initialFrame).then(() => {
      scheduleDraw(initialFrame);
    });

    const onVisibilityChange = () => {
      visibleRef.current = !document.hidden;
      lastPlaybackTimeRef.current = null;
    };
    const onMotionPreferenceChange = (event) => {
      reducedMotionRef.current = event.matches;
      lastPlaybackTimeRef.current = null;
      if (event.matches) {
        currentFrameRef.current = getSequenceSceneFrame(currentSceneRef.current);
        container.dataset.playbackMode = "reduced";
        scheduleDraw(currentFrameRef.current);
      } else {
        container.dataset.playbackMode = "ambient";
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener?.("change", onMotionPreferenceChange);

    container.dataset.playbackMode = reducedMotionRef.current ? "reduced" : "ambient";
    const tick = (now) => {
      if (!mountedRef.current) return;

      if (!visibleRef.current || reducedMotionRef.current) {
        lastPlaybackTimeRef.current = now;
        animationFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const previousTime = lastPlaybackTimeRef.current ?? now;
      const elapsedSeconds = Math.min(Math.max(now - previousTime, 0), 80) / 1000;
      lastPlaybackTimeRef.current = now;
      const boosted = now < boostUntilRef.current;
      const targetFramesPerSecond = boosted
        ? careersSequence.boostedFramesPerSecond
        : careersSequence.ambientFramesPerSecond;
      const direction = boosted ? boostDirectionRef.current : 1;
      const targetPlaybackRate = targetFramesPerSecond * direction;
      playbackRateRef.current = easeSequencePlaybackRate(
        playbackRateRef.current,
        targetPlaybackRate,
        elapsedSeconds,
      );
      const nextFrame =
        currentFrameRef.current + playbackRateRef.current * elapsedSeconds;
      const normalizedFrame = wrapSequenceFrame(nextFrame);
      const lowerIndex = Math.floor(normalizedFrame);
      const upperIndex = (lowerIndex + 1) % careersSequence.frameCount;

      currentFrameRef.current = normalizedFrame;
      loadFrame(lowerIndex);
      loadFrame(upperIndex);
      drawFrame(normalizedFrame);
      container.dataset.playbackMode = boosted ? "boosted" : "ambient";
      container.dataset.framesPerSecond = playbackRateRef.current.toFixed(3);
      animationFrameRef.current = window.requestAnimationFrame(tick);
    };
    animationFrameRef.current = window.requestAnimationFrame(tick);

    const decodedFrames = framesRef.current;
    const pendingFrames = promisesRef.current;

    return () => {
      mountedRef.current = false;
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener?.("change", onMotionPreferenceChange);
      window.cancelAnimationFrame(animationFrameRef.current);
      window.cancelAnimationFrame(drawRequestRef.current);
      if (idleHandleRef.current !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandleRef.current);
      }
      window.clearTimeout(idleTimerRef.current);
      if (transitionRef.current) {
        window.clearTimeout(transitionRef.current.timer);
        transitionRef.current.resolve();
      }
      transitionRef.current = null;
      decodedFrames.clear();
      pendingFrames.clear();
      contextRef.current = null;
    };
  }, [drawFrame, loadFrame, scheduleDraw]);

  useEffect(() => {
    currentSceneRef.current = currentScene;
    const endpoint = getSequenceSceneFrame(currentScene);
    setFallbackPath(getSequenceFramePath(endpoint));
    loadFrame(endpoint).then(() => {
      if (reducedMotionRef.current) scheduleDraw(endpoint);
    });

    const adjacentSegments = [currentScene - 1, currentScene].filter(
      (segment) => segment >= 0 && segment < careersSequence.segmentCount,
    );
    Promise.all(adjacentSegments.map(prepareSegment)).then(() => {
      const loadRemaining = async () => {
        for (let index = 0; index < careersSequence.frameCount; index += 1) {
          if (!mountedRef.current) return;
          if (!framesRef.current.has(index) && !promisesRef.current.has(index)) {
            await loadFrame(index);
          }
        }
      };

      if ("requestIdleCallback" in window) {
        if (idleHandleRef.current !== null) window.cancelIdleCallback(idleHandleRef.current);
        idleHandleRef.current = window.requestIdleCallback(loadRemaining, { timeout: 2500 });
      } else {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = window.setTimeout(loadRemaining, 400);
      }
    });
  }, [currentScene, loadFrame, prepareSegment, scheduleDraw]);

  return (
    <div
      aria-hidden="true"
      className="careers-sequence"
      ref={containerRef}
      style={{ "--careers-sequence-fallback": `url(${fallbackPath})` }}
    >
      <canvas ref={canvasRef} />
      <div className="careers-sequence__veil" />
    </div>
  );
});

export const DeveloperSequenceCanvas = CareersSequenceCanvas;
