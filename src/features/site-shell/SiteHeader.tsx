"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import Image from "next/image";
import {
  bookingLink, headerLinks, mobileSiteSections, navigationGroups, navigationProductCards,
  previewNotice, shopifyDockSections, shopifyPricingHref, shopifyStartHref,
} from "./link-model";
import type { ShopifyDockSection, SiteDestination } from "./link-model";
import styles from "./SiteHeader.module.css";

export type NavigationMode = "auto" | "static" | "reduced" | "no-webgl" | "lightweight" | "full";
export type NavigationTheme = "dawn" | "dusk";

type SiteHeaderProps = {
  brand?: ReactNode;
  previewMode?: boolean;
  variant?: "ryze" | "hero" | "dock";
  theme?: NavigationTheme;
  enhancement?: NavigationMode;
  onPreviewDestination?: (destination: SiteDestination) => void;
  onDockChange?: (docked: boolean) => void;
};

function useNavigationMode(requested: NavigationMode): Exclude<NavigationMode, "auto"> {
  const [mode, setMode] = useState<Exclude<NavigationMode, "auto">>(
    requested === "auto" ? "lightweight" : requested,
  );
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (requested === "static") return setMode("static");
      if (requested === "reduced" || motion.matches) return setMode("reduced");
      if (requested !== "auto") return setMode(requested);
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      setMode((memory !== undefined && memory <= 4) || (navigator.hardwareConcurrency || 8) <= 4 ? "lightweight" : "full");
    };
    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, [requested]);
  return mode;
}

