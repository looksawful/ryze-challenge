"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import Image from "next/image";
import { HomeworkCookieSettingsButton } from "../consent/HomeworkCookieNotice";
import {
  bookingLink, headerLinks, mobileSiteSections, navigationGroups, navigationProductCards,
  previewNotice, shopifyDockSections, shopifyPricingHref, shopifyStartHref,
} from "./link-model";
import type { ShopifyDockSection, SiteDestination } from "./link-model";
import styles from "./SiteHeader.module.css";
import { MOTION } from "../../motion/tokens";

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
  showMobileCookieSettings?: boolean;
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

export function SiteHeader({
  brand,
  previewMode = true,
  variant = "ryze",
  theme = "dusk",
  enhancement = "lightweight",
  onPreviewDestination,
  onDockChange,
  showMobileCookieSettings = true,
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
  const mobileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    if (mobileCloseTimer.current) clearTimeout(mobileCloseTimer.current);
    if (mobileOpen) {
      if (!dialog.open) dialog.show();
      document.documentElement.dataset.ryzeMobileMenu = "open";
      requestAnimationFrame(() => {
        if (dialog.open) {
          dialog.dataset.slide = "open";
          dialog.querySelector<HTMLHeadingElement>("[data-mobile-heading]")?.focus({ preventScroll: true });
        }
      });
    } else {
      document.documentElement.removeAttribute("data-ryze-mobile-menu");
      dialog.removeAttribute("data-slide");
      if (dialog.open) {
        mobileCloseTimer.current = setTimeout(() => dialog.close(),
          matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 360);
      }
      if (wasMobileOpen.current) {
        const visibleTrigger = [menuTriggerRef.current, brandRef.current]
          .find((item) => item && item.getClientRects().length);
        visibleTrigger?.focus({ preventScroll: true });
      }
    }
    wasMobileOpen.current = mobileOpen;
    return () => { if (mobileCloseTimer.current) clearTimeout(mobileCloseTimer.current); };
  }, [mobileOpen]);

  useEffect(() => () => document.documentElement.removeAttribute("data-ryze-mobile-menu"), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeMobile(); return; }
      if (event.key !== "Tab") return;
      const targets = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(node => node.getClientRects().length > 0);
      if (!targets.length) return;
      const first=targets[0], last=targets[targets.length-1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [mobileOpen]);

  useEffect(() => {
    const desktop = window.matchMedia(variant === "dock" ? "(min-width: 75rem)" : "(min-width: 64rem)");
    const handle = () => {
      if (desktop.matches) {
        setMobileOpen(false);
      }
    };
    desktop.addEventListener("change", handle);
    return () => desktop.removeEventListener("change", handle);
  }, [variant]);

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
      panel.dataset.gsapActive = "true";
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
        { autoAlpha: 0, clipPath: collapsed, y: fromAbove ? -8 : 8, scale: 0.99 },
        { autoAlpha: 1, clipPath: "inset(0px 0px 0px 0px round 24px)", y: 0, scale: 1,
          duration: MOTION.surface.duration, ease: MOTION.surface.ease, easeReverse: MOTION.exit.ease }, 0);
      timeline.fromTo(heading, { autoAlpha: 0, y: -6 },
        { autoAlpha: 1, y: 0, duration: 0.26, ease: MOTION.enter.ease, stagger: 0.035 }, 0.08);
      timeline.fromTo(links, { autoAlpha: 0, y: 12, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.34,
          stagger: { amount: 0.16 }, ease: MOTION.enter.ease }, 0.12);
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
      panel.removeAttribute("data-gsap-active");
      panelMotionRef.current = null;
    };
  }, [renderedGroup, premium, uid]);

  useEffect(() => {
    const animation = panelMotionRef.current;
    if (!premium || !animation) return;
    if (desktopGroup === renderedGroup) animation.play();
    else animation.reverse();
  }, [desktopGroup, renderedGroup, premium]);

  // An agreed top-fixed navigation: scroll changes only its width, not its Y position.
  useEffect(() => {
    if (variant !== "dock") return;
    const node = rootRef.current;
    if (!node) return;
    let lastCompact: boolean | null = null;
    const updateCompact = () => {
      const compact = window.scrollY >= 120;
      node.dataset.docked = String(compact);
      node.dataset.scrollHidden = "false";
      if (compact !== lastCompact) {
        lastCompact = compact;
        onDockChange?.(compact);
      }
    };
    updateCompact();
    window.addEventListener("scroll", updateCompact, { passive: true });
    window.addEventListener("resize", updateCompact);
    return () => {
      window.removeEventListener("scroll", updateCompact);
      window.removeEventListener("resize", updateCompact);
    };
  }, [variant, onDockChange]);

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
    closeMobile();
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
            data-variant={variant} data-enhancement={mode} data-docked="false" data-scroll-hidden="false" data-menu-open={mobileOpen}>
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
          <details className={styles.nativeMenu}>
            <summary aria-label="Open site navigation">Menu</summary>
            <nav className={styles.staticNavigation} aria-label="Primary navigation">
            {navigationGroups.map((group) => (
              <details className={styles.staticGroup} key={group.id}>
                <summary>{group.label}<span aria-hidden="true">⌄</span></summary>
                <div className={styles.staticPanel}>
                  {group.id === "products" && <FeaturedProducts onSelect={selectDestination} />}
                  <div className={styles.megaGrid}>
                    {group.links.map((destination) => destinationAnchor(destination, styles.megaLink, true))}
                    {group.id === "resources" && <HomeworkCookieSettingsButton className={styles.megaLink} />}
                  </div>
                </div>
              </details>
            ))}
            {headerLinks.map((destination) => destinationAnchor(destination, styles.directLink))}
            {variant === "dock" && <a className={styles.mobileStart} href={bookingLink.href} target="_blank" rel="noopener noreferrer">Contact us</a>}
            </nav>
          </details>
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
                      {panelGroup.id === "resources" && <HomeworkCookieSettingsButton className={styles.megaLink} />}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </nav>
        )}

        <div className={styles.actions} data-preview-part="header-actions">
          {variant === "dock" ? (
            <a className={styles.booking} href={bookingLink.href} target="_blank" rel="noopener noreferrer">Contact us</a>
          ) : destinationAnchor(bookingLink, styles.booking)}
          {mode !== "static" && (
            <button ref={menuTriggerRef} type="button" className={styles.mobileToggle}
                    aria-label="Toggle navigation menu" aria-expanded={mobileOpen}
                    aria-controls={uid + "-mobile-menu"}
                    onClick={() => mobileOpen ? closeMobile() : setMobileOpen(true)}>
              <span className={styles.toggleLines} aria-hidden="true"><i /><i /></span>
            </button>
          )}
        </div>
      </div>

      {mode !== "static" && (
        <dialog ref={dialogRef} id={uid + "-mobile-menu"} className={styles.mobileDialog} data-preview-part="mobile-menu"
                data-theme={theme} aria-modal={mobileOpen} aria-label="Ryze site navigation"
                onClick={(event) => { if (event.target === event.currentTarget) closeMobile(); }}
                onCancel={(event) => { event.preventDefault(); closeMobile(); }}
                onClose={closeMobile}>
          <div className={styles.mobileBar}>
            <h2 className={styles.mobileHeading} data-mobile-heading tabIndex={-1}>Explore Ryze</h2>
            <button className={styles.mobileClose} type="button" aria-label="Close navigation"
                    onClick={closeMobile}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5 19 19M19 5 5 19" />
                </svg></button>
          </div>
          <nav className={styles.mobileList} aria-label="Site destinations">
            {variant === "dock" && (
              <section className={styles.drawerQuickLinks} aria-label="Shopify quick navigation"
                       data-preview-part="mobile-dock">
                <h2 className={styles.mobileSectionTitle}>Shopify Autopilot</h2>
                {shopifyDockSections.map((section) => (
                  <a key={section.id} href={section.href} className={styles.drawerQuickLink}
                     onClick={(event) => selectShopifySection(event, section)}>{section.label}</a>
                ))}
                <a className={styles.drawerQuickLink} href={shopifyPricingHref}>Pricing</a>
                <a className={styles.drawerQuickLink} href={shopifyStartHref}>Start</a>
                <a className={styles.mobileStart} href={bookingLink.href}
                   target="_blank" rel="noopener noreferrer">Contact us</a>
              </section>
            )}
            {mobileSiteSections.map((group) => (
              <section key={group.id} className={styles.mobileSiteSection}>
                <h2 className={styles.mobileSectionTitle}>{group.label}</h2>
                {group.links.map((destination) => destinationAnchor(destination, styles.mobileLink))}
              </section>
            ))}
            <section className={styles.mobileProductShelf} aria-label="Other Ryze products">
              <h2 className={styles.mobileSectionTitle}>Other products</h2>
              <div className={styles.mobileProductRail} tabIndex={0}
                   role="region" aria-label="Swipe to browse Ryze products"
                   data-preview-part="mobile-products">
                {navigationProductCards.map((destination) => (
                  <a key={destination.id} className={styles.mobileProductCard}
                     href={destination.href}
                     onClick={(event) => selectDestination(event, destination)}>
                    <span className={styles.mobileProductMedia}>
                      <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${destination.image}`}
                             alt="" width={destination.width} height={destination.height}
                             sizes="(max-width: 420px) 64vw, 220px" unoptimized />
                    </span>
                    <strong className={styles.mobileProductTitle}>{destination.label}</strong>
                    <span className={styles.mobileProductDescription}>{destination.description}</span>
                  </a>
                ))}
              </div>
            </section>
            {showMobileCookieSettings && <HomeworkCookieSettingsButton className={styles.mobileLink} />}
          </nav>
        </dialog>
      )}

      <noscript>
        <details className={styles.nativeMenu}>
          <summary aria-label="Open site navigation">Menu</summary>
          <nav aria-label="All destinations" className={styles.noScriptLinks}>
            {mobileSiteSections.flatMap((group) => group.links).concat(headerLinks, [bookingLink, { id: "start-nojs", label: "Get started", href: shopifyStartHref }])
              .map((link) => <a key={link.id} href={link.href}>{link.label}</a>)}
          </nav>
        </details>
      </noscript>

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
