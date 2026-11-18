"use client";

import { useEffect, type RefObject } from "react";

/** Rizzie keeps its Grid slot; only GSAP translates it between positions. */
export function useRizzieStageMotion(zoneRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const target = zoneRef.current;
    if (!target) return;
    const zone: HTMLDivElement = target;

    const desktop = matchMedia("(min-width: 800px) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const cookies = document.querySelector<HTMLElement>('[data-motion-slot="cookies"]');
    let gsap: typeof import("gsap")["gsap"] | undefined;
    let active: { kill: () => void } | undefined;
    let revealed = false;
    let focused = false;
    let arrived = false;
    let perched = false;
    let raf = 0;
    let idleTimer = 0;
    let alive = true;

    const signal = (action: string) => window.dispatchEvent(
      new CustomEvent("rizzie:motion", { detail: { action } }),
    );
    const notice = () => cookies?.querySelector<HTMLElement>("aside");
    const openNotice = () => {
      const el = notice();
      return el && el.getClientRects().length
        ? el.getBoundingClientRect() : null;
    };
    // Convert viewport coordinates to offsets from the permanent CSS Grid slot.
    const position = () => {
      const box = zone.getBoundingClientRect();
      return {
        left: box.left - (Number(gsap?.getProperty(zone, "x")) || 0),
        top: box.top - (Number(gsap?.getProperty(zone, "y")) || 0),
        width: box.width,
        height: box.height,
      };
    };
    function settle() {
      active?.kill();
      active = undefined;
      gsap?.set(zone, { clearProps: "transform" });
      zone.dataset.ryzePlacement = "form";
      signal("idle");
    }
    function sync() {
      if (!alive || !gsap) return;
      if (!desktop.matches || reduced.matches) {
        settle();
        perched = false;
        return;
      }
      const cookie = openNotice();
      if (cookie && !focused) {
        arrived = false;
        // Only reposition if the cookie geometry changed, not on every DOM mutation.
        const origin = position();
        const x = Math.max(12, Math.min(innerWidth - origin.width - 12,
          cookie.right - origin.width * .75)) - origin.left;
        const y = Math.max(12, cookie.top - origin.height + 14) - origin.top;
        gsap.set(zone, { x, y });
        perched = true;
        zone.dataset.ryzePlacement = "cookies";
        signal("idle");
        return;
      }
      if (arrived) return;
      if (!revealed && !focused) return;
      arrived = true;
      const origin = position();
      const timeline = gsap.timeline({ onComplete: () => {
        settle();
        signal("working");
        idleTimer = window.setTimeout(() => { if (alive) signal("idle"); }, 1600);
      } });
      if (perched) {
        signal("running-right");
        timeline.to(zone, {
          x: innerWidth + origin.width - origin.left, duration: .32, ease: "power2.in",
        });
      }
      timeline.set(zone, { x: -origin.width - origin.left - 16, y: 0 });
      timeline.call(() => {
        zone.dataset.ryzePlacement = "approaching";
        signal("running-right");
      });
      timeline.to(zone, { x: 0, duration: .76, ease: "power3.out" });
      active = timeline;
      perched = false;
    }
    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }
    function onFocus(event: FocusEvent) {
      if (event.target instanceof Element && event.target.closest("#hero-conversation")) {
        focused = true;
        schedule();
      }
    }
    function onReveal() { revealed = true; schedule(); }
    document.addEventListener("focusin", onFocus);
    window.addEventListener("ryze:hero-reveal", onReveal);
    window.addEventListener("ryze:cookie-preferences-changed", schedule);
    window.addEventListener("resize", schedule, { passive: true });
    desktop.addEventListener("change", schedule);
    reduced.addEventListener("change", schedule);
    const observer = new MutationObserver(schedule);
    if (cookies) observer.observe(cookies, { childList: true, subtree: true });
    void import("gsap").then(module => {
      if (!alive) return;
      gsap = module.gsap;
      schedule();
    }).catch(() => { /* Static Grid placement is the fallback. */ });

    return () => {
      alive = false;
      active?.kill();
      clearTimeout(idleTimer);
      cancelAnimationFrame(raf);
      observer.disconnect();
      gsap?.set(zone, { clearProps: "transform" });
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("ryze:hero-reveal", onReveal);
      window.removeEventListener("ryze:cookie-preferences-changed", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, [zoneRef]);
}
