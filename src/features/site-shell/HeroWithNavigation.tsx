"use client";

import { useEffect, useRef, useState } from "react";
import Hero from "../hero/Hero";
import { HeroMotionBackground } from "./HeroMotionBackground";
import { SiteHeader } from "./SiteHeader";
import { previewNotice } from "./link-model";
import styles from "./HeroWithNavigation.module.css";

export function HeroWithNavigation() {
  // SSR begins in the cinematic intro; reduced-motion and no-JS remain usable.
  const [introReady, setIntroReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setIntroReady(true);
      return;
    }
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setIntroReady(true);
    };
    const onMessage = (event: MessageEvent) => {
      const frame = stageRef.current?.querySelector<HTMLIFrameElement>(
        'iframe[title="Ryze motion canvas"]'
      );
      if (event.origin !== window.location.origin || event.source !== frame?.contentWindow) return;
      if (event.data?.type === "ryze:intro-complete") finish();
    };
    const onPreferenceChange = () => { if (reduced.matches) finish(); };
    window.addEventListener("message", onMessage);
    reduced.addEventListener("change", onPreferenceChange);
    // Asset/WebGL failures must never strand the user behind an invisible Hero.
    const watchdog = window.setTimeout(finish, 24000);
    return () => {
      window.clearTimeout(watchdog);
      window.removeEventListener("message", onMessage);
      reduced.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const regions = [
      stage.querySelector<HTMLElement>("main#main"),
      stage.querySelector<HTMLElement>(`.${styles.navigation}`),
    ];
    regions.forEach(region => { if (region) region.inert = !introReady; });
    return () => regions.forEach(region => { if (region) region.inert = false; });
  }, [introReady]);

  return (
    <div ref={stageRef} className={styles.stage} data-ryze-dark-end data-intro={introReady ? "ready" : "playing"}>
      <noscript>
        <style>{`
          .${styles.stage}[data-intro="playing"] > main,
          .${styles.stage}[data-intro="playing"] .${styles.navigation} {
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        `}</style>
      </noscript>
      <div className={styles.navigation}>
        <SiteHeader
          variant="dock"
          enhancement="auto"
          previewMode={false}
          showMobileCookieSettings={false}
          onPreviewDestination={(destination) => {
            window.dispatchEvent(new CustomEvent("rizzie:message", {
              detail: { text: destination.id.startsWith("shopify-")
                ? destination.label + " section is not available in this preview yet."
                : previewNotice(destination) },
            }));
          }}
        />
      </div>
      <HeroMotionBackground />
      <Hero />
    </div>
  );
}
