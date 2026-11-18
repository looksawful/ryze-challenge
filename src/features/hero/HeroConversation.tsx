"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./HeroConversation.module.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const capabilities = [
  { id: "ads", label: "Paid Ads", title: "Campaign opportunities", detail: "Review campaigns and decide where to focus.", image: "/ryze-media/product-shelf/muse.webp" },
  { id: "seo", label: "SEO & AI visibility", title: "Search visibility", detail: "Find ways to improve organic and AI discovery.", image: "/ryze-media/product-shelf/seo.webp" },
  { id: "cro", label: "CRO", title: "Conversion opportunities", detail: "Review the customer journey and next steps.", image: "/ryze-media/product-shelf/mcp.webp" },
] as const;

export default function HeroConversation() {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState(0);
  const field = useRef<HTMLInputElement>(null);
  const composer = useRef<HTMLFormElement>(null);
  const interacted = useRef(false);
  const timeline = useRef<{ progress: (v: number) => unknown; kill: () => unknown } | null>(null);

  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    let alive = true;
    let mm: { revert: () => void } | null = null;
    void import("gsap").then(({ gsap }) => {
      if (!alive || interacted.current || !composer.current) return;
      const media = gsap.matchMedia();
      media.add({ animate: "(prefers-reduced-motion: no-preference)", narrow: "(max-width: 699px)" }, ({ conditions }) => {
        if (!conditions?.animate || !composer.current || interacted.current) return;
        const intro = gsap.fromTo(composer.current,
          { opacity: 0.85, y: conditions.narrow ? 5 : 9 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "opacity,transform" });
        timeline.current = intro;
        return () => { intro.progress(1); intro.kill(); timeline.current = null; };
      });
      mm = media;
    }).catch(() => { /* The native input stays usable. */ });
    return () => { alive = false; timeline.current?.progress(1); mm?.revert(); };
  }, []);

  function stopIntro() {
    interacted.current = true;
    timeline.current?.progress(1);
    timeline.current?.kill();
    timeline.current = null;
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopIntro();
    if (!field.current?.checkValidity() || email.trim().length > 254) {
      setError("Enter a valid email address.");
      field.current?.focus();
      return;
    }
    setError("");
    setSubmitted(true);
  }

  const active = capabilities[selected];

  return (
    <section id="hero-conversation" className={styles.chat} aria-label="Ryze AI preview">
      <form ref={composer} className={styles.composer} onSubmit={submitEmail} noValidate>
        <label className={styles.screenReader} htmlFor="ryze-preview-email">Email address</label>
        <input id="ryze-preview-email" ref={field} type="email" name="email"
          autoComplete="email" inputMode="email" required maxLength={254}
          placeholder="Enter your email…" value={email} onFocus={stopIntro}
          onChange={(event) => { setEmail(event.target.value); setError(""); setSubmitted(false); }}
          aria-invalid={Boolean(error)} aria-describedby={error ? "ryze-email-error" : "ryze-email-note"} />
        <button type="submit" disabled={!ready} aria-label="Show preview">
          <span aria-hidden="true">↗</span>
        </button>
      </form>
      {error && <p id="ryze-email-error" className={styles.error} role="alert">{error}</p>}
      <p className={styles.screenReader} id="ryze-email-note">Local preview: no email is sent or stored.</p>
      {submitted && (
        <div className={styles.proof} role="region" aria-label="Ryze capability examples">
          <div className={styles.choices}>
            {capabilities.map((item, index) => (
              <button className={styles.choice} type="button" key={item.id}
                aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.label}</button>
            ))}
          </div>
          <div className={styles.preview} key={active.id}>
            <div className={styles.previewText}>
              <strong>{active.title}</strong><p>{active.detail}</p>
            </div>
            <div className={styles.previewImage}>
              <Image src={basePath + active.image} width={720} height={540}
                alt={active.label + " illustrative visual"} sizes="(max-width: 640px) 80vw, 230px" unoptimized />
            </div>
          </div>
          <p className={styles.honesty} role="status">Demo only. No email has been sent and no store has been analyzed.</p>
        </div>
      )}
    </section>
  );
}
