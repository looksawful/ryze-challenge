"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import styles from "./CookieConsent.module.css";

type ConsentView = "notice" | "settings" | "collapsed";
type Preferences = { analytics: boolean; marketing: boolean };

export default function CookieConsent() {
  const [view, setView] = useState<ConsentView>("notice");
  const [preferences, setPreferences] = useState<Preferences>({ analytics: false, marketing: false });
  const [announcement, setAnnouncement] = useState("");
  const headingId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const customizeRef = useRef<HTMLButtonElement>(null);
  const reopenRef = useRef<HTMLButtonElement>(null);

  function collapse(message = "Cookie settings minimized") {
    setView("collapsed");
    setAnnouncement(message);
    requestAnimationFrame(() => reopenRef.current?.focus({ preventScroll: true }));
  }

  function show(viewToShow: "notice" | "settings") {
    setView(viewToShow);
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  }

  function save(next: Preferences) {
    setPreferences(next);
    collapse("Cookie preferences updated for this preview");
  }

  // Progressive enhancement: only float when no Hero content can be obscured.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const hero = document.querySelector("main");
    if (!root || !panel || !hero) return;

    function place() {
      if (!root || !panel || !hero) return;
      if (view === "collapsed") {
        root.dataset.floating = "true";
        return;
      }
      if (window.innerWidth < 1024) {
        delete root.dataset.floating;
        return;
      }

      root.style.setProperty("--cookie-x", "16px");
      root.style.setProperty("--cookie-y", "16px");
      root.dataset.floating = "true";

      const { width, height } = panel.getBoundingClientRect();
      const blocks = Array.from(hero.children, (element) => element.getBoundingClientRect());
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxX = viewportWidth - width - 16;
      const maxY = viewportHeight - height - 16;
      const gap = 8;
      let best: { x: number; y: number; score: number } | null = null;

      for (let y = maxY; y >= 16; y -= 12) {
        for (let x = maxX; x >= 16; x -= 12) {
          const touchesContent = blocks.some((rect) =>
            x < rect.right + gap && x + width > rect.left - gap &&
            y < rect.bottom + gap && y + height > rect.top - gap
          );
          if (touchesContent) continue;
          const score = (maxX - x) + 1.2 * (maxY - y);
          if (!best || score < best.score) best = { x, y, score };
        }
      }

      if (best) {
        root.style.setProperty("--cookie-x", best.x + "px");
        root.style.setProperty("--cookie-y", best.y + "px");
      } else {
        delete root.dataset.floating;
      }
    }

    let frame = 0;
    const onResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };

    place();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(frame);
    };
  }, [view]);

  useEffect(() => {
    if (view !== "notice") return;
    function minimizeOnWheel(event: WheelEvent) {
      if (event.deltaY <= 4 || event.ctrlKey || panelRef.current?.contains(event.target as Node)) return;
      setView("collapsed");
      setAnnouncement("Cookie settings minimized");
      if (panelRef.current?.contains(document.activeElement))
        requestAnimationFrame(() => reopenRef.current?.focus({ preventScroll: true }));
    }
    window.addEventListener("wheel", minimizeOnWheel, { passive: true });
    return () => window.removeEventListener("wheel", minimizeOnWheel);
  }, [view]);

  return (
    <div ref={rootRef} className={styles.root} data-cookie-consent data-view={view}>
      <aside
        ref={panelRef}
        className={styles.notice}
        aria-labelledby={headingId}
        aria-hidden={view === "collapsed"}
        inert={view === "collapsed"}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.stopPropagation();
          if (view === "settings") {
            setView("notice");
            requestAnimationFrame(() => customizeRef.current?.focus({ preventScroll: true }));
          } else collapse();
        }}
      >
        <div className={styles.header}>
          <h2 id={headingId} ref={headingRef} tabIndex={-1} className={styles.title}>Cookie settings</h2>
          <button type="button" className={styles.minimize} aria-label="Minimize cookie settings" onClick={() => collapse()}>
            <span aria-hidden="true">−</span>
          </button>
        </div>
        {view !== "settings" ? (
          <>
            <p className={styles.description}>
              Manage optional cookies for this preview. Your choice is not stored or shared when you leave the page.
            </p>
            <div className={styles.actions}>
              <button type="button" ref={customizeRef} className={styles.button} onClick={() => show("settings")}>
                Customize cookie settings
              </button>
              <div className={styles.choices}>
                <button type="button" className={styles.button} onClick={() => save({ analytics: false, marketing: false })}>Reject all cookies</button>
                <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => save({ analytics: true, marketing: true })}>Accept all cookies</button>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); save(preferences); }}>
            <p className={styles.description}>Choose which optional preferences to demonstrate. This preview does not set tracking cookies or remember your selection.</p>
            <div className={styles.options}>
              <div className={styles.option}>
                <span className={styles.optionText}>Necessary<small>Required for basic functionality</small></span>
                <span className={styles.state}>Always on</span>
              </div>
              <label className={styles.option}>
                <span className={styles.optionText}>Analytics<small>Site performance measurement</small></span>
                <input className={styles.switch} type="checkbox" role="switch" checked={preferences.analytics}
                  onChange={(event) => setPreferences({ ...preferences, analytics: event.target.checked })} />
              </label>
              <label className={styles.option}>
                <span className={styles.optionText}>Marketing<small>Advertising and personalization</small></span>
                <input className={styles.switch} type="checkbox" role="switch" checked={preferences.marketing}
                  onChange={(event) => setPreferences({ ...preferences, marketing: event.target.checked })} />
              </label>
            </div>
            <div className={styles.choices}>
              <button type="button" className={styles.button} onClick={() => {
                setView("notice");
                requestAnimationFrame(() => customizeRef.current?.focus({ preventScroll: true }));
              }}>Back</button>
              <button type="submit" className={`${styles.button} ${styles.primary}`}>Save preferences</button>
            </div>
          </form>
        )}
      </aside>
      <button type="button" ref={reopenRef} className={styles.reopen}
        aria-label="Open cookie settings" aria-hidden={view !== "collapsed"} inert={view !== "collapsed"}
        onClick={() => show("notice")}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M12 3.2a3 3 0 0 0 3.7 3.5 3.3 3.3 0 0 0 3.1 3.4 7.6 7.6 0 1 1-6.8-6.9Z" fill="currentColor"/>
          <circle cx="8" cy="10" r="1.1" fill="#171717"/>
          <circle cx="13" cy="14" r="1.2" fill="#171717"/>
          <circle cx="8.2" cy="16.2" r=".8" fill="#171717"/>
        </svg>
        <span>Cookies</span>
      </button>
      <span className={styles.srOnly} role="status">{announcement}</span>
    </div>
  );
}
