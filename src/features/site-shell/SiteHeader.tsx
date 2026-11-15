"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import {
  bookingLink,
  headerLinks,
  navigationGroups,
  previewNotice,
} from "./link-model";
import type { SiteDestination } from "./link-model";
import styles from "./SiteHeader.module.css";

type SiteHeaderProps = {
  brand?: ReactNode;
  previewMode?: boolean;
  onPreviewDestination?: (destination: SiteDestination) => void;
};

export function SiteHeader({
  brand,
  previewMode = true,
  onPreviewDestination,
}: SiteHeaderProps) {
  const [desktopGroup, setDesktopGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const wasMobileOpen = useRef(false);
  const desktopNavRef = useRef<HTMLElement>(null);
  const hoverOpenedRef = useRef<string | null>(null);
  const mobileBackRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mobileOpen) {
      if (!dialog.open) dialog.showModal();
      dialog.querySelector<HTMLButtonElement>("button")?.focus();
    } else {
      if (dialog.open) dialog.close();
      if (wasMobileOpen.current) menuTriggerRef.current?.focus();
    }
    wasMobileOpen.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  useEffect(() => {
    // Keep synchronized with the layout rule in SiteHeader.module.css.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) {
        setMobileOpen(false);
        setMobileGroup(null);
      }
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (mobileOpen && mobileGroup) mobileBackRef.current?.focus();
  }, [mobileOpen, mobileGroup]);

  useEffect(() => {
    if (!desktopGroup) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      hoverOpenedRef.current = null;
      setDesktopGroup(null);
      document.getElementById("ryze-trigger-" + desktopGroup)?.focus();
    }
    function handleOutsidePointer(event: PointerEvent) {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        hoverOpenedRef.current = null;
        setDesktopGroup(null);
      }
    }
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handleOutsidePointer);
    };
  }, [desktopGroup]);

  function closeMobile() {
    setMobileOpen(false);
    setMobileGroup(null);
  }

  function selectDestination(
    event: MouseEvent<HTMLAnchorElement>,
    destination: SiteDestination,
  ) {
    if (!previewMode) return;
    event.preventDefault();
    onPreviewDestination?.(destination);
    if (!onPreviewDestination) setNotice(previewNotice(destination));
    setDesktopGroup(null);
    closeMobile();
  }

  function destinationAnchor(destination: SiteDestination, className: string) {
    return (
      <a
        key={destination.id}
        href={destination.href}
        className={className}
        onClick={(event) => selectDestination(event, destination)}
        target={destination.id === bookingLink.id && !previewMode ? "_blank" : undefined}
        rel={destination.id === bookingLink.id && !previewMode ? "noopener noreferrer" : undefined}
      >
        <span>{destination.label}</span>
        {destination.description && (
          <span className={styles.description}>{destination.description}</span>
        )}
      </a>
    );
  }

  const activeMobile = navigationGroups.find((group) => group.id === mobileGroup);

  return (
    <header className={styles.header} data-theme="dusk" data-variant="ryze">
      <div className={styles.inner}>
        <a
          href="https://www.get-ryze.ai/"
          className={styles.brand}
          onClick={(event) => selectDestination(event, {
            id: "brand",
            label: "Ryze",
            href: "https://www.get-ryze.ai/",
          })}
          aria-label="Ryze home"
        >
          {brand ?? <span className={styles.wordmark}>Ryze</span>}
        </a>

        <nav
          ref={desktopNavRef}
          className={styles.desktopNavigation}
          aria-label="Primary navigation"
          onMouseLeave={() => {
            hoverOpenedRef.current = null;
            setDesktopGroup(null);
          }}
        >
          {navigationGroups.map((group) => (
            <div
              className={styles.group}
              key={group.id}
              onMouseEnter={() => {
                hoverOpenedRef.current = group.id;
                setDesktopGroup(group.id);
              }}
            >
              <button
                className={styles.navTrigger}
                id={"ryze-trigger-" + group.id}
                type="button"
                aria-expanded={desktopGroup === group.id}
                aria-controls={`ryze-mega-${group.id}`}
                onClick={() => {
                  if (hoverOpenedRef.current === group.id) {
                    hoverOpenedRef.current = null;
                    setDesktopGroup(group.id);
                  } else {
                    setDesktopGroup((current) => current === group.id ? null : group.id);
                  }
                }}
              >
                {group.label}
                <span aria-hidden="true" className={styles.chevron}>⌄</span>
              </button>
              {desktopGroup === group.id && (
                <div className={styles.megaPanel} id={`ryze-mega-${group.id}`}>
                  <span className={styles.megaEyebrow}>Explore {group.label}</span>
                  <div className={styles.megaGrid}>
                    {group.links.map((destination) =>
                      destinationAnchor(destination, styles.megaLink),
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {headerLinks.map((destination) =>
            destinationAnchor(destination, styles.directLink),
          )}
        </nav>

        <div className={styles.actions}>
          {destinationAnchor(bookingLink, styles.booking)}
          <button
            ref={menuTriggerRef}
            type="button"
            className={styles.mobileToggle}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => {
              if (mobileOpen) closeMobile();
              else setMobileOpen(true);
            }}
          >
            <span className={styles.toggleLines} aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.mobileDialog}
        aria-label={activeMobile?.label ?? "Navigation menu"}
        onCancel={(event) => {
          event.preventDefault();
          closeMobile();
        }}
        onClose={closeMobile}
      >
        <div className={styles.mobileBar}>
          {activeMobile ? (
            <button
              className={styles.mobileBack}
              ref={mobileBackRef}
              type="button"
              onClick={() => setMobileGroup(null)}
            >
              <span aria-hidden="true">‹</span> Back
            </button>
          ) : (
            <span className={styles.mobileHeading}>Explore Ryze</span>
          )}
          <button
            className={styles.mobileClose}
            type="button"
            aria-label="Close navigation"
            onClick={closeMobile}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {activeMobile ? (
          <div className={styles.mobileList}>
            <h2 className={styles.mobileSectionTitle}>{activeMobile.label}</h2>
            {activeMobile.links.map((destination) =>
              destinationAnchor(destination, styles.mobileLink),
            )}
          </div>
        ) : (
          <div className={styles.mobileList}>
            {navigationGroups.map((group) => (
              <button
                type="button"
                className={styles.mobileGroup}
                key={group.id}
                onClick={() => setMobileGroup(group.id)}
              >
                <span>{group.label}</span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
            {headerLinks.map((destination) =>
              destinationAnchor(destination, styles.mobileLink),
            )}
            {destinationAnchor(bookingLink, styles.mobileBooking)}
          </div>
        )}
      </dialog>

      <noscript>
        <nav aria-label="All destinations" className={styles.noScriptLinks}>
          {navigationGroups.flatMap((group) => group.links).concat(headerLinks, [bookingLink]).map((link) => (
            <a key={link.id} href={link.href}>{link.label}</a>
          ))}
        </nav>
      </noscript>

      {notice && !onPreviewDestination && (
        <div className={styles.notice} role="status">
          <p>{notice}</p>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button>
        </div>
      )}
    </header>
  );
}
