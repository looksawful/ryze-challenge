"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import { clampWanderDestination, placeRizzieMessage, resolveLookCell, resolveRizzieMode, resolveSpriteFrame, shouldCompact, shouldWander, type AnimationName, type RizzieScenario } from "./mascot-model";
import RizzieMessage from "./RizzieMessage";
import styles from "./Rizzie.module.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const posterSrc = `${basePath}/pets/rizzie/poster.png`;
const atlasSrc = `${basePath}/pets/rizzie/spritesheet.webp`;
type Message = { id: number; text: string };
type Animation = AnimationName | "gaze";

export default function RizzieMascot({ onActivate, actionOpen, scenario = "auto", previewAnimation, previewReplayKey }: {
  onActivate: (trigger: HTMLAnchorElement) => void;
  actionOpen: boolean;
  /** Storybook capability override; production always uses automatic detection. */
  scenario?: RizzieScenario;
  /** Storybook only: replay a real sprite animation without altering production behavior. */
  previewAnimation?: AnimationName | "natural";
  previewReplayKey?: number;
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
  const drag = useRef<{ pointerId: number; x: number; y: number; left: number; top: number; width: number; height: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [supported, setSupported] = useState(true);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [touchPoints, setTouchPoints] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [detached, setDetached] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const [dragging, setDragging] = useState(false);
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
  const mode = resolveRizzieMode({
    hydrated, scenario, motionAllowed: motion, supported, coarsePointer, touchPoints,
    viewportWidth,
  });
  const canDrag = mode.kind === "interactive";

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
    const petBounds = pet.getBoundingClientRect();
    const placed = placeRizzieMessage({
      viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
      petLeft: petBounds.left, petTop: petBounds.top,
      petWidth: petBounds.width, petHeight: petBounds.height,
      bubbleWidth: bounds.width, bubbleHeight: bounds.height,
    });
    setBubbleStyle({ position: "fixed", left: placed.x, top: placed.y });
    setBubbleSide(placed.side);
  }, [message]);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    if (typeof ResizeObserver === "undefined") {
      measure();
      return;
    }
    const resize = new ResizeObserver(measure);
    resize.observe(zone);
    measure();
    return () => resize.disconnect();
  }, [measure, hydrated]);

  useEffect(() => {
    if (!message) return;
    const frame = requestAnimationFrame(measure);
    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [message, measure]);

  useEffect(() => {
    const hasMatchMedia = typeof window.matchMedia === "function";
    const hasObserver = typeof window.ResizeObserver !== "undefined" &&
      typeof window.IntersectionObserver !== "undefined";
    const hasPointerSupport = typeof window.PointerEvent !== "undefined" && typeof Element.prototype.setPointerCapture === "function";
    const motionQuery = hasMatchMedia ? window.matchMedia("(prefers-reduced-motion: no-preference)") : null;
    const desktopQuery = hasMatchMedia ? window.matchMedia("(min-width: 820px) and (pointer: fine)") : null;
    const coarseQuery = hasMatchMedia ? window.matchMedia("(pointer: coarse)") : null;
    const sync = () => {
      setMotion(Boolean(motionQuery?.matches) && !document.hidden);
      setDesktop(Boolean(desktopQuery?.matches));
      setCoarsePointer(Boolean(coarseQuery?.matches));
      setTouchPoints(navigator.maxTouchPoints ?? 0);
      setViewportWidth(window.innerWidth);
    };
    const initialFrame = window.requestAnimationFrame(() => {
      setSupported(hasMatchMedia && hasObserver && hasPointerSupport);
      if (!hasObserver) setVisible(true);
      sync();
      setHydrated(true);
    });
    motionQuery?.addEventListener?.("change", sync);
    desktopQuery?.addEventListener?.("change", sync);
    coarseQuery?.addEventListener?.("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.cancelAnimationFrame(initialFrame);
      motionQuery?.removeEventListener?.("change", sync);
      desktopQuery?.removeEventListener?.("change", sync);
      coarseQuery?.removeEventListener?.("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || typeof IntersectionObserver === "undefined" || !zoneRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)));
    observer.observe(zoneRef.current);
    return () => observer.disconnect();
  }, [hydrated]);

  useEffect(() => {
    if (!motion || !visible || ready || !supported || mode.kind !== "interactive") return;
    let cancelled = false;
    const img = new window.Image();
    img.src = atlasSrc;
    if (typeof img.decode !== "function") {
      const frame = window.requestAnimationFrame(() => {
        if (!cancelled) setSupported(false);
      });
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(frame);
      };
    }
    img.decode().then(() => {
      if (cancelled) return;
      if (img.naturalWidth === 1536 && img.naturalHeight === 2288) setReady(true);
      else setSupported(false);
    }).catch(() => { if (!cancelled) setSupported(false); });
    return () => { cancelled = true; };
  }, [motion, visible, ready, supported, mode.kind]);

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
    if (previewAnimation === undefined || !ready || !motion || mode.kind !== "interactive") return;
    freezeWalk();
    animation.current = previewAnimation === "natural" ? "idle" : previewAnimation;
    animationAt.current = performance.now();
    if (previewAnimation.startsWith("running-")) walkUntil.current = Infinity;
    queueGaze.current = false;
  }, [previewAnimation, previewReplayKey, ready, motion, mode.kind, freezeWalk]);

  useEffect(() => {
    if (actionOpen || compact) freezeWalk();
  }, [actionOpen, compact, freezeWalk]);

  const wander = shouldWander({
    desktop,
    motionAllowed: motion && ready && canDrag && !wasDragged && !detached &&
      (previewAnimation === undefined || previewAnimation === "natural"),
    visible, actionOpen, messageOpen: Boolean(message), compact,
    interacting: engaged || dragging,
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
            zoneWidth: zone.clientWidth, petWidth: pet.offsetWidth, currentX: x.current,
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

  // Adapted from the existing floating pointer-capture behavior in awful-mascots.
  // Eight pixels separate an ordinary CTA click from deliberate drag.
  function pointerDown(event: PointerEvent<HTMLAnchorElement>) {
    if (!canDrag || event.button !== 0) return;
    freezeWalk();
    const bounds = event.currentTarget.getBoundingClientRect();
    drag.current = {
      pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      left: bounds.left, top: bounds.top,
      width: bounds.width, height: bounds.height, moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLAnchorElement>) {
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId || !canDrag) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 8) return;
    const pet = event.currentTarget;
    if (!d.moved) {
      d.moved = true;
      setDetached(true);
      setDragging(true);
      setWasDragged(true);
      pet.dataset.detached = "true";
    }
    const left = Math.max(0, Math.min(window.innerWidth - d.width, d.left + dx));
    const top = Math.max(0, Math.min(window.innerHeight - d.height, d.top + dy));
    pet.style.setProperty("--drag-x", `${left}px`);
    pet.style.setProperty("--drag-y", `${top}px`);

    const bubble = zoneRef.current?.querySelector<HTMLElement>("[data-rizzie-bubble]");
    if (bubble) {
      const placed = placeRizzieMessage({
        viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
        petLeft: left, petTop: top, petWidth: d.width, petHeight: d.height,
        bubbleWidth: bubble.offsetWidth, bubbleHeight: bubble.offsetHeight,
      });
      bubble.style.position = "fixed";
      bubble.style.left = `${placed.x}px`;
      bubble.style.top = `${placed.y}px`;
      if (placed.side !== bubble.dataset.side) {
        bubble.dataset.side = placed.side;
        setBubbleSide(placed.side);
      }
    }
    event.preventDefault();
  }

  function pointerEnd(event: PointerEvent<HTMLAnchorElement>) {
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    if (d.moved) {
      suppressClick.current = true;
      // Click generated from this pointerup is suppressed, later clicks work.
      window.setTimeout(() => { suppressClick.current = false; }, 0);
      measure();
    }
  }

  const activate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    freezeWalk();
    if (canDrag && motion && ready) {
      animation.current = "waving";
      animationAt.current = performance.now();
      queueGaze.current = true;
    }
    onActivate(event.currentTarget);
  };

  const animated = canDrag && motion && ready && visible;
  if (mode.kind === "hidden") return null;
  return (
    <section className={styles.zone} ref={zoneRef} aria-label="Rizzie mascot"
      data-mode={mode.kind} data-compact={compact || undefined}>
      <a className={styles.pet} ref={petRef} href="#hero-action"
        aria-label="Rizzie: Start For Free" onClick={activate}
        onMouseEnter={() => { setEngaged(true); freezeWalk(); }}
        onMouseLeave={() => setEngaged(false)}
        onFocus={() => { setEngaged(true); freezeWalk(); }}
        onBlur={() => setEngaged(false)}
        onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={pointerEnd} onPointerCancel={pointerEnd}
        data-animated={animated || undefined} data-fallback={(posterFailed && !animated) || undefined}
        data-draggable={canDrag || undefined} data-detached={detached || undefined}
        data-dragging={dragging || undefined}>
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
        onClose={dismissMessage} side={bubbleSide}
        variant={mode.kind === "static" ? "toast" : "bubble"}
        style={mode.kind === "static" ? undefined : bubbleStyle} />}
    </section>
  );
}
