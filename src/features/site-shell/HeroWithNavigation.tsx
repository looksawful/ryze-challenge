"use client";

import { useEffect, useRef, useState } from "react";
import Hero from "../hero/Hero";
import { createHeroEntranceTimeline } from "../../motion/hero-entrance";
import { HeroMotionBackground } from "./HeroMotionBackground";
import { SiteHeader } from "./SiteHeader";
import { previewNotice } from "./link-model";
import styles from "./HeroWithNavigation.module.css";

type IntroPhase = "playing" | "revealing" | "ready";

type HeroWithNavigationProps = { theme?: "dawn" | "dusk" };

export function HeroWithNavigation({ theme = "dusk" }: HeroWithNavigationProps) {
  // Dawn is a static, immediately usable preview; the approved live page stays Dusk.
  const [introPhase, setIntroPhase] = useState<IntroPhase>(theme === "dawn" ? "ready" : "playing");
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (theme === "dawn" || reduced.matches) {
      setIntroPhase("ready");
      return;
    }
    setIntroPhase("playing");
    let finished = false;
    let revealStarted = false;
    let alive = true;
    let gsapReady: typeof import("gsap")["gsap"] | null = null;
    let motionContext: ReturnType<(typeof import("gsap"))["gsap"]["context"]> | null = null;
    let entrance: ReturnType<typeof createHeroEntranceTimeline> | null = null;
    // Preload while the 118 pieces assemble. No extra blocking load at the cue.
    void import("gsap").then(({ gsap }) => {
      if (alive) gsapReady = gsap;
    }).catch(() => { /* CSS entrance remains fully functional. */ });

    const finish = () => {
      if (finished) return;
      finished = true;
      setIntroPhase("ready");
    };
    const beginReveal = () => {
      if (finished || revealStarted) return;
      revealStarted = true;
      const stage = stageRef.current;
      if (stage && gsapReady) {
        try {
          const driver = gsapReady;
          motionContext = driver.context(() => {
            const cookies = stage.parentElement?.querySelector<HTMLElement>(
              '[data-motion-slot="cookies"]'
            ) ?? null;
            entrance = createHeroEntranceTimeline(driver, stage, cookies);
          }, stage);
          if (entrance) {
            stage.dataset.motionDriver = "gsap";
            entrance.eventCallback("onComplete", finish);
          }
        } catch {
          motionContext?.revert();
          motionContext = null;
          stage.dataset.motionDriver = "css";
        }
      }
      window.dispatchEvent(new Event("ryze:hero-reveal"));
      if (entrance) {
        setIntroPhase("revealing");
        entrance.play(0);
      } else {
        finish();
      }
    };
    const onMessage = (event: MessageEvent) => {
      const frame = stageRef.current?.querySelector<HTMLIFrameElement>(
        'iframe[title="Ryze motion canvas"]'
      );
      if (event.origin !== window.location.origin || event.source !== frame?.contentWindow) return;
      // The paper mark must assemble and blow away before the text timeline.
      if (event.data?.type === "ryze:intro-complete") beginReveal();
    };
    const onPreferenceChange = () => {
      if (!reduced.matches) return;
      entrance?.progress(1);
      stageRef.current?.removeAttribute("data-motion-driver");
      entrance?.revertSplit();
      motionContext?.revert();
      finish();
    };
    window.addEventListener("message", onMessage);
    reduced.addEventListener("change", onPreferenceChange);
    // Asset/WebGL failures must never strand the user behind an invisible Hero.
    const watchdog = window.setTimeout(beginReveal, 6500);
    return () => {
      alive = false;
      entrance?.revertSplit();
      motionContext?.revert();
      window.clearTimeout(watchdog);
      window.removeEventListener("message", onMessage);
      reduced.removeEventListener("change", onPreferenceChange);
    };
  }, [theme]);


  return (
    <div ref={stageRef} className={styles.stage} data-theme={theme} data-ryze-dark-end={theme === "dusk" || undefined} data-motion-driver="css" data-intro={introPhase}>
      <noscript>
        <style>{`
          .${styles.stage}[data-intro="playing"] > main,
          .${styles.stage}[data-intro="playing"] .${styles.navigation} {
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        `}</style>
      </noscript>
      <div className={styles.navigation} data-motion-slot="navigation">
        <SiteHeader
          theme={theme}
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
      {theme === "dusk" && <HeroMotionBackground />}
      <Hero theme={theme} />
    </div>
  );
}
