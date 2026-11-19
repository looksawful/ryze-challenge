"use client";

import { useEffect, useState } from "react";
import styles from "./HeroWithNavigation.module.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function HeroMotionBackground() {
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionEnabled(!preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  if (!motionEnabled) return null;

  return (
    <div className={styles.motionBackdrop} aria-hidden="true">
      <iframe
        title="Ryze motion canvas"
        src={basePath + "/ryze-canvas/particle-intro.html"}
        tabIndex={-1}
        loading="eager"
        className={styles.motionFrame}
      />
    </div>
  );
}
