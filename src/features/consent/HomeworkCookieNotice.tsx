"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { footerGroups } from "../site-shell/link-model";
import styles from "./HomeworkCookieNotice.module.css";

type CookiePreferences = { analytics: boolean; marketing: boolean };
type RyzeCookieNoticeProps = { onSave?: (preferences: CookiePreferences) => void; rememberChoice?: boolean };
const privacyHref = footerGroups.flatMap((group) => group.links).find((link) => link.id === "privacy")?.href;
const storageKey = "ryze-cookie-preferences";
const settingsEvent = "ryze:cookie-settings";
const changedEvent = "ryze:cookie-preferences-changed";

function subscribeToMount() { return () => {}; }
function getClientMounted() { return true; }
function getServerMounted() { return false; }

function readChoice() {
  try {
    const value = localStorage.getItem(storageKey);
    const choice: unknown = JSON.parse(value ?? "null");
    return choice && typeof choice === "object" && "analytics" in choice && typeof choice.analytics === "boolean" && "marketing" in choice && typeof choice.marketing === "boolean" ? value : null;
  } catch { return null; }
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changedEvent, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(changedEvent, listener); };
}

export function HomeworkCookieSettingsButton({ className = styles.reopen }: { className?: string | undefined }) {
  const mounted = useSyncExternalStore(subscribeToMount, getClientMounted, getServerMounted);
  if (!mounted) return null;
  return <button data-cookie-settings-trigger className={className} type="button" onClick={() => window.dispatchEvent(new Event(settingsEvent))}>Cookie settings</button>;
}

