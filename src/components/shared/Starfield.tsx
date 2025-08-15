import React, { useEffect, useRef } from "react";

type StarfieldProps = {
  speed?: number;         // visual base speed multiplier
  density?: number;       // stars per area multiplier
  parallaxDepth?: number; // how much z-depth affects velocity
  className?: string;
};

/**
 * Starfield
 * Canvas-based starfield with single RAF loop, HiDPI scaling, resize handling,
 * parallax via z-depth, wrap-around, and reduced-motion respect.
 */
const Starfield: React.FC<StarfieldProps> = ({
  speed = 1.35,
  density = 1.25,
  parallaxDepth = 0.6,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const context = ctx;

    let running = true;
    let width = 0;
    let height = 0;
    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = Math.max(window.devicePixelRatio || 1, 1);

    // Motion preferences
    const motionMql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const prefersReduced = !!motionMql?.matches;
    let effectiveSpeedMultiplier = prefersReduced ? Math.max(0.1, speed * 0.15) : speed;
    let twinkleAmplitude = prefersReduced ? 0.05 : 0.15;

    type Star = {
      x: number;     // css px
      y: number;     // css px
      z: number;     // 0..1, 0 near (faster), 1 far (slower)
      s: number;     // css px base size
      phase: number; // twinkle phase
      tw: number;    // twinkle amplitude modifier
    };

    let stars: Star[] = [];
    const maxStarsCap = 1200; // performance guard

    function pickStarCount(area: number): number {
      // Base density factor: one star per ~8000 px^2 at density 1.0
      const base = Math.round((area / 8000) * density);
      // keep a comfortable visible minimum, cap for perf
      return Math.max(120, Math.min(base, maxStarsCap));
    }

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const rect = (parent ?? canvas).getBoundingClientRect();
      cssWidth = Math.max(1, Math.floor(rect.width));
      cssHeight = Math.max(1, Math.floor(rect.height));

      dpr = Math.max(window.devicePixelRatio || 1, 1);
      width = Math.floor(cssWidth * dpr);
      height = Math.floor(cssHeight * dpr);

      // Canvas buffer size in device pixels
      canvas.width = width;
      canvas.height = height;

      // Ensure the canvas appears the correct size in CSS pixels
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      // Scale drawing operations to CSS pixels
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      // Recompute stars for new area
      const count = pickStarCount(cssWidth * cssHeight);
      regenerateStars(count);
    }

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    function regenerateStars(count: number) {
      stars = new Array(count).fill(0).map<Star>(() => {
        const z = Math.random(); // 0 near, 1 far
        // base size: slightly biased so nearer stars are a bit larger
        const baseSize = rand(0.6, 1.6) * (1.0 + (1.0 - z) * 0.4);
        return {
          x: rand(0, cssWidth),
          y: rand(0, cssHeight),
          z,
          s: baseSize,
          phase: rand(0, Math.PI * 2),
          tw: rand(0.6, 1.0),
        };
      });
    }

    function onMotionChange(e: MediaQueryListEvent) {
      const reduced = e.matches;
      effectiveSpeedMultiplier = reduced ? Math.max(0.1, speed * 0.15) : speed;
      twinkleAmplitude = reduced ? 0.05 : 0.15;
    }

    // Initial size
    resize();

    // Resize listener
    const resizeHandler = () => {
      // Throttle via rAF to avoid layout storm during rapid resizes
      cancelAnimationFrame(rafRef.current || 0);
      resize();
      rafRef.current = requestAnimationFrame(loop);
    };
    window.addEventListener("resize", resizeHandler);

    // Motion change listener (with fallback)
    if (motionMql) {
      try {
        motionMql.addEventListener("change", onMotionChange);
      } catch {
        // Safari/old Chrome fallback
        motionMql.addListener(onMotionChange);
      }
    }

    let lastTime = performance.now();

    function loop(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000); // clamp delta for stability
      lastTime = now;

      // Clear canvas
      context.clearRect(0, 0, cssWidth, cssHeight);

      // Base pixel-per-second tuned for feel; multiplied by user speed and z-depth factor
      const basePps = 28; // px/s baseline

      // Draw stars
      context.fillStyle = "#ffffff";
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];

        // Parallax velocity: nearer (z small) move faster
        const depthFactor = 0.35 + (1.0 - st.z) * parallaxDepth; // ~0.35..(0.35+parallaxDepth)
        const vy = basePps * effectiveSpeedMultiplier * depthFactor;

        // Advance
        st.y += vy * dt;

        // Wrap-around when exiting viewport
        if (st.y > cssHeight + 2) {
          st.y = -2;
          st.x = rand(0, cssWidth);
          // Keep z to preserve distribution; randomize phase for variety
          st.phase = rand(0, Math.PI * 2);
        }

        // Twinkle: subtle alpha variation
        st.phase += dt * rand(0.8, 1.2);
        const tw = twinkleAmplitude * st.tw;
        const alpha = 0.65 + Math.sin(st.phase) * tw;

        // Size varies a bit with depth
        const size = Math.max(0.5, st.s * (0.8 + (1 - st.z) * 0.6));

        // Draw as tiny rects for perf (faster than many arcs)
        context.globalAlpha = Math.max(0.1, Math.min(0.8, alpha));
        context.fillRect(st.x, st.y, size, size);
      }

      context.globalAlpha = 1.0;
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame((t) => {
      lastTime = t;
      loop(t);
    });

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeHandler);
      if (motionMql) {
        try {
          motionMql.removeEventListener("change", onMotionChange);
        } catch {
          motionMql.removeListener(onMotionChange);
        }
      }
    };
    // Dependencies intentionally limited to primary props for performance; consider memoizing helpers if warnings persist.
  }, [speed, density, parallaxDepth]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    />
  );
};

export default Starfield;