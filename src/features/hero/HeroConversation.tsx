"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./HeroConversation.module.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const capabilities = [
  { id: "ads", label: "Paid Ads", heading: "Spot opportunities in your campaigns", detail: "Ryze can help review campaigns and suggest where to focus next.", image: "/ryze-media/product-shelf/muse.webp", ratio: "landscape" },
  { id: "seo", label: "SEO & AI visibility", heading: "Make your store easier to discover", detail: "Explore search visibility, useful page improvements and AI discovery.", image: "/ryze-media/product-shelf/seo.webp", ratio: "landscape" },
  { id: "cro", label: "Conversion", heading: "Find room for better conversion", detail: "Review a customer journey and see potential ways to improve it.", image: "/ryze-media/product-shelf/mcp.webp", ratio: "portrait" },
] as const;

type Capability = typeof capabilities[number]["id"];

export default function HeroConversation() {
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<Capability>("ads");
  const [interacted, setInteracted] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const introRef = useRef<{ progress: (value: number) => unknown; kill: () => unknown } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = capabilities.find(item => item.id === selected) ?? capabilities[0];

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    let live = true;
    let release: (() => void) | undefined;
    void import("gsap").then(({ gsap }) => {
      if (!live || !rootRef.current) return;
      const mm = gsap.matchMedia();
      mm.add({
        animate: "(prefers-reduced-motion: no-preference)",
        compact: "(max-width: 699px)",
      }, ({ conditions }) => {
        if (!conditions?.animate || !rootRef.current) return;
        const lines = rootRef.current.querySelectorAll("[data-chat-intro]");
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline.fromTo(lines,
          { opacity: 0.45, y: conditions.compact ? 7 : 12 },
          { opacity: 1, y: 0, duration: conditions.compact ? 0.36 : 0.48, stagger: 0.24, clearProps: "opacity,transform" },
          0.08,
        );
        introRef.current = timeline;
        return () => { timeline.progress(1); timeline.kill(); introRef.current = null; };
      });
      release = () => mm.revert();
    }).catch(() => { /* Text and native input are always visible without GSAP. */ });
    return () => { live = false; introRef.current?.progress(1); release?.(); };
  }, []);

  function stopPresentation() {
    if (interacted) return;
    setInteracted(true);
    introRef.current?.progress(1);
    introRef.current?.kill();
    introRef.current = null;
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopPresentation();
    const value = email.trim();
    const valid = inputRef.current?.checkValidity() && value.length <= 254;
    if (!valid) {
      setEmailError("Enter a valid email address to see the preview.");
      inputRef.current?.focus();
      return;
    }
    setEmailError("");
    setSubmitted(true);
  }

  return (
    <section ref={rootRef} id="hero-conversation" className={styles.chat} aria-label="Ryze AI preview" data-stage={submitted ? "preview" : "email"}>
      <div className={styles.topline}>
        <div className={styles.identity}><span className={styles.pulse} aria-hidden="true" /> RYZE AI</div>
        <span className={styles.mode}>INTERACTIVE PREVIEW</span>
      </div>
      <div className={styles.transcript}>
        <p data-chat-intro className={styles.message}>Hey, I’m Ryze. I can help you grow your Shopify store.</p>
        {!submitted ? (
          <p data-chat-intro className={styles.question}>Where should I send your free AI growth preview?</p>
        ) : (
          <>
            <p className={styles.question}>Here is a quick look at what we can work on together.</p>
            <div className={styles.choices} aria-label="Explore capabilities">
              {capabilities.map(item => (
                <button type="button" key={item.id} onClick={() => { stopPresentation(); setSelected(item.id); }}
                  aria-pressed={selected === item.id} className={styles.choice}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className={styles.preview} key={active.id} aria-label={active.label + " example"} data-preview>
              <div className={styles.previewText}>
                <span className={styles.previewEyebrow}>EXAMPLE WORKFLOW / {active.label.toUpperCase()}</span>
                <strong>{active.heading}</strong>
                <p>{active.detail}</p>
              </div>
              <div className={styles.previewImage}>
                <Image src={basePath + active.image} width={720} height={540} alt={active.label + " illustrative visual"} sizes="(max-width: 640px) 90vw, 230px" unoptimized />
              </div>
            </div>
            <p className={styles.honesty} role="status">Demo only. No email has been sent and no store has been analyzed.</p>
          </>
        )}
      </div>
      {!submitted ? (
        <form className={styles.composer} onSubmit={submitEmail} noValidate>
          <label className={styles.screenReader} htmlFor="ryze-preview-email">Your email address</label>
          <input id="ryze-preview-email" ref={inputRef} type="email" name="email"
            autoComplete="email" inputMode="email" required maxLength={254}
            placeholder="Your email address…" value={email} onFocus={stopPresentation}
            onChange={(event) => { setEmail(event.target.value); setEmailError(""); }}
            aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "ryze-email-error" : "ryze-email-note"} />
          <button type="submit" disabled={!hydrated} aria-label="Show AI preview"><span aria-hidden="true">↗</span></button>
        </form>
      ) : (
        <div className={styles.composerDone}>
          <span>Explore another capability or change your email</span>
          <button type="button" onClick={() => { setSubmitted(false); setEmail(""); setEmailError(""); requestAnimationFrame(() => inputRef.current?.focus()); }}>Reset</button>
        </div>
      )}
      {emailError && <p id="ryze-email-error" role="alert" className={styles.error}>{emailError}</p>}
      <p id="ryze-email-note" className={styles.privacy}>
        Local demonstration. Your email stays in this browser session and is not submitted.
        {!hydrated && " Enable JavaScript to try the preview."}
      </p>
    </section>
  );
}
