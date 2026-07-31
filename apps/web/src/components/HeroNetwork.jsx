import { useEffect, useRef } from "react";

const BLUEPRINT = [
  [-7, 0, 1],
  [-6, -2, 0],
  [-6, 1, 2],
  [-5, -3, 1],
  [-5, 0, 0],
  [-5, 2, 1],
  [-4, -1, 2],
  [-4, 2, 0],
  [-3, -2, 0],
  [-3, 0, 1],
  [-3, 3, 2],
  [-2, -3, 0],
  [-2, -1, 2],
  [-2, 1, 0],
  [-1, -2, 1],
  [-1, 1, 0],
  [0, -3, 1],
  [0, 0, 2],
  [0, 2, 0],
  [1, -2, 2],
  [1, 1, 0],
  [1, 3, 1],
  [2, -3, 0],
  [2, -1, 1],
  [2, 1, 2],
  [3, -2, 1],
  [3, 0, 0],
  [3, 2, 1],
  [4, -3, 0],
  [4, 1, 2],
  [5, -1, 1],
  [5, 2, 0],
  [6, -2, 2],
  [6, 1, 0],
];

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

function createLayout(width, height) {
  const spacing = width <= 640 ? 88 : 96;
  const anchorX = Math.round((width * 0.5) / spacing) * spacing;
  const anchorY = Math.round((height * 0.5) / spacing) * spacing;
  const margin = 18;

  const nodes = BLUEPRINT.map(([column, row, tone], index) => ({
    x: anchorX + column * spacing,
    y: anchorY + row * spacing,
    column,
    row,
    tone,
    phase: index * 1.618,
  })).filter(
    (node) =>
      node.x >= margin &&
      node.x <= width - margin &&
      node.y >= margin &&
      node.y <= height - margin,
  );

  const primary = [];
  const alternate = [];

  nodes.forEach((node, index) => {
    nodes.slice(index + 1).forEach((candidate, offset) => {
      const candidateIndex = index + offset + 1;
      const columnDistance = Math.abs(node.column - candidate.column);
      const rowDistance = Math.abs(node.row - candidate.row);
      const nearby =
        columnDistance <= 1 &&
        rowDistance <= 1 &&
        columnDistance + rowDistance > 0;

      if (!nearby) return;

      const edge = [index, candidateIndex, (index + candidateIndex) * 0.47];
      if ((index * 7 + candidateIndex * 11) % 4 === 0) {
        alternate.push(edge);
      } else if ((index + candidateIndex) % 3 !== 0) {
        primary.push(edge);
      }
    });
  });

  return { nodes, primary, alternate };
}

