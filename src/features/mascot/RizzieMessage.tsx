"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Rizzie.module.css";

export interface RizzieMessageProps {
  text: string;
  onClose: () => void;
  side?: "right" | "left" | "top";
  style?: CSSProperties;
}

/** The same speech bubble in every enhancement and input mode. */
export default function RizzieMessage({ text, onClose, side = "right", style }: RizzieMessageProps) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(5000);
  const started = useRef(0);

  useEffect(() => {
    if (paused) return;
    started.current = performance.now();
    const timer = window.setTimeout(onClose, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (performance.now() - started.current));
    };
  }, [paused, onClose]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeWithEscape);
    return () => document.removeEventListener("keydown", closeWithEscape);
  }, [onClose]);

  return (
    <aside
      className={styles.bubble}
      data-rizzie-bubble=""
      data-side={side}
      style={style}
      role="status"
      aria-live="polite"
      aria-label="Rizzie"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <p>{text}</p>
      <button type="button" className={styles.closeBubble} onClick={onClose} aria-label="Close Rizzie message">×</button>
    </aside>
  );
}
