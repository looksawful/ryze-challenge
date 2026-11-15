"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createLogoMorphRenderer, MORPH_DURATIONS, SETTLE_DURATION, type ParticleRenderer } from "./logo-morph";
import styles from "./IntegrationLogos.module.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const LOGOS = [
  { name: "Shopify", src: `${basePath}/platform-logos/shopify.avif` },
  { name: "Google Ads", src: `${basePath}/platform-logos/google-ads.svg` },
  { name: "Meta Ads", src: `${basePath}/platform-logos/meta.svg` },
  { name: "TikTok", src: `${basePath}/platform-logos/tiktok.svg` },
  { name: "Google Analytics", src: `${basePath}/platform-logos/google-analytics.svg` },
] as const;
const CYCLE = MORPH_DURATIONS.reduce((sum, duration) => sum + duration + SETTLE_DURATION, 0);

export default function IntegrationLogos() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let attempted = false;
    let renderer: ParticleRenderer | undefined;
    let visible = true;
    let frame = 0;
    let elapsed = 0;
    let previous = 0;
    let lastPaint = 0;

    const setMode = (mode: "static" | "marquee" | "webgl") => {
      host.dataset.mode = mode;
    };
    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    };
    const fallback = () => {
      stop();
      renderer?.dispose();
      renderer = undefined;
      setMode(motion.matches ? "static" : "marquee");
    };
    const phase = () => {
      let time = elapsed % CYCLE;
      for (let i = 0; i < MORPH_DURATIONS.length; i++) {
        const duration = MORPH_DURATIONS[i]!;
        if (time < duration) return [i, time / duration] as const;
        time -= duration + SETTLE_DURATION;
        if (time < 0) return [i, 1] as const;
      }
      return [0, 0] as const;
    };
    const tick = (now: number) => {
      frame = 0;
      if (!renderer || !visible || motion.matches || document.hidden || disposed) return;
      elapsed += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      const fps = window.innerWidth < 768 ? 30 : 60;
      if (now - lastPaint >= 1000 / fps) {
        const [index, progress] = phase();
        try {
          renderer.draw(index, progress, host.closest("[data-theme]")?.getAttribute("data-theme") !== "dawn");
          canvas.dataset.logoIndex = String(index);
        } catch {
          fallback();
          return;
        }
        lastPaint = now;
      }
      frame = window.requestAnimationFrame(tick);
    };
    const start = () => {
      stop();
      if (renderer && visible && !motion.matches && !document.hidden) frame = window.requestAnimationFrame(tick);
    };
    const initialize = async () => {
      if (attempted || motion.matches || disposed) return;
      attempted = true;
      try {
        const next = await createLogoMorphRenderer(canvas, LOGOS.map((logo) => logo.src));
        if (disposed || motion.matches) {
          next.dispose();
          if (!disposed) attempted = false;
          return;
        }
        renderer = next;
        setMode("webgl");
        renderer.resize();
        renderer.draw(0, 0, host.closest("[data-theme]")?.getAttribute("data-theme") !== "dawn");
        start();
      } catch {
        if (!disposed) fallback();
      }
    };
    const onMotion = () => {
      if (motion.matches) {
        stop();
        setMode("static");
      } else if (renderer) {
        setMode("webgl");
        start();
      } else if (!attempted) {
        void initialize();
      } else {
        setMode("marquee");
      }
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      fallback();
    };
    const onVisibility = () => start();
    const intersection = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      start();
    });
    const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => {
      if (!renderer) return;
      try {
        renderer.resize();
      } catch {
        fallback();
      }
    });

    intersection?.observe(host);
    resize?.observe(host);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    onMotion();

    return () => {
      disposed = true;
      stop();
      intersection?.disconnect();
      resize?.disconnect();
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={hostRef} className={styles.root} data-mode="static">
      <ul className={styles.staticList} aria-label="Platforms shown">
        {LOGOS.map(({ name, src }) => (
          <li key={name} className={styles.staticItem}>
            <Image className={styles.logo} src={src} alt={name} width={26} height={26} loading="eager" unoptimized />
          </li>
        ))}
      </ul>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <ul key={copy} className={styles.marqueeList}>
              {LOGOS.map(({ name, src }) => (
                <li key={name} className={styles.marqueeItem}>
                  <Image className={styles.logo} src={src} alt="" width={42} height={42} unoptimized />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
