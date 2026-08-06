import { useEffect, useRef } from "react";
import { createFramePreloader } from "../utils/preloadFrames.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function drawCover(context, canvas, image) {
  const scale = Math.max(
    canvas.width / image.naturalWidth,
    canvas.height / image.naturalHeight,
  );
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(
    image,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height,
  );
}

export function useImageSequence({
  canvasRef,
  config,
  getFramePath,
  sectionRef,
}) {
  const previousFrameRef = useRef(-1);
  const requestedFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return undefined;

    const context = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!context) return undefined;

    const preloader = createFramePreloader({
      concurrency: config.preloadConcurrency,
      frameCount: config.frameCount,
      getFramePath,
    });
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const constrainedDevice = (
      window.matchMedia("(max-width: 640px)").matches
      || (navigator.deviceMemory && navigator.deviceMemory <= 4)
    );
    let animationFrame = 0;
    let controllerVersion = 0;
    let disposed = false;
    let progressivePreloadStarted = false;
    let scrollTrigger = null;
    let removeNativeScroll = null;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const drawLoadedFrame = (frameIndex) => {
      if (frameIndex === previousFrameRef.current) return true;
      const image = preloader.get(frameIndex);
      if (!image?.naturalWidth || !image?.naturalHeight) return false;

      drawCover(context, canvas, image);
      previousFrameRef.current = frameIndex;
      section.dataset.frameIndex = String(frameIndex);
      section.dataset.ready = "true";
      return true;
    };

    const drawBestAvailableFrame = () => {
      animationFrame = 0;
      const requestedFrame = requestedFrameRef.current;
      if (drawLoadedFrame(requestedFrame)) return;
      const nearest = preloader.getNearest(requestedFrame);
      if (nearest) drawLoadedFrame(nearest.index);
    };

    const scheduleDraw = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(drawBestAvailableFrame);
    };

    const requestFrame = (requestedFrame) => {
      const exactFrame = clamp(Math.floor(requestedFrame), 0, config.frameCount - 1);
      const frame = constrainedDevice && exactFrame < config.frameCount - 1
        ? exactFrame - (exactFrame % 2)
        : exactFrame;
      requestedFrameRef.current = frame;
      if (frame === previousFrameRef.current) return;

      preloader.load(frame, { priority: true }).then(() => {
        if (!disposed && requestedFrameRef.current === frame) scheduleDraw();
      });
      for (let offset = 1; offset <= config.preloadRadius; offset += 1) {
        preloader.load(frame + offset);
        preloader.load(frame - offset);
      }
      scheduleDraw();
    };

    const renderProgress = (progress) => {
      if (motionQuery.matches) {
        requestFrame(0);
        return;
      }
      const clampedProgress = clamp(progress, 0, 1);
      const normalizedProgress = clampedProgress >= 0.999 ? 1 : clampedProgress;
      requestFrame(Math.floor(normalizedProgress * (config.frameCount - 1)));
    };

    const syncProgressFromSection = () => {
      const bounds = section.getBoundingClientRect();
      const scrollDistance = Math.max(bounds.height - window.innerHeight, 1);
      renderProgress(clamp(-bounds.top / scrollDistance, 0, 1));
    };

    const renderNativeProgress = () => {
      animationFrame = 0;
      syncProgressFromSection();
    };

    const installNativeScroll = () => {
      const onScroll = () => {
        if (!animationFrame) animationFrame = window.requestAnimationFrame(renderNativeProgress);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    };

    const startProgressivePreload = () => {
      if (progressivePreloadStarted || motionQuery.matches) return;
      progressivePreloadStarted = true;
      const step = constrainedDevice ? 2 : 1;
      const indexes = [];
      for (let index = step; index < config.frameCount; index += step) indexes.push(index);
      if (!indexes.includes(config.frameCount - 1)) indexes.push(config.frameCount - 1);
      preloader.preloadProgressively({
        batchSize: config.preloadBatchSize,
        indexes,
      });
    };

    const destroyScrollController = () => {
      controllerVersion += 1;
      scrollTrigger?.kill();
      scrollTrigger = null;
      removeNativeScroll?.();
      removeNativeScroll = null;
    };

    const createScrollController = async () => {
      destroyScrollController();
      if (motionQuery.matches || disposed) return;
      const version = controllerVersion;
      removeNativeScroll = installNativeScroll();

      try {
        const [{ gsap }, scrollTriggerModule] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (disposed || motionQuery.matches || version !== controllerVersion) return;

        const ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;
        gsap.registerPlugin(ScrollTrigger);
        scrollTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => renderProgress(progress),
        });
        removeNativeScroll?.();
        removeNativeScroll = null;
        section.dataset.controller = "gsap";
      } catch {
        section.dataset.controller = "native";
      }
    };

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        config.maxDevicePixelRatio,
        config.maxCanvasWidth / Math.max(bounds.width, 1),
        config.maxCanvasHeight / Math.max(bounds.height, 1),
      );
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        previousFrameRef.current = -1;
        scheduleDraw();
      }
      scrollTrigger?.refresh();
      syncProgressFromSection();
    };

    const onMotionPreferenceChange = () => {
      destroyScrollController();
      if (motionQuery.matches) {
        requestedFrameRef.current = 0;
        scheduleDraw();
      } else {
        startProgressivePreload();
        createScrollController();
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(section);
    resizeObserver.observe(canvas);
    motionQuery.addEventListener?.("change", onMotionPreferenceChange);
    resizeCanvas();
    preloader.load(0, { priority: true }).then(() => {
      if (disposed) return;
      requestedFrameRef.current = 0;
      scheduleDraw();
      if (!motionQuery.matches) {
        startProgressivePreload();
        createScrollController();
      }
    });

    return () => {
      disposed = true;
      destroyScrollController();
      resizeObserver.disconnect();
      motionQuery.removeEventListener?.("change", onMotionPreferenceChange);
      window.cancelAnimationFrame(animationFrame);
      preloader.dispose();
      previousFrameRef.current = -1;
      requestedFrameRef.current = 0;
    };
  }, [canvasRef, config, getFramePath, sectionRef]);
}
