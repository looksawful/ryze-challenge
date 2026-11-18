"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./HeroConversation.module.css";
import { CHAT_RHYTHM } from "../../motion/tokens";
import { normalizeWebsiteAddress } from "./website-address";

// User-tested interaction pattern: type, pause, erase, repeat. This is a
// decorative overlay, never the value of the real website input.
export const placeholderPhrases = [
  "Enter your website…",
  "See what Ryze can do…",
  "Get your growth preview…",
  "Grow your Shopify store…",
] as const;

export default function HeroConversation() {
  const [hydrated, setHydrated] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [introReleased, setIntroReleased] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [reply, setReply] = useState<{ kind: "error" | "ready"; text: string } | null>(null);
  const field = useRef<HTMLInputElement>(null);
  const composer = useRef<HTMLFormElement>(null);
  const hint = useRef<HTMLSpanElement>(null);
  const interacted = useRef(false);
  const activeAnimation = useRef<{ progress: (v: number) => unknown; kill: () => unknown } | null>(null);
  const typedAnimation = useRef<{ kill: () => unknown } | null>(null);

  const stopPresentation = () => {
    interacted.current = true;
    setHasInteracted(true);
    activeAnimation.current?.progress(1);
    activeAnimation.current?.kill();
    activeAnimation.current = null;
    typedAnimation.current?.kill();
    typedAnimation.current = null;
    if (hint.current) hint.current.textContent = "";
  };

  useEffect(() => {
    setHydrated(true);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const stage = composer.current?.closest<HTMLElement>("[data-intro]");
    if (!stage || stage.dataset.intro !== "playing" ||
        matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntroReleased(true);
    }
    const onReveal = () => setIntroReleased(true);
    window.addEventListener("ryze:hero-reveal", onReveal);
    return () => window.removeEventListener("ryze:hero-reveal", onReveal);
  }, []);

  useEffect(() => {
    if (!introReleased) return;
    let alive = true;
    let media: { revert: () => void } | null = null;
    void import("gsap").then(({ gsap }) => {
      if (!alive || !composer.current || interacted.current) return;
      const mm = gsap.matchMedia();
      mm.add(
        { animate: "(prefers-reduced-motion: no-preference)", compact: "(max-width: 799px)" },
        ({ conditions }) => {
          if (!conditions?.animate || !composer.current || interacted.current) {
            if (hint.current) hint.current.textContent = "";
            return;
          }

          // Reveals the entire form from the original button's position at right.
          // No layout property changes and no transform on the fixed navigation.
          const reveal = gsap.fromTo(composer.current,
            { clipPath: `inset(0 0 0 calc(100% - ${conditions.compact ? 150 : 200}px) round 999px)` },
            {
              clipPath: "inset(0 0 0 0 round 999px)",
              duration: CHAT_RHYTHM.reveal,
              ease: "power3.inOut",
              clearProps: "clipPath",
              onComplete: () => {
                if (!alive || interacted.current || !hint.current) return;
                const cycle = gsap.timeline({ repeat: -1 });
                for (const phrase of placeholderPhrases) {
                  const counter = { characters: 0 };
                  cycle.call(() => { counter.characters = 0; if (hint.current) hint.current.textContent = ""; });
                  cycle.to(counter, {
                    characters: phrase.length,
                    duration: phrase.length * CHAT_RHYTHM.character,
                    ease: "none",
                    snap: { characters: 1 },
                    onUpdate: () => {
                      if (hint.current && !interacted.current)
                        hint.current.textContent = phrase.slice(0, Math.round(counter.characters));
                    },
                  });
                  cycle.to({}, { duration: CHAT_RHYTHM.pause });
                  cycle.to(counter, {
                    characters: 0,
                    duration: phrase.length * CHAT_RHYTHM.eraseCharacter,
                    ease: "none",
                    snap: { characters: 1 },
                    onUpdate: () => {
                      if (hint.current && !interacted.current)
                        hint.current.textContent = phrase.slice(0, Math.round(counter.characters));
                    },
                  });
                  cycle.to({}, { duration: CHAT_RHYTHM.gap });
                }
                typedAnimation.current = cycle;
              },
            });
          activeAnimation.current = reveal;
          return () => {
            typedAnimation.current?.kill();
            typedAnimation.current = null;
            reveal.progress(1);
            reveal.kill();
            activeAnimation.current = null;
          };
        },
      );
      media = mm;
    }).catch(() => { /* Static native input remains usable if GSAP is unavailable. */ });
    return () => {
      alive = false;
      typedAnimation.current?.kill();
      activeAnimation.current?.progress(1);
      media?.revert();
    };
  }, [introReleased]);

  function submitWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopPresentation();
    const store = normalizeWebsiteAddress(website);
    if (!store) {
      const message = website.trim()
        ? "That website address doesn't look right. Could you check it?"
        : "I'll need your website address to get started.";
      setError(message);
      setReply({ kind: "error", text: message });
      field.current?.focus();
      return;
    }
    setError("");
    // A valid address is accepted locally; do not pretend an audit ran.
    setReply({ kind: "ready", text: "Website address accepted." });
  }

  const overlayVisible = hydrated && introReleased && !reducedMotion && !hasInteracted && !website;

  return (
    <section id="hero-conversation" className={styles.chat} aria-label="Ryze AI preview">
      {reply && (
        <p className={styles.reply} data-ai-reply={reply.kind}
           id={reply.kind === "error" ? "ryze-website-error" : undefined}
           role={reply.kind === "error" ? "alert" : "status"}>
          {reply.text}
        </p>
      )}
      <form ref={composer} className={styles.composer} onSubmit={submitWebsite} noValidate>
        <label className={styles.screenReader} htmlFor="ryze-preview-website">Website address</label>
        <div className={styles.fieldArea}>
          <input id="ryze-preview-website" ref={field} type="text" name="website"
            autoComplete="url" inputMode="url" required maxLength={254}
            placeholder={overlayVisible ? "" : "Enter your website…"}
            value={website}
            onFocus={stopPresentation}
            onChange={(event) => {
              setWebsite(event.target.value);
              setError("");
              setReply(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "ryze-website-error" : "ryze-website-note"} />
          {overlayVisible && <span className={styles.animatedPlaceholder} data-animated-placeholder aria-hidden="true" ref={hint}>Enter your website…</span>}
        </div>
        <button type="submit" disabled={!hydrated} aria-label="Start for free">Start for free</button>
      </form>
      <p className={styles.screenReader} id="ryze-website-note">This preview checks address formatting locally; no website is contacted.</p>
      <noscript>
        <a className={styles.staticStart} href="https://reports.get-ryze.ai/o/all">Start for free</a>
      </noscript>

    </section>
  );
}
