"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./HeroConversation.module.css";
import { CHAT_RHYTHM } from "../../motion/tokens";
import { normalizeWebsiteAddress } from "./website-address";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const capabilities = [
  { id: "ads", label: "Paid Ads", title: "Campaign opportunities", detail: "Review campaigns and decide where to focus.", image: "/ryze-media/product-shelf/muse.webp" },
  { id: "seo", label: "SEO & AI visibility", title: "Search visibility", detail: "Find ways to improve organic and AI discovery.", image: "/ryze-media/product-shelf/seo.webp" },
  { id: "cro", label: "CRO", title: "Conversion opportunities", detail: "Review the customer journey and next steps.", image: "/ryze-media/product-shelf/mcp.webp" },
] as const;

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
  const [reply, setReply] = useState<{ kind: "error" | "processing" | "ready"; text: string } | null>(null);
  const replyTextRef = useRef<HTMLSpanElement>(null);
  const replyTweenRef = useRef<{ kill: () => unknown } | null>(null);
  const processingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState(0);
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

  useEffect(() => {
    return () => {
      if (processingTimer.current) clearTimeout(processingTimer.current);
      replyTweenRef.current?.kill();
    };
  }, []);

  // The visible AI message types above the field, separate from its real value.
  // Screen readers receive the completed reply once instead of every character.
  useEffect(() => {
    replyTweenRef.current?.kill();
    const node = replyTextRef.current;
    if (!node || !reply) return;
    node.textContent = reply.text;
    if (reducedMotion) return;
    let live = true;
    void import("gsap").then(({ gsap }) => {
      if (!live || !node) return;
      const count = { value: 0 };
      node.textContent = "";
      replyTweenRef.current = gsap.to(count, {
        value: reply.text.length,
        duration: reply.text.length * CHAT_RHYTHM.character,
        snap: { value: 1 },
        ease: "none",
        onUpdate: () => { if (live) node.textContent = reply.text.slice(0, Math.round(count.value)); },
        onComplete: () => { if (live) node.textContent = reply.text; },
      });
    }).catch(() => { if (live) node.textContent = reply.text; });
    return () => {
      live = false;
      replyTweenRef.current?.kill();
      replyTweenRef.current = null;
      node.textContent = reply.text;
    };
  }, [reply, reducedMotion]);

  function submitWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopPresentation();
    if (processingTimer.current) clearTimeout(processingTimer.current);
    const store = normalizeWebsiteAddress(website);
    if (!store) {
      const message = !website.trim()
        ? "I'll need your website address to get started."
        : "That website address doesn't look right. Could you check it?";
      setError(message);
      setReply({ kind: "error", text: message });
      setSubmitted(false);
      return;
    }
    setError("");
    setSubmitted(false);
    const processingCopy = `Preparing a sample preview for ${store}. Let's explore Ryze.`;
    setReply({ kind: "processing", text: processingCopy });
    processingTimer.current = setTimeout(() => {
      setSubmitted(true);
      setReply({ kind: "ready", text: `Here is an example of the opportunities Ryze could explore for ${store}.` });
      processingTimer.current = null;
    }, reducedMotion ? 100 : Math.ceil(
      (processingCopy.length * CHAT_RHYTHM.character + CHAT_RHYTHM.processingTail) * 1000
    ));
  }

  const active = capabilities[selected];
  const overlayVisible = hydrated && introReleased && !reducedMotion && !hasInteracted && !website;

  return (
    <section id="hero-conversation" className={styles.chat} aria-label="Ryze AI preview">
      {reply && (
        <div className={styles.reply} data-ai-reply={reply.kind}>
          <p className={styles.assistantReply} aria-hidden="true"><span ref={replyTextRef}>{reply.text}</span><span className={styles.replyCursor} aria-hidden="true" /></p>
          {reply.kind === "error"
            ? <span id="ryze-website-error" className={styles.screenReader} role="alert">{reply.text}</span>
            : <span className={styles.screenReader} role="status">{reply.text}</span>}
        </div>
      )}
      {submitted && (
        <div className={styles.proof} role="region" aria-label="Ryze capability examples">
          <div className={styles.choices}>
            {capabilities.map((item, index) => (
              <button className={styles.choice} type="button" key={item.id}
                aria-pressed={selected === index}
                onClick={() => { stopPresentation(); setSelected(index); }}>{item.label}</button>
            ))}
          </div>
          <div className={styles.preview} key={active.id}>
            <div className={styles.previewText}><strong>{active.title}</strong><p>{active.detail}</p></div>
            <div className={styles.previewImage}>
              <Image src={basePath + active.image} width={720} height={540}
                alt={active.label + " illustrative visual"}
                sizes="(max-width: 640px) 80vw, 230px" unoptimized />
            </div>
          </div>
          <p className={styles.honesty}>Demo only. No website was contacted or analyzed.</p>
        </div>
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
              setSubmitted(false);
              if (processingTimer.current) clearTimeout(processingTimer.current);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "ryze-website-error" : "ryze-website-note"} />
          {overlayVisible && <span className={styles.animatedPlaceholder} data-animated-placeholder aria-hidden="true" ref={hint}>Enter your website…</span>}
        </div>
        <button type="submit" disabled={!hydrated} aria-label="Start for free">Start for free</button>
      </form>
      <p className={styles.screenReader} id="ryze-website-note">Local preview: your website address stays in this browser; no site is analyzed.</p>

    </section>
  );
}
