"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { clampWanderDestination, placeBubble, resolveLookCell, resolveSpriteFrame, shouldCompact, shouldWander, type AnimationName } from "./mascot-model";
import RizzieMessage from "./RizzieMessage";
import styles from "./Rizzie.module.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const posterSrc = `${basePath}/pets/rizzie/poster.png`;
const atlasSrc = `${basePath}/pets/rizzie/spritesheet.webp`;
type Message = { id: number; text: string };
type Animation = AnimationName | "gaze";

export default function RizzieMascot({ onActivate, actionOpen }: {
  onActivate: (trigger: HTMLAnchorElement) => void;
  actionOpen: boolean;
}) {
  const zoneRef = useRef<HTMLElement>(null);
  const petRef = useRef<HTMLAnchorElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation>("idle");
  const animationAt = useRef(0);
  const walkUntil = useRef(0);
  const gazeUntil = useRef(0);
  const queueGaze = useRef(false);
  const x = useRef(8);
  const counter = useRef(0);
  const [ready, setReady] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [motion, setMotion] = useState(false);
  const [visible, setVisible] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [compact, setCompact] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [bubbleStyle, setBubbleStyle] = useState<CSSProperties>({});
  const [bubbleSide, setBubbleSide] = useState<"right" | "left" | "top">("right");
  const dismissMessage = useCallback(() => setMessage(null), []);

  const freezeWalk = useCallback(() => {
    const zone = zoneRef.current;
    const pet = petRef.current;
    if (!zone || !pet || !animation.current.startsWith("running-")) return;
    const visibleX = pet.getBoundingClientRect().left - zone.getBoundingClientRect().left;
    x.current = clampWanderDestination({
      zoneWidth: zone.clientWidth, petWidth: pet.offsetWidth,
      currentX: visibleX, deltaX: 0,
    });
    pet.style.transition = "none";
    pet.style.setProperty("--walk-x", `${x.current}px`);
    requestAnimationFrame(() => {
      if (pet.isConnected) pet.style.removeProperty("transition");
    });
    animation.current = "idle";
    animationAt.current = performance.now();
  }, []);

  const measure = useCallback(() => {
    const zone = zoneRef.current;
    const pet = petRef.current;
    if (!zone || !pet) return;
    const small = shouldCompact({ width: zone.clientWidth, height: zone.clientHeight });
    setCompact(small);
    x.current = clampWanderDestination({
      zoneWidth: zone.clientWidth, petWidth: small ? 80 : 150,
      currentX: x.current, deltaX: 0,
    });
    pet.style.setProperty("--walk-x", `${x.current}px`);
    const bubble = zone.querySelector<HTMLElement>("[data-rizzie-bubble]");
    if (!bubble || !message) return;
    const bounds = bubble.getBoundingClientRect();
    const placed = placeBubble({
      zoneWidth: zone.clientWidth, zoneHeight: zone.clientHeight,
      petX: x.current, petTop: Math.max(0, zone.clientHeight - (small ? 92 : 180)),
      petWidth: small ? 80 : 150,
      bubbleWidth: bounds.width, bubbleHeight: bounds.height,
    });
    setBubbleStyle({ left: placed.x, top: placed.y });
    setBubbleSide(placed.side);
  }, [message]);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    const resize = new ResizeObserver(measure);
    resize.observe(zone);
    measure();
    return () => resize.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!message) return;
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [message, measure]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const desktopQuery = window.matchMedia("(min-width: 820px) and (pointer: fine)");
    const sync = () => {
      setMotion(motionQuery.matches && !document.hidden);
      setDesktop(desktopQuery.matches);
    };
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)));
    if (zoneRef.current) observer.observe(zoneRef.current);
    sync();
    motionQuery.addEventListener("change", sync);
    desktopQuery.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", sync);
      desktopQuery.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (!motion || !visible || ready) return;
    let cancelled = false;
    const img = new window.Image();
    img.src = atlasSrc;
    img.decode().then(() => {
      if (!cancelled && img.naturalWidth === 1536 && img.naturalHeight === 2288) setReady(true);
    }).catch(() => { /* Keep the poster if atlas loading fails. */ });
    return () => { cancelled = true; };
  }, [motion, visible, ready]);

  useEffect(() => {
    const onMessage = (event: Event) => {
      const value = (event as CustomEvent<{ text?: unknown }>).detail?.text;
      if (typeof value === "string" && value.trim()) {
        freezeWalk();
        setMessage({ id: ++counter.current, text: value.trim().slice(0, 240) });
      }
    };
    window.addEventListener("rizzie:message", onMessage);
    return () => window.removeEventListener("rizzie:message", onMessage);
  }, [freezeWalk]);

  useEffect(() => {
    if (!ready || !motion || !visible) return;
    let lastCell = "";
    const tick = () => {
      const now = performance.now();
      if (queueGaze.current && animation.current === "waving" &&
          resolveSpriteFrame("waving", now - animationAt.current).completed) {
        queueGaze.current = false;
        animation.current = "gaze";
        gazeUntil.current = now + 1250;
      }
      let cell;
      if (animation.current === "gaze") {
        const target = document.querySelector("#hero-action input, #hero-action summary")?.getBoundingClientRect();
        const pet = petRef.current?.getBoundingClientRect();
        cell = target && pet
          ? resolveLookCell(target.left + target.width / 2 - (pet.left + pet.width / 2), target.top + target.height / 2 - (pet.top + pet.height / 2))
          : resolveSpriteFrame("idle", 0);
        if (now >= gazeUntil.current) {
          animation.current = "idle";
          animationAt.current = now;
        }
      } else {
        const name = animation.current;
        const frame = resolveSpriteFrame(name, now - animationAt.current);
        cell = frame;
        if (frame.completed || (name.startsWith("running-") && now >= walkUntil.current)) {
          animation.current = "idle";
          animationAt.current = now;
        }
      }
      const id = `${cell.x},${cell.y}`;
      if (spriteRef.current && id !== lastCell) {
        spriteRef.current.style.backgroundPosition = `${cell.x}px ${cell.y}px`;
        lastCell = id;
      }
    };
    tick();
    const timer = window.setInterval(tick, 90);
    return () => window.clearInterval(timer);
  }, [ready, motion, visible]);

  useEffect(() => {
    if (actionOpen || compact) freezeWalk();
  }, [actionOpen, compact, freezeWalk]);

  const wander = shouldWander({
    desktop, motionAllowed: motion && ready, visible, actionOpen,
    messageOpen: Boolean(message), compact, interacting: engaged,
  });
  useEffect(() => {
    if (!wander) return;
    let timer = 0;
    let cancelled = false;
    const schedule = () => {
      timer = window.setTimeout(() => {
        const zone = zoneRef.current;
        const pet = petRef.current;
        if (!cancelled && zone && pet) {
          const sign = Math.random() < .5 ? -1 : 1;
          const next = clampWanderDestination({
            zoneWidth: zone.clientWidth, petWidth: 150, currentX: x.current,
            deltaX: sign * (20 + Math.random() * 30),
          });
          if (next !== x.current) {
            animation.current = next > x.current ? "running-right" : "running-left";
            animationAt.current = performance.now();
            walkUntil.current = animationAt.current + 1100;
            x.current = next;
            pet.style.setProperty("--walk-x", `${next}px`);
          }
          schedule();
        }
      }, 30000 + Math.random() * 30000);
    };
    schedule();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [wander]);

  const activate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    freezeWalk();
    if (motion && ready) {
      animation.current = "waving";
      animationAt.current = performance.now();
      queueGaze.current = true;
    }
    onActivate(event.currentTarget);
  };

  const animated = motion && ready && visible;
  return (
    <section className={styles.zone} ref={zoneRef} aria-label="Rizzie mascot" data-compact={compact || undefined}>
      <a className={styles.pet} ref={petRef} href="#hero-action"
        aria-label="Rizzie: Start For Free" onClick={activate}
        onMouseEnter={() => { setEngaged(true); freezeWalk(); }}
        onMouseLeave={() => setEngaged(false)}
        onFocus={() => { setEngaged(true); freezeWalk(); }}
        onBlur={() => setEngaged(false)}
        data-animated={animated || undefined} data-fallback={(posterFailed && !animated) || undefined}>
        {!posterFailed && (
          <Image className={styles.poster} src={posterSrc} width={192} height={208} unoptimized loading="eager"
            alt="" draggable={false} onError={() => setPosterFailed(true)} />
        )}
        {animated && (
          <span className={styles.sprite} ref={spriteRef} aria-hidden="true"
            style={{ backgroundImage: `url("${atlasSrc}")` }} />
        )}
        <span className={styles.fallbackLabel}>Start For Free</span>
      </a>
      {message && <RizzieMessage key={message.id} text={message.text}
        onClose={dismissMessage} side={bubbleSide} style={bubbleStyle} />}
    </section>
  );
}