function FeaturedProducts({ onSelect }: { onSelect: (event: MouseEvent<HTMLAnchorElement>, destination: SiteDestination) => void }) {
  return (
    <section className={styles.productHighlights} aria-label="Ryze product capabilities">
      <p className={styles.productHighlightsHeading}>Products</p>
      <div className={styles.productCards}>
        {navigationProductCards.map((destination) => (
          <a key={destination.id} className={styles.productCard} href={destination.href}
             data-mega-item onClick={(event) => onSelect(event, destination)}>
            <span className={styles.productVisual}>
              <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${destination.image}`} alt="" width={destination.width} height={destination.height}
                     sizes="(max-width: 720px) 45vw, 190px" unoptimized />
            </span>
            <strong className={styles.productCardTitle}>{destination.label}</strong>
            <span className={styles.productCardDescription}>{destination.description}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

type DockIconName = "ads" | "seo" | "cro" | "pricing" | "start";
function DockIcon({ name }: { name: DockIconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" {...common}>
    {name === "ads" && <><path d="M3 10h4l12-6v16L7 14H3z"/><path d="M7 14l2 6h4l-3-5"/></>}
    {name === "seo" && <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>}
    {name === "cro" && <path d="m5 3 14 10-7 1.5-2 6L5 3z"/>}
    {name === "pricing" && <><path d="M13 3H5a2 2 0 0 0-2 2v8l8 8a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8L13 3Z"/><circle cx="8" cy="8" r="1.3"/></>}
    {name === "start" && <path d="M4 12h15m-6-6 6 6-6 6"/>}
  </svg>;
}

export function SiteHeader({
  brand,
  previewMode = true,
  variant = "ryze",
  theme = "dusk",
  enhancement = "lightweight",
  onPreviewDestination,
  onDockChange,
}: SiteHeaderProps) {
  const mode = useNavigationMode(enhancement);
  const premium = mode === "full" || mode === "no-webgl";
  const uid = useId().replace(/:/g, "");
  const [desktopGroup, setDesktopGroup] = useState<string | null>(null);
  const [renderedGroup, setRenderedGroup] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  const [noticeHovered, setNoticeHovered] = useState(false);
  const [noticeFocused, setNoticeFocused] = useState(false);
  const noticeId = useRef(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const wasMobileOpen = useRef(false);
  const desktopNavRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelMotionRef = useRef<{ play: () => unknown; reverse: () => unknown; kill: () => unknown; revert: () => unknown } | null>(null);

  const openGroup = useCallback((id: string | null) => {
    activeRef.current = id;
    setDesktopGroup(id);
    // Keep outgoing content mounted until the reverse GSAP timeline completes.
    setRenderedGroup((rendered) => !premium || rendered === null ? id : rendered);
  }, [premium]);

  useEffect(() => {
    if (!notice || noticeHovered || noticeFocused) return;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice, noticeHovered, noticeFocused]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mobileOpen) {
      if (!dialog.open) dialog.showModal();
      dialog.querySelector<HTMLButtonElement>("button")?.focus();
    } else {
      if (dialog.open) dialog.close();
      if (wasMobileOpen.current) {
        const visibleTrigger = [menuTriggerRef.current, brandRef.current]
          .find((item) => item && item.getClientRects().length);
        visibleTrigger?.focus({ preventScroll: true });
      }
    }
    wasMobileOpen.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [mobileOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const handle = () => {
      if (desktop.matches) {
        setMobileOpen(false);
      }
    };
    desktop.addEventListener("change", handle);
    return () => desktop.removeEventListener("change", handle);
  }, []);

  useEffect(() => {
    if (!desktopGroup) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const id = activeRef.current;
      openGroup(null);
      if (id) document.getElementById(uid + "-trigger-" + id)?.focus();
    }
    function handleOutside(event: PointerEvent) {
      if (!desktopNavRef.current?.contains(event.target as Node)) openGroup(null);
    }
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [desktopGroup, openGroup, uid]);

  // The complete menu uses the original reversible clip-path + stagger idea.
  // The library is downloaded only after the first premium menu opens.
  useEffect(() => {
    if (!renderedGroup || !premium) return;
    let alive = true;
    const currentGroup = renderedGroup;
    const panel = panelRef.current;
    if (!panel) return;
    import("gsap").then(({ gsap }) => {
      if (!alive || !panel.isConnected) return;
      const links = panel.querySelectorAll("[data-mega-item]");
      const heading = panel.querySelectorAll("[data-mega-heading]");
      const timeline = gsap.timeline({
        paused: true,
        onReverseComplete: () => setRenderedGroup((id) =>
          id === currentGroup ? activeRef.current : id),
      });
      const anchor = document.getElementById(uid + "-trigger-" + currentGroup)?.getBoundingClientRect();
      const bounds = panel.getBoundingClientRect();
      const fromAbove = bounds.top > (anchor?.bottom ?? 0);
      const x = Math.max(0, Math.min(bounds.width - 80, (anchor?.left ?? bounds.left) - bounds.left));
      const rightInset = Math.max(0, bounds.width - x - (anchor?.width ?? 80));
      const collapsed = fromAbove
        ? `inset(0px ${rightInset}px ${Math.max(0, bounds.height - 12)}px ${x}px round 14px)`
        : `inset(${Math.max(0, bounds.height - 12)}px ${rightInset}px 0px ${x}px round 14px)`;
      timeline.fromTo(panel,
        { autoAlpha: 0, clipPath: collapsed, y: fromAbove ? -10 : 10, scale: 0.98 },
        { autoAlpha: 1, clipPath: "inset(0px 0px 0px 0px round 24px)", y: 0, scale: 1,
          duration: 0.64, ease: "back.out(1.3)", easeReverse: "power3.out" }, 0);
      timeline.fromTo(heading, { autoAlpha: 0, y: -8 },
        { autoAlpha: 1, y: 0, duration: 0.24, ease: "power2.out", stagger: 0.04 }, 0.1);
      timeline.fromTo(links, { autoAlpha: 0, y: -17, scale: 0.97, filter: "blur(4px)" },
        { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.34,
          stagger: { amount: 0.18 }, ease: "power3.out" }, 0.14);
      panelMotionRef.current = timeline;
      if (activeRef.current === currentGroup) timeline.play();
      else timeline.progress(1).reverse();
    }).catch(() => {
      if (alive) {
        // GSAP is optional. Keep the usable menu if its chunk cannot load.
        panel.style.visibility = "visible";
        setRenderedGroup(activeRef.current);
      }
    });
    return () => {
      alive = false;
      panelMotionRef.current?.revert();
      panelMotionRef.current?.kill();
      panelMotionRef.current = null;
    };
  }, [renderedGroup, premium, uid]);

  useEffect(() => {
    const animation = panelMotionRef.current;
    if (!premium || !animation) return;
    if (desktopGroup === renderedGroup) animation.play();
    else animation.reverse();
  }, [desktopGroup, renderedGroup, premium]);

  // The Homework nav crosses at the end of the dark showcase, not after
  // an arbitrary number of scroll pixels. Relocate while briefly invisible:
  // the dock must never fly across the content.
  useEffect(() => {
    if (variant !== "dock") return;
    const node = rootRef.current;
    if (!node) return;
    let disposed = false;
    let gsapApi: typeof import("gsap").gsap | null = null;
    let lastDocked: boolean | null = null;
    const position = (force = false) => {
      const darkEnd = document.querySelector<HTMLElement>("[data-ryze-dark-end]");
      const docked = darkEnd
        ? darkEnd.getBoundingClientRect().bottom <= 80
        : window.scrollY >= Math.max(160, window.innerHeight * 0.7);
      if (docked === lastDocked && !force) return;
      const changed = docked !== lastDocked;
      lastDocked = docked;
      const settle = () => {
        node.dataset.docked = String(docked);
        onDockChange?.(docked);
      };
      if (changed && docked) openGroup(null);
      if (gsapApi && premium && changed && !force) {
        gsapApi.killTweensOf(node);
        gsapApi.timeline()
          .to(node, { autoAlpha: 0, duration: 0.12, ease: "power2.in" })
          .call(settle)
          .to(node, { autoAlpha: 1, duration: 0.42, ease: "power3.out" });
      } else {
        gsapApi?.killTweensOf(node);
        settle();
        node.style.removeProperty("opacity");
        node.style.removeProperty("visibility");
      }
    };
    position(true);
    if (premium) import("gsap").then(({ gsap }) => {
      if (!disposed) gsapApi = gsap;
    }).catch(() => { /* Position and content remain usable without GSAP. */ });
    const onScroll = () => position();
    const onResize = () => position(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      gsapApi?.killTweensOf(node);
      node.style.removeProperty("opacity");
      node.style.removeProperty("visibility");
    };
  }, [variant, premium, openGroup, onDockChange]);

  function closeMobile() {
    setMobileOpen(false);
  }

  function selectDestination(event: MouseEvent<HTMLAnchorElement>, destination: SiteDestination) {
    if (!previewMode) return;
    event.preventDefault();
    if (onPreviewDestination) onPreviewDestination(destination);
    else {
      setNoticeHovered(false);
      setNoticeFocused(false);
      setNotice({ id: ++noticeId.current, text: previewNotice(destination) });
    }
    openGroup(null);
    closeMobile();
  }

  function selectShopifySection(event: MouseEvent<HTMLAnchorElement>, section: ShopifyDockSection) {
    event.preventDefault();
    const target = document.getElementById(section.targetId);
    if (target) {
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      return;
    }
    if (onPreviewDestination) onPreviewDestination({ id: section.id, label: section.label, href: section.href });
    else {
      setNoticeHovered(false);
      setNoticeFocused(false);
      setNotice({ id: ++noticeId.current, text: section.label + " is not available in this preview yet." });
    }
  }

  function destinationAnchor(destination: SiteDestination, className: string, mega = false) {
    return (
      <a key={destination.id} href={destination.href} className={className}
         data-mega-item={mega || undefined}
         onClick={(event) => selectDestination(event, destination)}
         target={destination.id === bookingLink.id && !previewMode ? "_blank" : undefined}
         rel={destination.id === bookingLink.id && !previewMode ? "noopener noreferrer" : undefined}>
        <span>{destination.label}</span>
        {destination.description && <span className={styles.description}>{destination.description}</span>}
      </a>
    );
  }

  const panelGroup = navigationGroups.find((group) => group.id === renderedGroup);

  return (
    <header ref={rootRef} className={styles.header} data-theme={theme}
            data-variant={variant} data-enhancement={mode} data-docked="false">
      <div className={styles.inner}>
        <a ref={brandRef} href="https://www.get-ryze.ai/" className={styles.brand}
           data-preview-part="header-brand"
           onClick={(event) => selectDestination(event, {
             id: "brand", label: "Ryze", href: "https://www.get-ryze.ai/",
           })} aria-label="Ryze home">
          {brand ?? <Image className={styles.brandImage} src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/ryze-lockup-white.svg`} alt=""
                           width={126} height={40} unoptimized priority />}
        </a>

        {mode === "static" ? (
          <nav className={styles.staticNavigation} aria-label="Primary navigation">
            {navigationGroups.map((group) => (
              <details className={styles.staticGroup} key={group.id}>
                <summary>{group.label}<span aria-hidden="true">⌄</span></summary>
                <div className={styles.staticPanel}>
                  {group.id === "products" && <FeaturedProducts onSelect={selectDestination} />}
                  <div className={styles.megaGrid}>
                    {group.links.map((destination) => destinationAnchor(destination, styles.megaLink, true))}
                  </div>
                </div>
              </details>
            ))}
            {headerLinks.map((destination) => destinationAnchor(destination, styles.directLink))}
          </nav>
        ) : (
          <nav ref={desktopNavRef} className={styles.desktopNavigation}
               data-preview-part="header-navigation" aria-label="Primary navigation"
               onPointerLeave={(event) => { if (event.pointerType === "mouse") openGroup(null); }}>
            {navigationGroups.map((group) => (
              <div className={styles.group} key={group.id}
                   onPointerEnter={(event) => { if (event.pointerType === "mouse") openGroup(group.id); }}>
                <button className={styles.navTrigger} id={uid + "-trigger-" + group.id}
                        type="button" aria-expanded={desktopGroup === group.id}
                        aria-controls={desktopGroup === group.id ? uid + "-mega-" + group.id : undefined}
                        onClick={() => openGroup(activeRef.current === group.id ? null : group.id)}
                        onKeyDown={(event) => {
                          if (event.key === "ArrowDown") {
                            event.preventDefault();
                            openGroup(group.id);
                            requestAnimationFrame(() =>
                              panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true }));
                          }
                        }}>
                  {group.label}<span aria-hidden="true" className={styles.chevron}>⌄</span>
                </button>
              </div>
            ))}
            {headerLinks.map((destination) => destinationAnchor(destination, styles.directLink))}
            {panelGroup && (
              <div ref={panelRef} className={styles.megaPanel} id={uid + "-mega-" + panelGroup.id}
                   data-preview-part="mega-menu" data-open={desktopGroup === panelGroup.id}
                   aria-hidden={desktopGroup !== panelGroup.id}
                   inert={desktopGroup !== panelGroup.id}>
                <div className={styles.megaPanelTop} data-mega-heading>
                  <span className={styles.megaEyebrow}>EXPLORE RYZE / {panelGroup.label.toUpperCase()}</span>
                  <span className={styles.megaPanelIndex}>0{navigationGroups.indexOf(panelGroup) + 1} / 03</span>
                </div>
                <div className={styles.megaContent}>
                  {panelGroup.id === "products" && <FeaturedProducts onSelect={selectDestination} />}
                  <div className={styles.megaLinksColumn}>
                    <p className={styles.megaSectionName} data-mega-heading>{panelGroup.label}</p>
                    <div className={styles.megaGrid}>
                      {panelGroup.links.map((destination) => destinationAnchor(destination, styles.megaLink, true))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </nav>
        )}

        <div className={styles.actions} data-preview-part="header-actions">
          {destinationAnchor(bookingLink, styles.booking)}
          {mode !== "static" && (
            <button ref={menuTriggerRef} type="button" className={styles.mobileToggle}
                    aria-label="Toggle navigation menu" aria-expanded={mobileOpen}
                    onClick={() => mobileOpen ? closeMobile() : setMobileOpen(true)}>
              <span className={styles.toggleLines} aria-hidden="true"><i /><i /></span>
            </button>
          )}
        </div>
      </div>

      {mode !== "static" && (
        <dialog ref={dialogRef} className={styles.mobileDialog} data-preview-part="mobile-menu"
                data-theme={theme} aria-label="Ryze site navigation"
                onClick={(event) => { if (event.target === event.currentTarget) closeMobile(); }}
                onCancel={(event) => { event.preventDefault(); closeMobile(); }}
                onClose={closeMobile}>
          <div className={styles.mobileBar}>
            <span className={styles.mobileHeading}>Explore Ryze</span>
            <button className={styles.mobileClose} type="button" aria-label="Close navigation"
                    onClick={closeMobile}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5 19 19M19 5 5 19" />
                </svg></button>
          </div>
          <nav className={styles.mobileList} aria-label="Site destinations">
            {mobileSiteSections.map((group) => (
              <section key={group.id} className={styles.mobileSiteSection}>
                <h2 className={styles.mobileSectionTitle}>{group.label}</h2>
                {group.links.map((destination) => destinationAnchor(destination, styles.mobileLink))}
              </section>
            ))}
          </nav>
        </dialog>
      )}

      {variant === "dock" && (
        <nav className={styles.mobileDock} aria-label="Shopify quick navigation"
             data-preview-part="mobile-dock">
          {shopifyDockSections.map((section, index) => (
            <a key={section.id} className={styles.mobileDockItem} href={section.href}
               onClick={(event) => selectShopifySection(event, section)}>
              <DockIcon name={index === 0 ? "ads" : index === 1 ? "seo" : "cro"} />
              <span>{section.label}</span>
            </a>
          ))}
          <a className={styles.mobileDockItem} href={shopifyPricingHref}>
            <DockIcon name="pricing" /><span>Pricing</span>
          </a>
          <a className={styles.mobileDockItem} href={shopifyStartHref}>
            <DockIcon name="start" /><span>Start</span>
          </a>
        </nav>
      )}

      <noscript><nav aria-label="All destinations" className={styles.noScriptLinks}>
        {mobileSiteSections.flatMap((group) => group.links).concat(headerLinks, [bookingLink, { id: "start-nojs", label: "Get started", href: shopifyStartHref }])
          .map((link) => <a key={link.id} href={link.href}>{link.label}</a>)}
      </nav></noscript>

      {notice && !onPreviewDestination && (
        <div key={notice.id} className={styles.notice} data-preview-part="destination-notice"
             role="status"
             onMouseEnter={() => setNoticeHovered(true)}
             onMouseLeave={() => setNoticeHovered(false)}
             onFocusCapture={() => setNoticeFocused(true)}
             onBlurCapture={(event) => {
               if (!event.currentTarget.contains(event.relatedTarget)) setNoticeFocused(false);
             }}>
          <p>{notice.text}</p>
          <button type="button" aria-label="Dismiss message"
                  onClick={() => { setNotice(null); setNoticeHovered(false); setNoticeFocused(false); }}>×</button>
        </div>
      )}
    </header>
  );
}
