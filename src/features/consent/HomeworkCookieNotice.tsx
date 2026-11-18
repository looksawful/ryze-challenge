"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { footerGroups } from "../site-shell/link-model";
import styles from "./HomeworkCookieNotice.module.css";

type CookiePreferences = { analytics: boolean; marketing: boolean };
type CookieView = "notice" | "settings" | "closed";
type RyzeCookieNoticeProps = { onSave?: (preferences: CookiePreferences) => void; rememberChoice?: boolean; initialView?: CookieView };
const privacyHref = footerGroups.flatMap((group) => group.links).find((link) => link.id === "privacy")?.href;
const storageKey = "ryze-cookie-preferences";
const settingsEvent = "ryze:cookie-settings";
const changedEvent = "ryze:cookie-preferences-changed";

function subscribeToMount() { return () => {}; }
function getClientMounted() { return true; }
function getServerMounted() { return false; }

// Match text to the background actually sampled under the floating notice.
// A light section may sit inside a dark theme, so inherited text tokens alone
// cannot guarantee contrast.
function foregroundForBackground(background: string): string {
  const rgb = background.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!rgb) return "var(--color-foreground)";

  const linear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * linear(Number(rgb[1])) + 0.7152 * linear(Number(rgb[2])) + 0.0722 * linear(Number(rgb[3]));
  const darkContrast = (luminance + 0.05) / (0.0056 + 0.05);
  const lightContrast = (0.9301 + 0.05) / (luminance + 0.05);
  if (darkContrast >= lightContrast) return darkContrast >= 4.5 ? "#111" : "#000";
  return lightContrast >= 4.5 ? "#f7f7f7" : "#fff";
}

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
export function HomeworkCookieNotice({ onSave, rememberChoice = true, initialView }: RyzeCookieNoticeProps) {
  const storedChoice = useSyncExternalStore(subscribe, rememberChoice ? readChoice : () => null, () => null);
  const [view, setView] = useState<CookieView>(initialView ?? "notice");
  const [preferences, setPreferences] = useState<CookiePreferences>({ analytics: false, marketing: false });
  const mounted = useSyncExternalStore(subscribeToMount, getClientMounted, getServerMounted);
  const titleId = useId();
  const noticeRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const customizeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const visible = view === "settings" || (view === "notice" && (initialView === "notice" || !storedChoice));

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
    const navigation = document.querySelector<HTMLElement>('[data-preview-part="mobile-dock"]');
    function matchBackground() {
      const dock = noticeRef.current;
      if (!dock) return;
      const navigationRect = navigation?.getBoundingClientRect();
      const bottomDock = navigationRect && navigationRect.height > 0
        && navigationRect.top > window.innerHeight / 2
        && navigationRect.bottom >= window.innerHeight - 32;
      const clearance = bottomDock
        ? Math.max(16, Math.ceil(window.innerHeight - navigationRect.top + 12))
        : 16;
      dock.style.setProperty("--cookie-bottom", `${clearance}px`);
      const rect = dock.getBoundingClientRect();
      let underlay = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        .find(element => !dock.contains(element) && !element.closest(".site-panel, [data-ryze-menu]"));
      if (!underlay) return;
      while (underlay) {
        const background = getComputedStyle(underlay).backgroundColor;
        if (background !== "transparent" && !/rgba\([^)]*,\s*0\s*\)/.test(background)) {
          dock.style.setProperty("--cookie-background", background);
          dock.style.setProperty("--cookie-foreground", foregroundForBackground(background));
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
    if (navigation) {
      observer.observe(navigation, { attributes: true, attributeFilter: ["data-docked"] });
      resizeObserver.observe(navigation);
    }
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
    <aside ref={noticeRef} className={styles.notice} aria-label={view === "notice" ? "Cookie preferences" : undefined} aria-labelledby={view === "settings" ? titleId : undefined} data-settings={view === "settings" || undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape" && view === "settings") {
          setView(storedChoice ? "closed" : "notice");
          requestAnimationFrame(() => (storedChoice ? returnFocusRef.current : customizeRef.current)?.focus({ preventScroll: true }));
        }
      }}>
      {view === "notice" ? (
        <>
          <p className={styles.message}>We use optional cookies only if you allow them. No tracking is enabled in this demo. {privacyHref && <a href={privacyHref}>Privacy</a>}</p>
          <div className={styles.actions}>
            <button ref={customizeRef} className={styles.button} type="button" onClick={openSettings}>Settings</button>
            <button className={styles.button} type="button" onClick={() => save({ analytics: false, marketing: false })}>Reject</button>
            <button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => save({ analytics: true, marketing: true })}>Accept</button>
          </div>
        </>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); save(preferences); }}>
          <h2 ref={titleRef} id={titleId} className={styles.title} tabIndex={-1}>Cookie settings</h2>
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
