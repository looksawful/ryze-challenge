"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import styles from "./HeroAction.module.css";

type Mode = "inline" | "drawer";
type DomainResult = { domain: string; error?: never } | { domain?: never; error: string };

const examples = ["yourstore.com", "shop.example.com", "https://yourstore.com"];
const localPreviewMessage = {
  text: "On the live site, this would open a Ryze experience preview. This demonstration stays on the same page.",
};

type HeroActionProps = {
  notice?: { text: string } | null;
  onDismissNotice?: () => void;
  onPreviewExperience?: (domain: string) => void;
};

// Accept domains and HTTP(S) URLs without guessing spellings or destination pages.
function normalizeStoreDomain(value: string): DomainResult {
  const raw = value.trim();
  if (!raw) return { error: "Enter your store domain or URL." };
  if (/\s/.test(raw) || raw.startsWith("//")) return { error: "Enter one complete domain or URL." };

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return { error: "Use a domain such as yourstore.com or a full URL." };
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    return { error: "Use an HTTP or HTTPS store URL without login details." };
  }

  // URL.hostname is ASCII/Punycode for IDNs. Preserve the typed value in the field.
  const host = url.hostname.toLowerCase();
  const labels = host.split(".");
  if (host.length > 253 || labels.length < 2 ||
    labels.some((part) => !part || part.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(part)) ||
    !/^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/.test(labels[labels.length - 1])) {
    return { error: "Enter a public store domain, for example yourstore.com." };
  }
  return { domain: host };
}

