"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import styles from "./HeroAction.module.css";

type Mode = "inline" | "drawer";
type DomainResult = { domain: string; error?: never } | { domain?: never; error: string };

const examples = ["yourstore.com", "shop.example.com", "https://yourstore.com"];

// Accept a domain or URL, but never guess spellings, protocols beyond HTTPS, or destination pages.
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

export default function HeroAction() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const helpId = useId();

  function availableMode(): Mode {
    const width = rootRef.current?.closest("main")?.getBoundingClientRect().width ?? 0;
    return width >= 800 ? "inline" : "drawer";
  }

  function open(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    setMode(availableMode());
  }

  function close() {
    dialogRef.current?.close();
    setMode(null);
    setFocused(false);
    setError("");
    setAccepted("");
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

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
    const observer = new ResizeObserver(() => setMode((current) => current ? availableMode() : null));
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
    const result = normalizeStoreDomain(value);
    setError(result.error ?? "");
    setAccepted(result.domain ?? "");
  }

  const form = (
    <>
      <form className={styles.form} onSubmit={submit} noValidate onKeyDown={(event) => {
        if (mode === "inline" && event.key === "Escape") {
          event.preventDefault();
          close();
        }
      }}>
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
              setValue(event.target.value);
              setError("");
              setAccepted("");
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={focused ? "Store domain or URL" : ""}
            aria-invalid={Boolean(error)}
            aria-describedby={helpId}
          />
          {!value && !focused && (
            <span key={exampleIndex} className={styles.example} aria-hidden="true">
              e.g. {examples[exampleIndex]}
            </span>
          )}
        </div>
        <button type="submit" className={styles.submit}>Continue</button>
      </form>
      <p id={helpId} className={styles.help}>Demo only. No data is sent.</p>
      {(error || accepted) && (
        <p role={error ? "alert" : "status"} className={styles.feedback}>
          {error || `Ready for demo: ${accepted}. You can edit the domain above.`}
        </p>
      )}
    </>
  );

  return (
    <div ref={rootRef} className={styles.root} data-mode={mode ?? "idle"}>
      <details hidden={mode !== null} className={styles.fallback}>
        <summary ref={triggerRef} onClick={open}>Start For Free</summary>
        <p>Enable JavaScript to try the domain-entry demo.</p>
      </details>
      {mode === "inline" && <div className={styles.inline}>{form}</div>}
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
          </div>
        )}
      </dialog>
    </div>
  );
}