export function HeroNetwork({ variant = "home" }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const pulseLayer = pulseRef.current;
    const hero = root?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!root || !canvas || !pulseLayer || !hero || !context) return undefined;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const finePointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    let layout = { nodes: [], primary: [], alternate: [] };
    let width = 0;
    let height = 0;
    let frame = 0;
    let isVisible = !document.hidden;
    let isIntersecting = true;
    let reducedMotion = reducedMotionQuery.matches;
    let scrollProgress = 0;
    let pulseTimer = 0;
    let pulseActive = false;
    let pulseRunCount = 0;
    let pulseStartedAt = 0;
    let pulseTotalDuration = 0;
    let pulseItems = [];
    let lastFrameTimestamp = 0;
    let interactionStates = [];
    const pointer = {
      x: 0,
      y: 0,
      clientX: 0,
      clientY: 0,
      active: false,
    };

    const setCanvasSize = () => {
      const bounds = root.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      if (
        nextWidth === width &&
        nextHeight === height &&
        canvas.width === Math.round(nextWidth * dpr)
      ) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = createLayout(width, height);
      interactionStates = layout.nodes.map(() => ({
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0,
      }));
      pulseLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
      root.dataset.nodeCount = String(layout.nodes.length);
      root.dataset.connectionCount = String(
        layout.primary.length + layout.alternate.length,
      );
      root.dataset.leftNodeCount = String(
        layout.nodes.filter((node) => node.x < width / 2).length,
      );
      root.dataset.rightNodeCount = String(
        layout.nodes.filter((node) => node.x >= width / 2).length,
      );
    };

    const clearPulse = (state = "idle") => {
      window.clearTimeout(pulseTimer);
      pulseTimer = 0;
      pulseStartedAt = 0;
      pulseTotalDuration = 0;
      pulseItems = [];
      pulseLayer.replaceChildren();
      pulseActive = false;
      root.dataset.pulseActive = "false";
      root.dataset.pulseState = state;
      root.dataset.pulseSegments = "0";
      root.dataset.pulseProgress = "0";
    };

    const buildPulseRoute = () => {
      const adjacency = Array.from({ length: layout.nodes.length }, () => []);

      [...layout.primary, ...layout.alternate].forEach(([from, to]) => {
        adjacency[from]?.push(to);
        adjacency[to]?.push(from);
      });

      const candidates = adjacency
        .map((neighbors, index) => ({ index, neighbors }))
        .filter(({ neighbors }) => neighbors.length > 0);

      if (!candidates.length) return [];

      for (let attempt = 0; attempt < 12; attempt += 1) {
        const start =
          candidates[Math.floor(Math.random() * candidates.length)].index;
        const targetCount = 4 + Math.floor(Math.random() * 5);
        const visited = new Set([start]);
        const route = [];

        while (route.length < targetCount) {
          const frontier = [];
          visited.forEach((from) => {
            adjacency[from].forEach((to) => {
              if (!visited.has(to)) frontier.push([from, to]);
            });
          });

          if (!frontier.length) break;
          const [from, to] =
            frontier[Math.floor(Math.random() * frontier.length)];
          visited.add(to);
          route.push([from, to]);
        }

        if (route.length >= 4) return route;
      }

      return [];
    };

    const schedulePulse = () => {
      if (
        pulseTimer ||
        pulseActive ||
        reducedMotion ||
        !isVisible ||
        !isIntersecting
      ) {
        return;
      }

      const delay = 6000 + Math.round(Math.random() * 4000);
      root.dataset.pulseState = "scheduled";
      root.dataset.pulseDelay = String(delay);
      pulseTimer = window.setTimeout(() => {
        pulseTimer = 0;
        startPulse();
      }, delay);
    };

    const finishPulse = () => {
      pulseStartedAt = 0;
      pulseTotalDuration = 0;
      pulseItems = [];
      pulseLayer.replaceChildren();
      pulseActive = false;
      root.dataset.pulseActive = "false";
      root.dataset.pulseState = "idle";
      root.dataset.pulseSegments = "0";
      root.dataset.pulseProgress = "0";
      schedulePulse();
    };

    const startPulse = () => {
      if (reducedMotion || !isVisible || !isIntersecting || pulseActive) {
        clearPulse(reducedMotion ? "disabled" : "paused");
        return;
      }

      const route = buildPulseRoute();
      if (route.length < 4) {
        schedulePulse();
        return;
      }

      const namespace = "http://www.w3.org/2000/svg";
      const segmentDelay = 520;
      const segmentDuration = 640;
      const nodeDuration = 520;

      pulseActive = true;
      pulseStartedAt = 0;
      pulseRunCount += 1;
      root.dataset.pulseActive = "true";
      root.dataset.pulseState = "active";
      root.dataset.pulseSegments = String(route.length);
      root.dataset.pulseRunCount = String(pulseRunCount);
      root.dataset.pulseStartNode = String(route[0][0]);

      route.forEach(([fromIndex, toIndex], index) => {
        const from = layout.nodes[fromIndex];
        const to = layout.nodes[toIndex];
        if (!from || !to) return;

        const path = document.createElementNS(namespace, "path");
        path.setAttribute("d", `M ${from.x} ${from.y} L ${to.x} ${to.y}`);
        path.setAttribute("pathLength", "1");
        path.setAttribute("class", "hero-network__pulse-path");
        pulseLayer.append(path);
        path.style.opacity = "0";
        path.style.strokeDashoffset = "1";

        const node = document.createElementNS(namespace, "circle");
        node.setAttribute("cx", String(to.x));
        node.setAttribute("cy", String(to.y));
        node.setAttribute("r", "1.55");
        node.setAttribute("class", "hero-network__pulse-node");
        pulseLayer.append(node);
        node.style.opacity = "0";

        pulseItems.push({ index, node, path });
      });

      pulseTotalDuration =
        (route.length - 1) * segmentDelay + segmentDuration + nodeDuration;
    };

    const updatePulse = (timestamp) => {
      if (!pulseActive) return;
      if (!pulseStartedAt) pulseStartedAt = timestamp;

      const segmentDelay = 520;
      const segmentDuration = 640;
      const nodeDuration = 520;
      const elapsed = timestamp - pulseStartedAt;
      const smoothstep = (value) => value * value * (3 - 2 * value);

      pulseItems.forEach(({ index, node, path }) => {
        const pathProgress = clamp(
          (elapsed - index * segmentDelay) / segmentDuration,
          0,
          1,
        );
        const easedPathProgress = smoothstep(pathProgress);
        const pathOpacity =
          pathProgress <= 0
            ? 0
            : pathProgress < 0.2
              ? 0.26 * (pathProgress / 0.2)
              : pathProgress > 0.72
                ? 0.26 * ((1 - pathProgress) / 0.28)
                : 0.26;

        path.style.strokeDashoffset = String(1 - easedPathProgress);
        path.style.opacity = String(Math.max(0, pathOpacity));

        const nodeStart =
          index * segmentDelay + segmentDuration * 0.72;
        const nodeProgress = clamp(
          (elapsed - nodeStart) / nodeDuration,
          0,
          1,
        );
        const nodeOpacity =
          nodeProgress <= 0
            ? 0
            : nodeProgress < 0.28
              ? 0.64 * (nodeProgress / 0.28)
              : 0.64 * ((1 - nodeProgress) / 0.72);
        node.style.opacity = String(Math.max(0, nodeOpacity));
      });

      root.dataset.pulseProgress = String(
        clamp(elapsed / pulseTotalDuration, 0, 1).toFixed(2),
      );

      if (elapsed >= pulseTotalDuration) finishPulse();
    };

    const syncPulse = () => {
      if (reducedMotion) {
        clearPulse("disabled");
      } else if (!isVisible || !isIntersecting) {
        clearPulse("paused");
      } else if (!pulseActive) {
        schedulePulse();
      }
    };

    const getRenderedNodes = (time, deltaSeconds = 0) => {
      const scroll = reducedMotion ? 0 : scrollProgress;
      const upwardDrift = scroll * -26;

      return layout.nodes.map((node, index) => {
        const ambientX = reducedMotion
          ? 0
          : Math.sin(time * 0.18 + node.phase) * 2.2 +
            Math.sin(time * 0.071 + node.phase * 0.6) * 0.9;
        const ambientY = reducedMotion
          ? 0
          : Math.cos(time * 0.15 + node.phase * 1.13) * 1.9 +
            Math.sin(time * 0.063 + node.phase) * scroll * 1.4;
        const interaction =
          interactionStates[index] ||
          (interactionStates[index] = {
            x: 0,
            y: 0,
            velocityX: 0,
            velocityY: 0,
          });
        let targetX = 0;
        let targetY = 0;
        let proximity = 0;

        if (
          !reducedMotion &&
          finePointerQuery.matches &&
          pointer.active
        ) {
          const deltaX = node.x - pointer.x;
          const deltaY = node.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);
          proximity = clamp(1 - distance / 120, 0, 1);

          if (distance > 0 && proximity > 0) {
            const displacement =
              4 * proximity * proximity * (3 - 2 * proximity);
            targetX = (deltaX / distance) * displacement;
            targetY = (deltaY / distance) * displacement;
          }
        }

        if (reducedMotion) {
          interaction.x = 0;
          interaction.y = 0;
          interaction.velocityX = 0;
          interaction.velocityY = 0;
        } else if (deltaSeconds > 0) {
          const stiffness = 92;
          const damping = 17;
          interaction.velocityX +=
            ((targetX - interaction.x) * stiffness -
              interaction.velocityX * damping) *
            deltaSeconds;
          interaction.velocityY +=
            ((targetY - interaction.y) * stiffness -
              interaction.velocityY * damping) *
            deltaSeconds;
          interaction.x += interaction.velocityX * deltaSeconds;
          interaction.y += interaction.velocityY * deltaSeconds;

          const displacement = Math.hypot(interaction.x, interaction.y);
          if (displacement > 4) {
            const scale = 4 / displacement;
            interaction.x *= scale;
            interaction.y *= scale;
          }
        }

        return {
          ...node,
          renderedX: node.x + ambientX + interaction.x,
          renderedY: node.y + ambientY + interaction.y + upwardDrift,
          interactionOffset: Math.hypot(interaction.x, interaction.y),
          proximity,
        };
      });
    };

    const draw = (time = 0, deltaSeconds = 0) => {
      setCanvasSize();
      context.clearRect(0, 0, width, height);

      const nodes = getRenderedNodes(time, deltaSeconds);
      const scrollAlpha = reducedMotion ? 1 : 1 - scrollProgress * 0.74;
      const reconnect =
        0.5 +
        0.5 *
          Math.sin(time * 0.075 + Math.sin(time * 0.034) * 0.8);

      const drawEdges = (edges, mix, baseAlpha) => {
        edges.forEach(([fromIndex, toIndex, phase]) => {
          const from = nodes[fromIndex];
          const to = nodes[toIndex];
          if (!from || !to) return;

          const proximity = Math.max(from.proximity, to.proximity);
          const breathing = reducedMotion
            ? 0.72
            : 0.55 + Math.sin(time * 0.11 + phase) * 0.18;
          const alpha =
            (baseAlpha + breathing * 0.055 + proximity * 0.12) *
            mix *
            scrollAlpha;

          context.beginPath();
          context.moveTo(from.renderedX, from.renderedY);
          context.lineTo(to.renderedX, to.renderedY);
          context.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
          context.lineWidth = 0.8;
          context.stroke();
        });
      };

      drawEdges(layout.primary, 0.74 + (1 - reconnect) * 0.26, 0.055);
      drawEdges(layout.alternate, 0.28 + reconnect * 0.72, 0.035);

      nodes.forEach((node) => {
        const pulse = reducedMotion
          ? 0.72
          : 0.72 + Math.sin(time * 0.19 + node.phase) * 0.13;
        const radius = 1.15 + node.tone * 0.12 + node.proximity * 0.35;
        const toneAlpha = [0.56, 0.44, 0.68][node.tone];

        context.beginPath();
        context.arc(
          node.renderedX,
          node.renderedY,
          radius,
          0,
          Math.PI * 2,
        );
        context.fillStyle = `rgba(37, 99, 235, ${
          toneAlpha * pulse * scrollAlpha
        })`;
        context.fill();
      });

      root.dataset.scrollProgress = scrollProgress.toFixed(2);
      root.dataset.pointerActive = String(pointer.active);
      root.dataset.reducedMotion = String(reducedMotion);
      root.dataset.highlightedNodeCount = String(
        nodes.filter((node) => node.proximity > 0.01).length,
      );
      root.dataset.interactionEnabled = String(
        finePointerQuery.matches && !reducedMotion,
      );
      root.dataset.interactionRadius = "120";
      root.dataset.interactionAffectedNodes = String(
        nodes.filter((node) => node.interactionOffset > 0.05).length,
      );
      root.dataset.interactionMaxOffset = Math.max(
        0,
        ...nodes.map((node) => node.interactionOffset),
      ).toFixed(2);
    };

    const animate = (timestamp) => {
      const deltaSeconds = lastFrameTimestamp
        ? Math.min((timestamp - lastFrameTimestamp) / 1000, 1 / 30)
        : 1 / 60;
      lastFrameTimestamp = timestamp;
      draw(timestamp / 1000, deltaSeconds);
      updatePulse(timestamp);
      frame = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastFrameTimestamp = 0;
      root.dataset.running = "false";
    };

    const syncAnimation = () => {
      stop();
      if (!reducedMotion && isVisible && isIntersecting) {
        root.dataset.running = "true";
        frame = window.requestAnimationFrame(animate);
      } else {
        draw(0);
      }
    };

    const handlePointerMove = (event) => {
      if (!finePointerQuery.matches || reducedMotion) return;
      const bounds = hero.getBoundingClientRect();
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.x = pointer.clientX - bounds.left;
      pointer.y = pointer.clientY - bounds.top;
      pointer.active =
        pointer.x >= 0 &&
        pointer.x <= bounds.width &&
        pointer.y >= 0 &&
        pointer.y <= bounds.height;
      root.dataset.pointerRegion = pointer.active
        ? pointer.x < bounds.width / 2
          ? "left"
          : "right"
        : "none";
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      root.dataset.pointerRegion = "none";
    };

    const handleScroll = () => {
      if (reducedMotion) return;
      const bounds = hero.getBoundingClientRect();
      scrollProgress = clamp(-bounds.top / Math.max(bounds.height, 1), 0, 1);
      pulseLayer.style.transform = `translate3d(0, ${
        scrollProgress * -26
      }px, 0)`;
      if (pointer.active) {
        pointer.x = pointer.clientX - bounds.left;
        pointer.y = pointer.clientY - bounds.top;
        pointer.active =
          pointer.x >= 0 &&
          pointer.x <= bounds.width &&
          pointer.y >= 0 &&
          pointer.y <= bounds.height;
        if (!pointer.active) root.dataset.pointerRegion = "none";
      }
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      syncAnimation();
      syncPulse();
    };

    const handleMotionPreference = () => {
      reducedMotion = reducedMotionQuery.matches;
      pointer.active = false;
      scrollProgress = 0;
      pulseLayer.style.transform = "translate3d(0, 0, 0)";
      syncAnimation();
      syncPulse();
    };

    const handlePointerCapability = () => {
      if (finePointerQuery.matches) return;
      handlePointerLeave();
    };

    const resizeObserver = new ResizeObserver(() => {
      width = 0;
      setCanvasSize();
      if (pulseActive) {
        clearPulse("idle");
        schedulePulse();
      }
      if (reducedMotion || !frame) draw(0);
    });
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        syncAnimation();
        syncPulse();
      },
      { threshold: 0.01 },
    );

    resizeObserver.observe(root);
    intersectionObserver.observe(root);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotionQuery.addEventListener("change", handleMotionPreference);
    finePointerQuery.addEventListener("change", handlePointerCapability);

    root.dataset.pulseRunCount = "0";
    root.dataset.pulseActive = "false";
    root.dataset.pulseProgress = "0";
    setCanvasSize();
    handleScroll();
    syncAnimation();
    syncPulse();

    return () => {
      stop();
      clearPulse("stopped");
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotionQuery.removeEventListener("change", handleMotionPreference);
      finePointerQuery.removeEventListener("change", handlePointerCapability);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`hero-network hero-network--${variant}`}
      ref={rootRef}
    >
      <div className="hero-network__grid" />
      <canvas ref={canvasRef} />
      <svg
        className="hero-network__pulse"
        focusable="false"
        preserveAspectRatio="none"
        ref={pulseRef}
      />
    </div>
  );
}