export default function HeroAction({ notice, onDismissNotice, onPreviewExperience }: HeroActionProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState("");
  const [stage, setStage] = useState<"editing" | "thinking" | "result">("editing");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [noticeHovered, setNoticeHovered] = useState(false);
  const [noticeFocused, setNoticeFocused] = useState(false);
  const activeNotice = notice ?? (previewOpen ? localPreviewMessage : null);
  const pendingRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const helpId = useId();
  const errorId = useId();

  function availableMode(): Mode {
    const width = rootRef.current?.closest("main")?.getBoundingClientRect().width ?? 0;
    return width >= 800 ? "inline" : "drawer";
  }

  function open(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    setMode(availableMode());
  }

  function dismissNotice() {
    setPreviewOpen(false);
    setNoticeHovered(false);
    setNoticeFocused(false);
    onDismissNotice?.();
  }

  function cancelPending() {
    if (pendingRef.current !== null) window.clearTimeout(pendingRef.current);
    pendingRef.current = null;
  }

  function close() {
    cancelPending();
    dialogRef.current?.close();
    setMode(null);
    setFocused(false);
    setError("");
    setAccepted("");
    setStage("editing");
    setPreviewOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => () => {
    if (pendingRef.current !== null) window.clearTimeout(pendingRef.current);
  }, []);

  useEffect(() => {
    if (!activeNotice || noticeHovered || noticeFocused) return;
    const timer = window.setTimeout(() => {
      setPreviewOpen(false);
      onDismissNotice?.();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [activeNotice, noticeHovered, noticeFocused, onDismissNotice]);

  useEffect(() => {
    if (!mode) return;
    const dialog = dialogRef.current;
    if (mode === "drawer" && dialog && !dialog.open) dialog.showModal();
    if (mode === "inline" && dialog?.open) dialog.close();
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);

  useEffect(() => {
    if (!mode) return;
    const hero = rootRef.current?.closest("main");
    if (!hero) return;
    const observer = new ResizeObserver(() => {
      const next: Mode = hero.getBoundingClientRect().width >= 800 ? "inline" : "drawer";
      setMode((current) => current && current !== next ? next : current);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    if (!mode || focused || value) return;
    const timer = window.setInterval(() => setExampleIndex((index) => (index + 1) % examples.length), 3200);
    return () => window.clearInterval(timer);
  }, [mode, focused, value]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    cancelPending();
    setPreviewOpen(false);
    const result = normalizeStoreDomain(value);
    setError(result.error ?? "");
    setAccepted(result.domain ?? "");
    if (!result.domain) {
      setStage("editing");
      return;
    }
    setStage("thinking");
    pendingRef.current = window.setTimeout(() => {
      pendingRef.current = null;
      setStage("result");
    }, 900);
  }

  const bubble = activeNotice && (
    <div
      className={styles.previewBubble}
      role="status"
      onMouseEnter={() => setNoticeHovered(true)}
      onMouseLeave={() => setNoticeHovered(false)}
      onFocusCapture={() => setNoticeFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setNoticeFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          dismissNotice();
        }
      }}
    >
      <strong>Rizzie</strong>
      <p>{activeNotice.text}</p>
      <button type="button" onClick={dismissNotice} aria-label="Dismiss preview explanation">×</button>
    </div>
  );

  const form = (
    <>
      <form className={styles.form} onSubmit={submit} noValidate>
        <label className={styles.visuallyHidden} htmlFor={inputId}>Store domain or URL</label>
        <div className={styles.fieldWrap}>
          <input
            ref={inputRef}
            id={inputId}
            className={styles.field}
            type="text"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            value={value}
            onChange={(event) => {
              cancelPending();
              setValue(event.target.value);
              setError("");
              setAccepted("");
              setStage("editing");
              setPreviewOpen(false);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={focused ? "Store domain or URL" : ""}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${helpId} ${errorId}` : helpId}
          />
          {!value && !focused && (
            <span key={exampleIndex} className={styles.example} aria-hidden="true">
              e.g. {examples[exampleIndex]}
            </span>
          )}
        </div>
        <button type="submit" className={styles.submit} disabled={stage === "thinking"}>{stage === "thinking" ? "Preparing…" : "Continue"}</button>
      </form>
      <p id={helpId} className={styles.help}>Demo only. No data is sent.</p>
      {error && <p id={errorId} role="alert" className={styles.feedback}>{error}</p>}
      {stage === "thinking" && (
        <p role="status" className={styles.feedback}>Preparing an example response for {accepted}…</p>
      )}
      {stage === "result" && (
        <section className={styles.result} aria-label="Example response">
          <p className={styles.resultEyebrow}>Demo response · no store analysis performed</p>
          <p role="status">For <strong>{accepted}</strong>, a Ryze workflow could explore paid ads, SEO, AI visibility and CRO.</p>
          <div className={styles.resultActions}>
            <button type="button" onClick={() => {
              if (onPreviewExperience) onPreviewExperience(accepted);
              else setPreviewOpen(true);
            }}>Preview experience</button>
            <button type="button" onClick={() => {
              setStage("editing");
              setPreviewOpen(false);
              inputRef.current?.focus();
            }}>Edit domain</button>
          </div>
          {bubble}
        </section>
      )}
    </>
  );

  return (
    <div ref={rootRef} className={styles.root} data-mode={mode ?? "idle"} data-stage={stage}>
      <details hidden={mode !== null} className={styles.fallback}>
        <summary ref={triggerRef} onClick={open}>Start For Free</summary>
        <p>Enable JavaScript to try the domain-entry demo.</p>
      </details>
      {stage !== "result" && mode !== "drawer" && bubble}
      {mode === "inline" && (
        <div className={styles.inline} onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}>
          <button type="button" className={styles.inlineClose} onClick={close} aria-label="Close domain entry">×</button>
          {form}
        </div>
      )}
      <dialog
        ref={dialogRef}
        className={styles.drawer}
        aria-label="Store domain entry"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        {mode === "drawer" && (
          <div className={styles.drawerContent}>
            <div className={styles.drawerTop}>
              <h2>Tell us your store</h2>
              <button type="button" onClick={close} className={styles.close} aria-label="Close domain entry">×</button>
            </div>
            {form}
            {stage !== "result" && bubble}
          </div>
        )}
      </dialog>
    </div>
  );
}