// Choices are local; this component does not install or enable tracking.
export function HomeworkCookieNotice({ onSave, rememberChoice = true }: RyzeCookieNoticeProps) {
  const storedChoice = useSyncExternalStore(subscribe, rememberChoice ? readChoice : () => null, () => null);
  const [view, setView] = useState<"notice" | "settings" | "closed">("notice");
  const [preferences, setPreferences] = useState<CookiePreferences>({ analytics: false, marketing: false });
  const mounted = useSyncExternalStore(subscribeToMount, getClientMounted, getServerMounted);
  const titleId = useId();
  const noticeRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const customizeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const visible = view === "settings" || (view === "notice" && !storedChoice);

  function openSettings() {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (rememberChoice) {
      try {
        const saved: unknown = JSON.parse(readChoice() ?? "null");
        if (saved && typeof saved === "object" && "analytics" in saved && "marketing" in saved) {
          setPreferences({ analytics: saved.analytics === true, marketing: saved.marketing === true });
        }
      } catch { /* An invalid saved choice leaves optional cookies off. */ }
    }
    setView("settings");
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));
  }

  useEffect(() => {
    window.addEventListener(settingsEvent, openSettings);
    return () => window.removeEventListener(settingsEvent, openSettings);
  });

  useEffect(() => {
    if (!visible || !mounted) return;
    let frame = 0;
    function matchBackground() {
      const dock = noticeRef.current;
      if (!dock) return;
      const navigation = (document.querySelector("[data-ryze-mobile-dock]")?.getBoundingClientRect().height ? document.querySelector("[data-ryze-mobile-dock]") : document.querySelector(".navbar"))?.getBoundingClientRect();
      const clearance = navigation && navigation.top > window.innerHeight / 2 ? window.innerHeight - navigation.top + 8 : 16;
      dock.style.setProperty("--cookie-bottom", `${clearance}px`);
      const rect = dock.getBoundingClientRect();
      let underlay = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        .find(element => !dock.contains(element) && !element.closest(".site-panel, [data-ryze-menu]"));
      if (!underlay) return;
      const foreground = getComputedStyle(underlay).getPropertyValue("--color-foreground");
      while (underlay) {
        const background = getComputedStyle(underlay).backgroundColor;
        if (background !== "transparent" && !/rgba\([^)]*,\s*0\s*\)/.test(background)) {
          dock.style.setProperty("--cookie-background", background);
          dock.style.setProperty("--cookie-foreground", foreground);
          break;
        }
        underlay = underlay.parentElement ?? undefined;
      }
    }
    function scheduleBackground() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(matchBackground);
    }
    function revealFocus(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.closest("[data-ryze-menu]")) return;
      requestAnimationFrame(() => {
        const dock = noticeRef.current;
        if (!dock || dock.contains(target)) return;
        const focused = target.getBoundingClientRect();
        const panel = dock.getBoundingClientRect();
        if (focused.left < panel.right && focused.right > panel.left && focused.bottom > panel.top && focused.top < panel.bottom) {
          window.scrollBy({ top: focused.bottom - panel.top + 16, behavior: "instant" });
        }
      });
    }
    matchBackground();
    window.addEventListener("scroll", scheduleBackground, { passive: true });
    window.addEventListener("resize", scheduleBackground);
    document.addEventListener("focusin", revealFocus);
    const observer = new MutationObserver(scheduleBackground);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["data-theme"] });
    const resizeObserver = new ResizeObserver(scheduleBackground);
    const navigation = document.querySelector(".navbar");
    if (navigation) resizeObserver.observe(navigation);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleBackground);
      window.removeEventListener("resize", scheduleBackground);
      document.removeEventListener("focusin", revealFocus);
    };
  }, [visible, view, mounted]);

  function save(next: CookiePreferences) {
    setPreferences(next);
    setView("closed");
    if (rememberChoice) {
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* The notice still closes when storage is unavailable. */ }
      window.dispatchEvent(new Event(changedEvent));
    }
    onSave?.(next);
    requestAnimationFrame(() => {
      const trigger = returnFocusRef.current;

      const fallback = document.querySelector<HTMLButtonElement>("[data-cookie-settings-trigger]");
      (trigger?.isConnected ? trigger : fallback)?.focus({ preventScroll: true });
    });
  }

  if (!mounted || !visible) return null;

  return (
    <aside ref={noticeRef} className={styles.notice} aria-labelledby={titleId} data-settings={view === "settings" || undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape" && view === "settings") {
          setView(storedChoice ? "closed" : "notice");
          requestAnimationFrame(() => (storedChoice ? returnFocusRef.current : customizeRef.current)?.focus({ preventScroll: true }));
        }
      }}>
      <h2 ref={titleRef} id={titleId} className={styles.title} tabIndex={-1}>Cookie settings</h2>
      {view === "notice" ? (
        <div className={styles.actions}>
          <button ref={customizeRef} className={styles.button} type="button" onClick={openSettings}><span className={styles.wideLabel}>Customize cookie settings</span><span className={styles.shortLabel}>Customize</span></button>
          <button className={styles.button} type="button" onClick={() => save({ analytics: false, marketing: false })}><span className={styles.wideLabel}>Reject all cookies</span><span className={styles.shortLabel}>Reject</span></button>
          <button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => save({ analytics: true, marketing: true })}><span className={styles.wideLabel}>Accept all cookies</span><span className={styles.shortLabel}>Accept</span></button>
        </div>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); save(preferences); }}>
          <p className={styles.description}>Choose which optional cookies Ryze may use. {privacyHref && <a href={privacyHref}>Privacy policy</a>}</p>
          <div className={styles.options}>
            <label><span>Necessary<small>Security and basic functionality.</small></span><span className={styles.state}>Required<input aria-label="Necessary" type="checkbox" role="switch" checked disabled /></span></label>
            <label><span>Analytics<small>Understand site performance.</small></span><span className={styles.state}>{preferences.analytics ? "On" : "Off"}<input aria-label="Analytics" type="checkbox" role="switch" checked={preferences.analytics} onChange={(event) => setPreferences({ ...preferences, analytics: event.currentTarget.checked })} /></span></label>
            <label><span>Marketing<small>Personalize advertising.</small></span><span className={styles.state}>{preferences.marketing ? "On" : "Off"}<input aria-label="Marketing" type="checkbox" role="switch" checked={preferences.marketing} onChange={(event) => setPreferences({ ...preferences, marketing: event.currentTarget.checked })} /></span></label>
          </div>
          <button className={`${styles.button} ${styles.primary} ${styles.save}`} type="submit">Save preferences</button>
        </form>
      )}
    </aside>
  );
}
